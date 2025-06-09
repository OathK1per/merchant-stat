#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
添加跨境电商平台和产品分类数据
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend'))

from backend.models import Platform, ProductCategory, SessionLocal
from sqlalchemy.exc import IntegrityError

def add_platforms():
    """添加30个全球主要跨境电商平台"""
    platforms_data = [
        # 美国平台
        {"name": "Amazon", "website": "https://www.amazon.com", "description": "全球最大的电商平台，覆盖美国、欧洲、日本等多个站点"},
        {"name": "eBay", "website": "https://www.ebay.com", "description": "全球知名的在线拍卖及购物网站，覆盖190多个国家"},
        {"name": "Walmart", "website": "https://www.walmart.com", "description": "美国最大的零售商，线上电商平台"},
        {"name": "Etsy", "website": "https://www.etsy.com", "description": "专注手工艺品和创意商品的电商平台"},
        {"name": "Wish", "website": "https://www.wish.com", "description": "移动端为主的跨境电商平台，主打低价商品"},
        {"name": "Newegg", "website": "https://www.newegg.com", "description": "专注电子产品和计算机硬件的电商平台"},
        {"name": "Wayfair", "website": "https://www.wayfair.com", "description": "专注家居装饰和家具的电商平台"},
        {"name": "Best Buy", "website": "https://www.bestbuy.com", "description": "美国最大的家用电器和电子产品零售商"},
        
        # 欧洲平台
        {"name": "Otto", "website": "https://www.otto.de", "description": "德国第二大电商平台，主营服装、家具等"},
        {"name": "Zalando", "website": "https://www.zalando.com", "description": "欧洲领先的时尚电商平台"},
        {"name": "Allegro", "website": "https://allegro.pl", "description": "波兰最大的电商平台"},
        {"name": "Cdiscount", "website": "https://www.cdiscount.com", "description": "法国知名电商平台"},
        {"name": "ASOS", "website": "https://www.asos.com", "description": "英国时尚电商平台，面向年轻消费者"},
        {"name": "Fnac", "website": "https://www.fnac.com", "description": "法国综合性电商平台"},
        {"name": "Real.de", "website": "https://www.real.de", "description": "德国综合性电商平台"},
        
        # 日韩平台
        {"name": "Rakuten", "website": "https://www.rakuten.co.jp", "description": "日本最大的电商平台"},
        {"name": "Yahoo Shopping Japan", "website": "https://shopping.yahoo.co.jp", "description": "日本雅虎购物平台"},
        {"name": "Mercari", "website": "https://www.mercari.com", "description": "日本二手商品交易平台"},
        {"name": "Gmarket", "website": "https://www.gmarket.co.kr", "description": "韩国最大的电商平台之一"},
        {"name": "11Street", "website": "https://www.11st.co.kr", "description": "韩国综合性电商平台"},
        
        # 东南亚平台
        {"name": "Shopee", "website": "https://shopee.com", "description": "东南亚领先的电商平台，覆盖多个国家"},
        {"name": "Lazada", "website": "https://www.lazada.com", "description": "东南亚最大的电商平台，阿里巴巴旗下"},
        {"name": "Tokopedia", "website": "https://www.tokopedia.com", "description": "印尼最大的电商平台"},
        {"name": "Bukalapak", "website": "https://www.bukalapak.com", "description": "印尼知名电商平台"},
        
        # 俄罗斯平台
        {"name": "Ozon", "website": "https://www.ozon.ru", "description": "俄罗斯最大的电商平台之一"},
        {"name": "Wildberries", "website": "https://www.wildberries.ru", "description": "俄罗斯领先的时尚电商平台"},
        {"name": "AliExpress Russia", "website": "https://aliexpress.ru", "description": "速卖通俄罗斯站点"},
        
        # 中国平台
        {"name": "AliExpress", "website": "https://www.aliexpress.com", "description": "阿里巴巴旗下全球速卖通平台"},
        {"name": "DHgate", "website": "https://www.dhgate.com", "description": "敦煌网，中国B2B跨境电商平台"},
        {"name": "Alibaba.com", "website": "https://www.alibaba.com", "description": "阿里巴巴国际站，B2B跨境贸易平台"}
    ]
    
    db = SessionLocal()
    try:
        for platform_data in platforms_data:
            # 检查是否已存在
            existing = db.query(Platform).filter(Platform.name == platform_data["name"]).first()
            if not existing:
                platform = Platform(**platform_data)
                db.add(platform)
                print(f"添加平台: {platform_data['name']}")
            else:
                print(f"平台已存在: {platform_data['name']}")
        
        db.commit()
        print(f"\n成功添加 {len(platforms_data)} 个平台数据")
        
    except Exception as e:
        db.rollback()
        print(f"添加平台数据时出错: {e}")
    finally:
        db.close()

