from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel

from models import get_db, SysUser
from auth import (
    authenticate_user, create_access_token, get_current_active_user,
    generate_captcha_code, generate_captcha_image, create_captcha_record, verify_captcha
)

router = APIRouter(prefix="/api/auth", tags=["认证"])

# 登录请求模型
class LoginRequest(BaseModel):
    username: str
    password: str
    captcha_key: str
    captcha_value: str

# 登录响应模型
class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    username: str
    full_name: Optional[str] = None
    is_admin: bool
    last_login: Optional[datetime] = None

# 验证码响应模型
class CaptchaResponse(BaseModel):
    captcha_key: str
    captcha_image: str  # Base64编码的图片

# 用户信息模型
class UserInfo(BaseModel):
    id: int
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    is_admin: bool
    last_login: Optional[datetime] = None

# 生成验证码
@router.get("/captcha", response_model=CaptchaResponse)
async def get_captcha(db: Session = Depends(get_db)):
    # 生成验证码文本
    captcha_text = generate_captcha_code()
    
    # 生成验证码图片
    captcha_image = generate_captcha_image(captcha_text)
    
    # 保存验证码记录
    captcha_key = create_captcha_record(db, captcha_text)
    
    return CaptchaResponse(
        captcha_key=captcha_key,
        captcha_image=captcha_image
    )

# 用户登录
@router.post("/login", response_model=LoginResponse)
async def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    # 验证验证码
    if not verify_captcha(db, login_data.captcha_key, login_data.captcha_value):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="验证码错误或已过期"
        )
    
    # 验证用户名和密码
    user = authenticate_user(db, login_data.username, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 更新最后登录时间
    user.last_login = datetime.utcnow()
    db.commit()
    
    # 生成访问令牌
    access_token_expires = timedelta(minutes=60 * 24)  # 24小时
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return LoginResponse(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        username=user.username,
        full_name=user.full_name,
        is_admin=user.is_admin,
        last_login=user.last_login
    )

# 获取当前用户信息
@router.get("/me", response_model=UserInfo)
async def read_users_me(current_user: SysUser = Depends(get_current_active_user)):
    return UserInfo(
        id=current_user.id,
        username=current_user.username,
        email=current_user.email,
        full_name=current_user.full_name,
        is_admin=current_user.is_admin,
        last_login=current_user.last_login
    )