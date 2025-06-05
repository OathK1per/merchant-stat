from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, Boolean, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
from config import DATABASE_URL
import datetime

# 创建数据库引擎，添加连接池配置
engine = create_engine(
    DATABASE_URL,
    pool_size=10,  # 连接池大小
    max_overflow=20,  # 超过连接池大小外最多创建的连接
    pool_timeout=30,  # 池中没有连接最多等待的秒数
    pool_recycle=1800,  # 连接重置周期，默认-1，推荐设置为小于数据库超时时间
    pool_pre_ping=True,  # 每次连接前检测连接是否有效
    echo=False  # 是否打印SQL语句，生产环境设为False
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 获取数据库会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 用户表
class SysUser(Base):
    __tablename__ = "sys_user"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password = Column(String(100), nullable=False)  # 存储哈希后的密码
    email = Column(String(100), unique=True, index=True)
    full_name = Column(String(100))
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    last_login = Column(DateTime, default=None, nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

# 商品分类表
class ProductCategory(Base):
    __tablename__ = "product_category"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # 关联商品
    products = relationship("Product", back_populates="category")

# 电商平台表
class Platform(Base):
    __tablename__ = "platform"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), nullable=False)
    website = Column(String(255), nullable=False)
    logo_url = Column(String(255), nullable=True)
    description = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # 关联商品
    products = relationship("Product", back_populates="platform")

# 商品表
class Product(Base):
    __tablename__ = "product"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False, index=True)
    url = Column(String(512), nullable=False)
    price = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    sales_count = Column(Integer, default=0)  # 销量
    image_url = Column(String(512), nullable=True)  # 商品图片URL
    description = Column(Text, nullable=True)  # 商品描述
    specifications = Column(Text, nullable=True)  # 商品规格参数，JSON格式
    
    # 外键关联
    category_id = Column(Integer, ForeignKey("product_category.id"))
    platform_id = Column(Integer, ForeignKey("platform.id"))
    
    # 关系
    category = relationship("ProductCategory", back_populates="products")
    platform = relationship("Platform", back_populates="products")
    
    # 时间戳
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

# 系统通知表
class Notification(Base):
    __tablename__ = "notification"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(100), nullable=False)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey("sys_user.id"))
    created_at = Column(DateTime, default=func.now())

# 验证码记录表
class CaptchaRecord(Base):
    __tablename__ = "captcha_record"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    captcha_key = Column(String(50), nullable=False, index=True)
    captcha_value = Column(String(10), nullable=False)
    expire_time = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=func.now())

# 创建所有表
def create_tables():
    Base.metadata.create_all(bind=engine)