def add_categories():
    """添加200个细分产品分类"""
    categories_data = [
        # 电子产品类 (30个)
        "智能手机", "平板电脑", "笔记本电脑", "台式电脑", "游戏主机", "智能手表", "蓝牙耳机", "有线耳机", 
        "无线耳机", "音响设备", "摄像头", "数码相机", "单反相机", "无人机", "充电器", "数据线", "移动电源", 
        "键盘", "鼠标", "显示器", "打印机", "扫描仪", "路由器", "硬盘", "内存卡", "U盘", "电视机", "投影仪", 
        "VR设备", "智能音箱",
        
        # 服装鞋靴类 (25个)
        "男士T恤", "女士T恤", "男士衬衫", "女士衬衫", "牛仔裤", "休闲裤", "运动裤", "连衣裙", "半身裙", 
        "外套夹克", "羽绒服", "毛衣", "卫衣", "内衣内裤", "袜子", "运动鞋", "休闲鞋", "皮鞋", "高跟鞋", 
        "靴子", "拖鞋", "凉鞋", "帽子", "围巾", "手套",
        
        # 家居用品类 (25个)
        "床上用品", "窗帘", "地毯", "沙发", "茶几", "餐桌", "椅子", "衣柜", "书桌", "床垫", "枕头", 
        "台灯", "吊灯", "装饰画", "花瓶", "收纳盒", "垃圾桶", "衣架", "镜子", "钟表", "相框", "植物盆栽", 
        "香薰蜡烛", "抱枕", "毛毯",
        
        # 厨房用品类 (20个)
        "锅具", "刀具", "餐具", "杯子", "盘子", "碗", "筷子", "勺子", "叉子", "砧板", "保鲜盒", "水壶", 
        "咖啡机", "榨汁机", "微波炉", "烤箱", "电饭煲", "豆浆机", "料理机", "厨房秤",
        
        # 美妆个护类 (20个)
        "洗面奶", "爽肤水", "精华液", "面霜", "防晒霜", "面膜", "口红", "粉底液", "眼影", "睫毛膏", 
        "香水", "洗发水", "护发素", "沐浴露", "身体乳", "牙刷", "牙膏", "剃须刀", "化妆刷", "指甲油",
        
        # 运动户外类 (15个)
        "跑步鞋", "篮球鞋", "足球鞋", "运动服", "瑜伽垫", "哑铃", "跑步机", "自行车", "滑板", "帐篷", 
        "睡袋", "登山包", "运动手表", "护膝", "游泳镜",
        
        # 母婴用品类 (15个)
        "婴儿奶粉", "尿不湿", "婴儿车", "儿童安全座椅", "奶瓶", "婴儿服装", "玩具", "积木", "毛绒玩具", 
        "儿童图书", "婴儿床", "高脚椅", "婴儿洗护用品", "儿童鞋", "学步车",
        
        # 汽车用品类 (15个)
        "汽车脚垫", "座椅套", "方向盘套", "车载充电器", "行车记录仪", "车载导航", "汽车香水", "洗车用品", 
        "轮胎", "机油", "车灯", "雨刷器", "汽车贴膜", "后备箱垫", "车载吸尘器",
        
        # 宠物用品类 (10个)
        "狗粮", "猫粮", "宠物玩具", "宠物床", "宠物牵引绳", "宠物笼子", "猫砂", "宠物洗护用品", "宠物服装", "宠物零食",
        
        # 办公用品类 (10个)
        "笔记本", "钢笔", "铅笔", "橡皮", "文件夹", "订书机", "胶带", "便利贴", "计算器", "白板",
        
        # 食品饮料类 (10个)
        "咖啡豆", "茶叶", "蜂蜜", "坚果", "巧克力", "饼干", "果汁", "矿泉水", "调味料", "保健品",
        
        # 图书音像类 (5个)
        "小说", "教材", "漫画", "音乐CD", "电影DVD"
    ]
    
    db = SessionLocal()
    try:
        for category_name in categories_data:
            # 检查是否已存在
            existing = db.query(ProductCategory).filter(ProductCategory.name == category_name).first()
            if not existing:
                category = ProductCategory(name=category_name, description=f"{category_name}相关产品")
                db.add(category)
                print(f"添加分类: {category_name}")
            else:
                print(f"分类已存在: {category_name}")
        
        db.commit()
        print(f"\n成功添加 {len(categories_data)} 个产品分类")
        
    except Exception as e:
        db.rollback()
        print(f"添加分类数据时出错: {e}")
    finally:
        db.close()

def main():
    print("开始添加跨境电商平台和产品分类数据...")
    print("="*50)
    
    # 添加平台数据
    print("\n1. 添加平台数据:")
    add_platforms()
    
    # 添加分类数据
    print("\n2. 添加产品分类数据:")
    add_categories()
    
    print("\n" + "="*50)
    print("数据添加完成！")

if __name__ == "__main__":
    main()