import pymysql
import secrets
import string
from passlib.context import CryptContext
from config import DB_CONFIG
from models import create_tables, SessionLocal, SysUser, ProductCategory, Platform

# 密码哈希工具
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 创建数据库
def create_database():
    # 连接MySQL服务器（不指定数据库）
    conn = pymysql.connect(
        host=DB_CONFIG["host"],
        port=DB_CONFIG["port"],
        user=DB_CONFIG["user"],
        password=DB_CONFIG["password"]
    )
    
    cursor = conn.cursor()
    
    try:
        # 创建数据库
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_CONFIG['database']} DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        print(f"数据库 {DB_CONFIG['database']} 创建成功或已存在")
    except Exception as e:
        print(f"创建数据库时出错: {e}")
    finally:
        cursor.close()
        conn.close()

# 生成强密码
def generate_strong_password(length=12):
    # 包含字母、数字和特殊字符的强密码
    alphabet = string.ascii_letters + string.digits + string.punctuation
    password = ''.join(secrets.choice(alphabet) for i in range(length))
    return password

# 初始化管理员用户
def init_admin_user():
    db = SessionLocal()
    try:
        # 检查是否已存在管理员用户
        admin = db.query(SysUser).filter(SysUser.username == "admin").first()
        if not admin:
            # 创建管理员用户，使用更安全的密码
            admin_password = "Admin@123456"  # 预设的更强密码
            hashed_password = pwd_context.hash(admin_password)
            admin_user = SysUser(
                username="admin",
                password=hashed_password,
                email="admin@example.com",
                full_name="系统管理员",
                is_active=True,
                is_admin=True
            )
            db.add(admin_user)
            db.commit()
            print(f"管理员用户创建成功，初始密码: {admin_password}")
        else:
            print("管理员用户已存在")
    except Exception as e:
        db.rollback()
        print(f"初始化管理员用户时出错: {e}")
    finally:
        db.close()

# 初始化商品分类
def init_categories():
    db = SessionLocal()
    try:
        # 检查是否已存在分类
        category_count = db.query(ProductCategory).count()
        if category_count == 0:
            # 创建默认分类
            categories = [
                ProductCategory(name="电子产品", description="手机、电脑、平板等电子设备"),
                ProductCategory(name="服装鞋帽", description="衣服、鞋子、帽子等服饰"),
                ProductCategory(name="家居用品", description="家具、装饰品等家居用品"),
                ProductCategory(name="美妆护肤", description="化妆品、护肤品等美容产品"),
                ProductCategory(name="食品饮料", description="食品、饮料、零食等"),
                ProductCategory(name="其他", description="其他类别商品")
            ]
            db.add_all(categories)
            db.commit()
            print("默认商品分类创建成功")
        else:
            print("商品分类已存在")
    except Exception as e:
        db.rollback()
        print(f"初始化商品分类时出错: {e}")
    finally:
        db.close()

# 初始化电商平台
def init_platforms():
    db = SessionLocal()
    try:
        # 检查是否已存在平台
        platform_count = db.query(Platform).count()
        if platform_count == 0:
            # 创建默认平台
            platforms = [
                Platform(name="Amazon", website="https://www.amazon.com", logo_url="/images/amazon_logo.png"),
                Platform(name="eBay", website="https://www.ebay.com", logo_url="/images/ebay_logo.png"),
                Platform(name="AliExpress", website="https://www.aliexpress.com", logo_url="/images/aliexpress_logo.png"),
                Platform(name="Wish", website="https://www.wish.com", logo_url="/images/wish_logo.png"),
                Platform(name="Shopee", website="https://shopee.com", logo_url="/images/shopee_logo.png"),
                Platform(name="Lazada", website="https://www.lazada.com", logo_url="/images/lazada_logo.png")
            ]
            db.add_all(platforms)
            db.commit()
            print("默认电商平台创建成功")
        else:
            print("电商平台已存在")
    except Exception as e:
        db.rollback()
        print(f"初始化电商平台时出错: {e}")
    finally:
        db.close()

# 主函数
def init_database():
    print("开始初始化数据库...")
    create_database()
    create_tables()
    init_admin_user()
    init_categories()
    init_platforms()
    print("数据库初始化完成")

if __name__ == "__main__":
    init_database()