from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
import json
from datetime import datetime

from models import get_db, Product, ProductCategory, Platform, SysUser
from auth import get_current_active_user
from scraper import scrape_product_from_url

router = APIRouter(prefix="/products", tags=["商品"])

# 商品基础模型
class ProductBase(BaseModel):
    name: str
    url: str
    price: float
    currency: str = "USD"
    sales_count: int = 0
    image_url: Optional[str] = None
    description: Optional[str] = None
    specifications: Optional[Dict[str, Any]] = None
    category_id: int
    platform_id: int

# 创建商品请求模型
class ProductCreate(ProductBase):
    pass

# 批量创建商品请求模型
class BulkProductCreate(BaseModel):
    products: List[ProductCreate]

# 商品响应模型
class ProductResponse(ProductBase):
    id: int
    category_name: str
    platform_name: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

# 商品列表响应模型
class ProductListResponse(BaseModel):
    total: int
    items: List[ProductResponse]

# 商品筛选参数模型
class ProductFilterParams(BaseModel):
    category_id: Optional[int] = None
    platform_id: Optional[int] = None
    name: Optional[str] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None

# 从URL抓取商品请求模型
class ScrapeProductRequest(BaseModel):
    url: str

# 获取商品列表
@router.get("", response_model=ProductListResponse)
async def get_products(
    skip: int = 0,
    limit: int = 10,
    category_id: Optional[int] = None,
    platform_id: Optional[int] = None,
    name: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_field: Optional[str] = None,
    sort_order: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: SysUser = Depends(get_current_active_user)
):
    # 构建查询
    query = db.query(Product)
    
    # 应用筛选条件
    if category_id is not None:
        query = query.filter(Product.category_id == category_id)
    
    if platform_id is not None:
        query = query.filter(Product.platform_id == platform_id)
    
    if name is not None and name.strip():
        query = query.filter(Product.name.ilike(f"%{name}%"))
    
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    
    # 获取总数
    total = query.count()
    
    # 排序并分页
    if sort_field and sort_order:
        # 根据排序字段和排序方式进行排序
        if sort_field == 'name':
            query = query.order_by(Product.name.asc() if sort_order == 'ascend' else Product.name.desc())
        elif sort_field == 'price':
            query = query.order_by(Product.price.asc() if sort_order == 'ascend' else Product.price.desc())
        elif sort_field == 'sales':
            query = query.order_by(Product.sales_count.asc() if sort_order == 'ascend' else Product.sales_count.desc())
        elif sort_field == 'updated_at':
            query = query.order_by(Product.updated_at.asc() if sort_order == 'ascend' else Product.updated_at.desc())
        else:
            # 默认按更新时间降序排序
            query = query.order_by(Product.updated_at.desc())
    else:
        # 默认按更新时间降序排序
        query = query.order_by(Product.updated_at.desc())
    
    items = query.offset(skip).limit(limit).all()
    
    # 构建响应
    result_items = []
    for item in items:
        result_items.append(ProductResponse(
            id=item.id,
            name=item.name,
            url=item.url,
            price=item.price,
            currency=item.currency,
            sales_count=item.sales_count,
            image_url=item.image_url,
            description=item.description,
            specifications=json.loads(item.specifications) if item.specifications else {},
            category_id=item.category_id,
            platform_id=item.platform_id,
            category_name=item.category.name if item.category else "",
            platform_name=item.platform.name if item.platform else "",
            created_at=item.created_at,
            updated_at=item.updated_at
        ))
    
    return ProductListResponse(total=total, items=result_items)

# 获取单个商品
@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: SysUser = Depends(get_current_active_user)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="商品不存在")
    
    return ProductResponse(
        id=product.id,
        name=product.name,
        url=product.url,
        price=product.price,
        currency=product.currency,
        sales_count=product.sales_count,
        image_url=product.image_url,
        description=product.description,
        specifications=json.loads(product.specifications) if product.specifications else {},
        category_id=product.category_id,
        platform_id=product.platform_id,
        category_name=product.category.name if product.category else "",
        platform_name=product.platform.name if product.platform else "",
        created_at=product.created_at,
        updated_at=product.updated_at
    )

# 创建商品
@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: SysUser = Depends(get_current_active_user)
):
    # 检查分类是否存在
    category = db.query(ProductCategory).filter(ProductCategory.id == product_data.category_id).first()
    if not category:
        raise HTTPException(status_code=400, detail="分类不存在")
    
    # 检查平台是否存在
    platform = db.query(Platform).filter(Platform.id == product_data.platform_id).first()
    if not platform:
        raise HTTPException(status_code=400, detail="平台不存在")
    
    # 创建商品
    product = Product(
        name=product_data.name,
        url=product_data.url,
        price=product_data.price,
        currency=product_data.currency,
        sales_count=product_data.sales_count,
        image_url=product_data.image_url,
        description=product_data.description,
        specifications=json.dumps(product_data.specifications) if product_data.specifications else None,
        category_id=product_data.category_id,
        platform_id=product_data.platform_id
    )
    
    db.add(product)
    db.commit()
    db.refresh(product)
    
    return ProductResponse(
        id=product.id,
        name=product.name,
        url=product.url,
        price=product.price,
        currency=product.currency,
        sales_count=product.sales_count,
        image_url=product.image_url,
        description=product.description,
        specifications=product_data.specifications or {},
        category_id=product.category_id,
        platform_id=product.platform_id,
        category_name=category.name,
        platform_name=platform.name,
        created_at=product.created_at,
        updated_at=product.updated_at
    )

