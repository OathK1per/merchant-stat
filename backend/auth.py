from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from pydantic import BaseModel
import os
import random
import string
from io import BytesIO
from captcha.image import ImageCaptcha
from PIL import Image, ImageDraw, ImageFont
import base64

from models import SysUser, CaptchaRecord, get_db
from config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, CAPTCHA_EXPIRE_SECONDS

# 密码哈希工具
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 密码流认证
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

# 令牌模型
class Token(BaseModel):
    access_token: str
    token_type: str

# 令牌数据模型
class TokenData(BaseModel):
    username: Optional[str] = None

# 验证密码
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

# 获取密码哈希
def get_password_hash(password):
    return pwd_context.hash(password)

# 验证用户
def authenticate_user(db: Session, username: str, password: str):
    user = db.query(SysUser).filter(SysUser.username == username).first()
    if not user:
        return False
    if not verify_password(password, user.password):
        return False
    return user

# 创建访问令牌
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# 获取当前用户
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="无效的认证凭据",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = db.query(SysUser).filter(SysUser.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user

# 获取当前活跃用户
async def get_current_active_user(current_user: SysUser = Depends(get_current_user)):
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="用户已被禁用")
    return current_user

# 生成随机验证码
def generate_captcha_code(length=4):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

# 生成验证码图片
def generate_captcha_image(captcha_text):
    # 使用captcha库生成验证码图片
    image = ImageCaptcha(width=160, height=60)
    data = image.generate(captcha_text)
    
    # 转换为base64编码
    buffered = BytesIO()
    img = Image.open(data)
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    
    return img_str

# 创建验证码记录
def create_captcha_record(db: Session, captcha_value: str):
    # 生成随机key
    captcha_key = ''.join(random.choices(string.ascii_lowercase + string.digits, k=20))
    
    # 设置过期时间
    expire_time = datetime.utcnow() + timedelta(seconds=CAPTCHA_EXPIRE_SECONDS)
    
    # 创建记录
    captcha_record = CaptchaRecord(
        captcha_key=captcha_key,
        captcha_value=captcha_value,
        expire_time=expire_time,
        is_used=False
    )
    
    db.add(captcha_record)
    db.commit()
    db.refresh(captcha_record)
    
    return captcha_key

# 验证验证码
def verify_captcha(db: Session, captcha_key: str, captcha_value: str):
    # 查询验证码记录
    record = db.query(CaptchaRecord).filter(
        CaptchaRecord.captcha_key == captcha_key,
        CaptchaRecord.is_used == False,
        CaptchaRecord.expire_time > datetime.utcnow()
    ).first()
    
    if not record:
        return False
    
    # 验证码不区分大小写
    if record.captcha_value.upper() != captcha_value.upper():
        return False
    
    # 标记为已使用
    record.is_used = True
    db.commit()
    
    return True