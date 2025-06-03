from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from models import get_db, ProductCategory, SysUser
from auth import get_current_active_user

router = APIRouter(prefix="/api/categories", tags=["商品分类"])

# 分类基础模型
class CategoryBase(BaseModel):
    name: str
    description: Optional[str] = None

# 创建分类请求模型
class CategoryCreate(CategoryBase):
    pass

# 分类响应模型
class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

# 获取所有分类
@router.get("", response_model=List[CategoryResponse])
async def get_categories(
    db: Session = Depends(get_db),
    current_user: SysUser = Depends(get_current_active_user)
):
    categories = db.query(ProductCategory).all()
    return categories

# 获取单个分类
@router.get("/{category_id}", response_model=CategoryResponse)
async def get_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: SysUser = Depends(get_current_active_user)
):
    category = db.query(ProductCategory).filter(ProductCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="分类不存在")
    return category

# 创建分类
@router.post("", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category(
    category_data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: SysUser = Depends(get_current_active_user)
):
    # 检查分类名称是否已存在
    existing_category = db.query(ProductCategory).filter(ProductCategory.name == category_data.name).first()
    if existing_category:
        raise HTTPException(status_code=400, detail="分类名称已存在")
    
    # 创建分类
    category = ProductCategory(
        name=category_data.name,
        description=category_data.description
    )
    
    db.add(category)
    db.commit()
    db.refresh(category)
    
    return category

# 更新分类
@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: int,
    category_data: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: SysUser = Depends(get_current_active_user)
):
    # 检查分类是否存在
    category = db.query(ProductCategory).filter(ProductCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="分类不存在")
    
    # 检查分类名称是否已存在（排除当前分类）
    existing_category = db.query(ProductCategory).filter(
        ProductCategory.name == category_data.name,
        ProductCategory.id != category_id
    ).first()
    if existing_category:
        raise HTTPException(status_code=400, detail="分类名称已存在")
    
    # 更新分类
    category.name = category_data.name
    category.description = category_data.description
    
    db.commit()
    db.refresh(category)
    
    return category

# 删除分类
@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: int,
    db: Session = Depends(get_db),
    current_user: SysUser = Depends(get_current_active_user)
):
    # 检查分类是否存在
    category = db.query(ProductCategory).filter(ProductCategory.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="分类不存在")
    
    # 检查分类是否被商品使用
    if category.products and len(category.products) > 0:
        raise HTTPException(status_code=400, detail="分类已被商品使用，无法删除")
    
    # 删除分类
    db.delete(category)
    db.commit()
    
    return {"status": "success"}