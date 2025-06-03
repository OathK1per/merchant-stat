from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from models import get_db, Platform, SysUser
from auth import get_current_active_user

router = APIRouter(prefix="/api/platforms", tags=["电商平台"])

# 平台基础模型
class PlatformBase(BaseModel):
    name: str
    website: str
    logo_url: Optional[str] = None
    description: Optional[str] = None

# 创建平台请求模型
class PlatformCreate(PlatformBase):
    pass

# 平台响应模型
class PlatformResponse(PlatformBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

# 获取所有平台
@router.get("", response_model=List[PlatformResponse])
async def get_platforms(
    db: Session = Depends(get_db),
    current_user: SysUser = Depends(get_current_active_user)
):
    platforms = db.query(Platform).all()
    return platforms

# 获取单个平台
@router.get("/{platform_id}", response_model=PlatformResponse)
async def get_platform(
    platform_id: int,
    db: Session = Depends(get_db),
    current_user: SysUser = Depends(get_current_active_user)
):
    platform = db.query(Platform).filter(Platform.id == platform_id).first()
    if not platform:
        raise HTTPException(status_code=404, detail="平台不存在")
    return platform

# 创建平台
@router.post("", response_model=PlatformResponse, status_code=status.HTTP_201_CREATED)
async def create_platform(
    platform_data: PlatformCreate,
    db: Session = Depends(get_db),
    current_user: SysUser = Depends(get_current_active_user)
):
    # 检查平台名称是否已存在
    existing_platform = db.query(Platform).filter(Platform.name == platform_data.name).first()
    if existing_platform:
        raise HTTPException(status_code=400, detail="平台名称已存在")
    
    # 创建平台
    platform = Platform(
        name=platform_data.name,
        website=platform_data.website,
        logo_url=platform_data.logo_url,
        description=platform_data.description
    )
    
    db.add(platform)
    db.commit()
    db.refresh(platform)
    
    return platform

# 更新平台
@router.put("/{platform_id}", response_model=PlatformResponse)
async def update_platform(
    platform_id: int,
    platform_data: PlatformCreate,
    db: Session = Depends(get_db),
    current_user: SysUser = Depends(get_current_active_user)
):
    # 检查平台是否存在
    platform = db.query(Platform).filter(Platform.id == platform_id).first()
    if not platform:
        raise HTTPException(status_code=404, detail="平台不存在")
    
    # 检查平台名称是否已存在（排除当前平台）
    existing_platform = db.query(Platform).filter(
        Platform.name == platform_data.name,
        Platform.id != platform_id
    ).first()
    if existing_platform:
        raise HTTPException(status_code=400, detail="平台名称已存在")
    
    # 更新平台
    platform.name = platform_data.name
    platform.website = platform_data.website
    platform.logo_url = platform_data.logo_url
    platform.description = platform_data.description
    
    db.commit()
    db.refresh(platform)
    
    return platform

# 删除平台
@router.delete("/{platform_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_platform(
    platform_id: int,
    db: Session = Depends(get_db),
    current_user: SysUser = Depends(get_current_active_user)
):
    # 检查平台是否存在
    platform = db.query(Platform).filter(Platform.id == platform_id).first()
    if not platform:
        raise HTTPException(status_code=404, detail="平台不存在")
    
    # 检查平台是否被商品使用
    if platform.products and len(platform.products) > 0:
        raise HTTPException(status_code=400, detail="平台已被商品使用，无法删除")
    
    # 删除平台
    db.delete(platform)
    db.commit()
    
    return {"status": "success"}