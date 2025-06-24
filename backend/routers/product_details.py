from fastapi import APIRouter, Query, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_, asc, desc, cast, Float, Integer
from typing import List, Optional
from models import ProductDetail, ProductDetailSchema
from models import get_db

router = APIRouter(prefix="/product-details", tags=["产品详情"])

@router.get("", response_model=dict)
def get_product_details(
    page: int = Query(1, ge=1, description="页码"),
    pageSize: int = Query(20, ge=1, le=100, description="每页数量"),
    search: Optional[str] = Query(None, description="搜索关键词"),
    sortField: Optional[str] = Query(None, description="排序字段"),
    sortOrder: Optional[str] = Query(None, description="排序方向: ascend 或 descend"),
    db: Session = Depends(get_db)
):
    """获取产品详情列表"""
    query = db.query(ProductDetail)
    
    # 搜索功能
    if search:
        query = query.filter(
            or_(
                ProductDetail.img_text.ilike(f"%{search}%"),
                ProductDetail.item_code.ilike(f"%{search}%")
            )
        )
    
    # 排序功能
    if sortField and sortOrder:
        if hasattr(ProductDetail, sortField):
            sort_column = getattr(ProductDetail, sortField)
            
            # 对于数字字段，需要转换为数值类型进行排序
            if sortField == "org_price":
                # 将字符串价格转换为浮点数进行排序，处理空值和非数字值
                sort_column = cast(sort_column, Float)
            elif sortField == "recentlysold":
                # 将字符串销量转换为整数进行排序，处理空值和非数字值
                sort_column = cast(sort_column, Integer)
            
            if sortOrder == "ascend":
                query = query.order_by(asc(sort_column))
            elif sortOrder == "descend":
                query = query.order_by(desc(sort_column))
    
    # 获取总数
    total = query.count()
    
    # 分页
    skip = (page - 1) * pageSize
    product_details = query.offset(skip).limit(pageSize).all()
    
    # 使用ProductDetailSchema序列化数据
    serialized_data = [ProductDetailSchema.from_orm(detail) for detail in product_details]
    
    return {
        "data": serialized_data,
        "total": total,
        "page": page,
        "pageSize": pageSize
    }

@router.get("/{item_code}", response_model=ProductDetailSchema)
def get_product_detail_by_code(item_code: str, db: Session = Depends(get_db)):
    """根据商品代码获取产品详情"""
    product_detail = db.query(ProductDetail).filter(ProductDetail.item_code == item_code).first()
    if not product_detail:
        raise HTTPException(status_code=404, detail="Product detail not found")
    return product_detail