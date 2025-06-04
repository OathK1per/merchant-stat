from models import get_db, Product, ProductCategory, Platform
from sqlalchemy.orm import Session
from datetime import datetime
import json

# 获取数据库会话
db = next(get_db())

# 检查是否有分类和平台数据
categories = db.query(ProductCategory).all()
platforms = db.query(Platform).all()

if not categories:
    print('没有找到分类数据，创建默认分类')
    default_category = ProductCategory(name='电子产品', description='各类电子设备和配件')
    db.add(default_category)
    db.commit()
    db.refresh(default_category)
    categories = [default_category]

if not platforms:
    print('没有找到平台数据，创建默认平台')
    default_platform = Platform(name='Amazon', website='https://www.amazon.com', logo_url='https://example.com/amazon_logo.png', description='亚马逊全球电商平台')
    db.add(default_platform)
    db.commit()
    db.refresh(default_platform)
    platforms = [default_platform]

# 创建测试商品数据
products = [
    Product(
        name='iPhone 13 Pro', 
        url='https://www.amazon.com/Apple-iPhone-13-Pro-128GB/dp/B09G9HD6PD', 
        price=999.0, 
        currency='USD', 
        sales_count=1500, 
        image_url='https://m.media-amazon.com/images/I/61jLiCovxVL._AC_SL1500_.jpg', 
        description='Apple iPhone 13 Pro with A15 Bionic chip', 
        specifications=json.dumps({'color': 'Graphite', 'storage': '128GB'}), 
        category_id=categories[0].id, 
        platform_id=platforms[0].id, 
        created_at=datetime.now(), 
        updated_at=datetime.now()
    ),
    Product(
        name='Samsung Galaxy S21', 
        url='https://www.amazon.com/Samsung-Galaxy-5G-Unlocked-Smartphone/dp/B08N3BYNDN', 
        price=799.0, 
        currency='USD', 
        sales_count=1200, 
        image_url='https://m.media-amazon.com/images/I/61jLiCovxVL._AC_SL1500_.jpg', 
        description='Samsung Galaxy S21 5G smartphone', 
        specifications=json.dumps({'color': 'Phantom Gray', 'storage': '256GB'}), 
        category_id=categories[0].id, 
        platform_id=platforms[0].id, 
        created_at=datetime.now(), 
        updated_at=datetime.now()
    ),
    Product(
        name='Sony WH-1000XM4', 
        url='https://www.amazon.com/Sony-WH-1000XM4-Canceling-Headphones-phone-call/dp/B0863TXGM3', 
        price=349.0, 
        currency='USD', 
        sales_count=2000, 
        image_url='https://m.media-amazon.com/images/I/71o8Q5XJS5L._AC_SL1500_.jpg', 
        description='Sony Noise Cancelling Headphones', 
        specifications=json.dumps({'color': 'Black', 'battery': '30 hours'}), 
        category_id=categories[0].id, 
        platform_id=platforms[0].id, 
        created_at=datetime.now(), 
        updated_at=datetime.now()
    ),
    Product(
        name='Logitech MX Master 3', 
        url='https://www.amazon.com/Logitech-Master-Advanced-Wireless-Mouse/dp/B07S395RWD', 
        price=99.0, 
        currency='USD', 
        sales_count=3000, 
        image_url='https://m.media-amazon.com/images/I/614w3LuZTYL._AC_SL1500_.jpg', 
        description='Advanced Wireless Mouse for Mac and PC', 
        specifications=json.dumps({'color': 'Graphite', 'connectivity': 'Bluetooth'}), 
        category_id=categories[0].id, 
        platform_id=platforms[0].id, 
        created_at=datetime.now(), 
        updated_at=datetime.now()
    ),
    Product(
        name='Dell XPS 13', 
        url='https://www.amazon.com/Dell-InfinityEdge-Display-i7-1195G7-Thunderbolt/dp/B09FXFD7BY', 
        price=1299.0, 
        currency='USD', 
        sales_count=800, 
        image_url='https://m.media-amazon.com/images/I/71RK6+rx-xL._AC_SL1500_.jpg', 
        description='Dell XPS 13 9310 Laptop', 
        specifications=json.dumps({'processor': 'Intel i7', 'ram': '16GB', 'storage': '512GB SSD'}), 
        category_id=categories[0].id, 
        platform_id=platforms[0].id, 
        created_at=datetime.now(), 
        updated_at=datetime.now()
    )
]

# 添加到数据库
db.add_all(products)
db.commit()

print(f'成功添加了 {len(products)} 条商品数据')