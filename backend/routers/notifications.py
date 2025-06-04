from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from models import get_db, Notification, SysUser
from auth import get_current_active_user

router = APIRouter(prefix="/notifications", tags=["通知"])

# 通知基础模型
class NotificationBase(BaseModel):
    title: str
    content: str
    is_read: bool = False

# 创建通知请求模型
class NotificationCreate(NotificationBase):
    user_id: int

# 通知响应模型
class NotificationResponse(NotificationBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        orm_mode = True

# 获取当前用户的通知
@router.get("", response_model=List[NotificationResponse])
async def get_notifications(
    is_read: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: SysUser = Depends(get_current_active_user)
):
    # 构建查询
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    
    # 应用筛选条件
    if is_read is not None:
        query = query.filter(Notification.is_read == is_read)
    
    # 排序并获取结果
    notifications = query.order_by(desc(Notification.created_at)).all()
    
    return notifications

# 获取单个通知
@router.get("/{notification_id}", response_model=NotificationResponse)
async def get_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: SysUser = Depends(get_current_active_user)
):
    # 查询通知
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="通知不存在")
    
    return notification

# 创建通知（仅管理员可用）
@router.post("", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
async def create_notification(
    notification_data: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: SysUser = Depends(get_current_active_user)
):
    # 检查当前用户是否为管理员
    if not current_user.is_admin:
        raise HTTPException(status_code=403, detail="只有管理员可以创建通知")
    
    # 检查目标用户是否存在
    target_user = db.query(SysUser).filter(SysUser.id == notification_data.user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="目标用户不存在")
    
    # 创建通知
    notification = Notification(
        title=notification_data.title,
        content=notification_data.content,
        is_read=notification_data.is_read,
        user_id=notification_data.user_id
    )
    
    db.add(notification)
    db.commit()
    db.refresh(notification)
    
    return notification

# 标记通知为已读
@router.put("/{notification_id}/read", response_model=NotificationResponse)
async def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: SysUser = Depends(get_current_active_user)
):
    # 查询通知
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="通知不存在")
    
    # 标记为已读
    notification.is_read = True
    
    db.commit()
    db.refresh(notification)
    
    return notification

# 标记所有通知为已读
@router.put("/read-all", status_code=status.HTTP_200_OK)
async def mark_all_notifications_as_read(
    db: Session = Depends(get_db),
    current_user: SysUser = Depends(get_current_active_user)
):
    # 查询所有未读通知
    unread_notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).all()
    
    # 标记为已读
    for notification in unread_notifications:
        notification.is_read = True
    
    db.commit()
    
    return {"status": "success", "count": len(unread_notifications)}

# 删除通知
@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: SysUser = Depends(get_current_active_user)
):
    # 查询通知
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="通知不存在")
    
    # 删除通知
    db.delete(notification)
    db.commit()
    
    return {"status": "success"}