# 批量创建商品
@router.post("/bulk", response_model=List[ProductResponse], status_code=status.HTTP_201_CREATED)
async def create_products_bulk(
    bulk_data: BulkProductCreate,
    db: Session = Depends(get_db),
    current_user: SysUser = Depends(get_current_active_user)
):
    # 检查所有分类和平台是否存在
    category_ids = set(product.category_id for product in bulk_data.products)
    platform_ids = set(product.platform_id for product in bulk_data.products)
    
    categories = db.query(ProductCategory).filter(ProductCategory.id.in_(category_ids)).all()
    platforms = db.query(Platform).filter(Platform.id.in_(platform_ids)).all()
    
    if len(categories) != len(category_ids):
        raise HTTPException(status_code=400, detail="部分分类不存在")
    
    if len(platforms) != len(platform_ids):
        raise HTTPException(status_code=400, detail="部分平台不存在")
    
    # 创建商品列表
    products = []
    for product_data in bulk_data.products:
        product = Product(
            name=product_data.name,
            url=product_data.url,
            price=product_data.price,
            currency=product_data.currency,
            sales_count=product_data.sales_count,
            image_url=product_data.image_url,
            description=product_data.description,
            specifications=json.dumps(product_data.specifications) if product_data.specifications else None,
            category_id=product_data.category_id,
            platform_id=product_data.platform_id
        )
        db.add(product)
        products.append(product)
    
    db.commit()
    
    # 构建响应
    result = []
    category_map = {category.id: category for category in categories}
    platform_map = {platform.id: platform for platform in platforms}
    
    for product in products:
        result.append(ProductResponse(
            id=product.id,
            name=product.name,
            url=product.url,
            price=product.price,
            currency=product.currency,
            sales_count=product.sales_count,
            image_url=product.image_url,
            description=product.description,
            specifications=json.loads(product.specifications) if product.specifications else {},
            category_id=product.category_id,
            platform_id=product.platform_id,
            category_name=category_map[product.category_id].name,
            platform_name=platform_map[product.platform_id].name,
            created_at=product.created_at,
            updated_at=product.updated_at
        ))
    
    return result

# 从URL抓取商品
@router.post("/scrape", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def scrape_product(
    scrape_data: ScrapeProductRequest,
    db: Session = Depends(get_db),
    current_user: SysUser = Depends(get_current_active_user)
):
    # 抓取商品信息
    product_data = scrape_product_from_url(scrape_data.url)
    if not product_data:
        raise HTTPException(status_code=400, detail="无法从URL抓取商品信息")
    
    # 查找或创建平台
    platform = db.query(Platform).filter(Platform.name == product_data.platform_name).first()
    if not platform:
        platform = Platform(name=product_data.platform_name, website="")
        db.add(platform)
        db.commit()
        db.refresh(platform)
    
    # 查找或创建分类
    category = db.query(ProductCategory).filter(ProductCategory.name == product_data.category_name).first()
    if not category:
        category = ProductCategory(name=product_data.category_name)
        db.add(category)
        db.commit()
        db.refresh(category)
    
    # 创建商品
    product = Product(
        name=product_data.name,
        url=product_data.url,
        price=product_data.price,
        currency=product_data.currency,
        sales_count=product_data.sales_count,
        image_url=product_data.image_url,
        description=product_data.description,
        specifications=json.dumps(product_data.specifications) if product_data.specifications else None,
        category_id=category.id,
        platform_id=platform.id
    )
    
    db.add(product)
    db.commit()
    db.refresh(product)
    
    return ProductResponse(
        id=product.id,
        name=product.name,
        url=product.url,
        price=product.price,
        currency=product.currency,
        sales_count=product.sales_count,
        image_url=product.image_url,
        description=product.description,
        specifications=product_data.specifications or {},
        category_id=product.category_id,
        platform_id=product.platform_id,
        category_name=category.name,
        platform_name=platform.name,
        created_at=product.created_at,
        updated_at=product.updated_at
    )

# 更新商品
@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_data: ProductCreate,
    db: Session = Depends(get_db),
    current_user: SysUser = Depends(get_current_active_user)
):
    # 检查商品是否存在
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="商品不存在")
    
    # 检查分类是否存在
    category = db.query(ProductCategory).filter(ProductCategory.id == product_data.category_id).first()
    if not category:
        raise HTTPException(status_code=400, detail="分类不存在")
    
    # 检查平台是否存在
    platform = db.query(Platform).filter(Platform.id == product_data.platform_id).first()
    if not platform:
        raise HTTPException(status_code=400, detail="平台不存在")
    
    # 更新商品
    product.name = product_data.name
    product.url = product_data.url
    product.price = product_data.price
    product.currency = product_data.currency
    product.sales_count = product_data.sales_count
    product.image_url = product_data.image_url
    product.description = product_data.description
    product.specifications = json.dumps(product_data.specifications) if product_data.specifications else None
    product.category_id = product_data.category_id
    product.platform_id = product_data.platform_id
    
    db.commit()
    db.refresh(product)
    
    return ProductResponse(
        id=product.id,
        name=product.name,
        url=product.url,
        price=product.price,
        currency=product.currency,
        sales_count=product.sales_count,
        image_url=product.image_url,
        description=product.description,
        specifications=product_data.specifications or {},
        category_id=product.category_id,
        platform_id=product.platform_id,
        category_name=category.name,
        platform_name=platform.name,
        created_at=product.created_at,
        updated_at=product.updated_at
    )

# 删除商品
@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: SysUser = Depends(get_current_active_user)
):
    # 检查商品是否存在
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="商品不存在")
    
    # 删除商品
    db.delete(product)
    db.commit()
    
    return {"status": "success"}