#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os

# 添加backend目录到Python路径
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend'))

from models import SessionLocal, Platform, ProductCategory, Product
from sqlalchemy import text

def check_current_data():
    """查看当前数据库中的数据"""
    db = SessionLocal()
    try:
        # 查看平台数据
        platforms = db.query(Platform).all()
        print("=== Platform表数据 ===")
        for p in platforms[:10]:
            print(f"ID: {p.id}, Name: {p.name}, Description: {p.description or '无'}, Logo: {p.logo_url or '无'}")
        print(f"\n总共{len(platforms)}个平台")
        
        # 查看分类数据
        categories = db.query(ProductCategory).all()
        print("\n=== Category表数据 ===")
        for c in categories[:10]:
            print(f"ID: {c.id}, Name: {c.name}, Description: {c.description or '无'}")
        print(f"\n总共{len(categories)}个分类")
        
        # 查看商品数据
        products = db.query(Product).all()
        print(f"\n总共{len(products)}个商品")
        
        return platforms, categories, products
    finally:
        db.close()

def update_platform_data():
    """补充平台的描述和logo数据"""
    db = SessionLocal()
    try:
        # 平台数据更新
        platform_updates = {
            'Amazon': {
                'description': '全球最大的电商平台，覆盖全球多个国家和地区，提供丰富的商品类别',
                'logo_url': 'https://logo.clearbit.com/amazon.com'
            },
            'eBay': {
                'description': '全球知名的在线拍卖及购物网站，支持C2C和B2C交易模式',
                'logo_url': 'https://logo.clearbit.com/ebay.com'
            },
            'Walmart': {
                'description': '美国最大的零售商，提供线上线下一体化购物体验',
                'logo_url': 'https://logo.clearbit.com/walmart.com'
            },
            'Shopify': {
                'description': '领先的电商建站平台，为商家提供完整的电商解决方案',
                'logo_url': 'https://logo.clearbit.com/shopify.com'
            },
            'AliExpress': {
                'description': '阿里巴巴旗下跨境电商平台，连接全球买家和中国卖家',
                'logo_url': 'https://logo.clearbit.com/aliexpress.com'
            },
            'Wish': {
                'description': '移动端为主的跨境电商平台，主打低价商品',
                'logo_url': 'https://logo.clearbit.com/wish.com'
            },
            'Etsy': {
                'description': '专注手工艺品和创意商品的电商平台',
                'logo_url': 'https://logo.clearbit.com/etsy.com'
            },
            'Rakuten': {
                'description': '日本最大的电商平台，提供多样化的商品和服务',
                'logo_url': 'https://logo.clearbit.com/rakuten.com'
            },
            'Mercado Libre': {
                'description': '拉丁美洲最大的电商平台，覆盖多个南美国家',
                'logo_url': 'https://logo.clearbit.com/mercadolibre.com'
            },
            'Lazada': {
                'description': '东南亚领先的电商平台，阿里巴巴旗下',
                'logo_url': 'https://logo.clearbit.com/lazada.com'
            },
            'Shopee': {
                'description': '东南亚和台湾地区领先的电商平台',
                'logo_url': 'https://logo.clearbit.com/shopee.com'
            },
            'Flipkart': {
                'description': '印度最大的电商平台之一，沃尔玛旗下',
                'logo_url': 'https://logo.clearbit.com/flipkart.com'
            },
            'Jumia': {
                'description': '非洲领先的电商平台，覆盖多个非洲国家',
                'logo_url': 'https://logo.clearbit.com/jumia.com'
            },
            'Allegro': {
                'description': '波兰最大的电商平台',
                'logo_url': 'https://logo.clearbit.com/allegro.pl'
            },
            'Cdiscount': {
                'description': '法国知名电商平台，提供多样化商品',
                'logo_url': 'https://logo.clearbit.com/cdiscount.com'
            },
            'Otto': {
                'description': '德国第二大电商平台，专注时尚和家居',
                'logo_url': 'https://logo.clearbit.com/otto.de'
            },
            'Zalando': {
                'description': '欧洲领先的时尚电商平台',
                'logo_url': 'https://logo.clearbit.com/zalando.com'
            },
            'Coupang': {
                'description': '韩国最大的电商平台，提供快速配送服务',
                'logo_url': 'https://logo.clearbit.com/coupang.com'
            },
            'Gmarket': {
                'description': '韩国知名电商平台，eBay旗下',
                'logo_url': 'https://logo.clearbit.com/gmarket.co.kr'
            },
            'Tmall Global': {
                'description': '天猫国际，阿里巴巴旗下跨境进口电商平台',
                'logo_url': 'https://logo.clearbit.com/tmall.com'
            },
            'JD.com': {
                'description': '中国第二大电商平台，以自营和物流见长',
                'logo_url': 'https://logo.clearbit.com/jd.com'
            },
            'Pinduoduo': {
                'description': '中国社交电商平台，主打团购模式',
                'logo_url': 'https://logo.clearbit.com/pdd.com'
            },
            'Temu': {
                'description': 'PDD Holdings旗下跨境电商平台',
                'logo_url': 'https://logo.clearbit.com/temu.com'
            },
            'Shein': {
                'description': '全球快时尚跨境电商平台',
                'logo_url': 'https://logo.clearbit.com/shein.com'
            },
            'Catch': {
                'description': '澳大利亚知名电商平台',
                'logo_url': 'https://logo.clearbit.com/catch.com.au'
            },
            'Kogan': {
                'description': '澳大利亚电商平台，主打电子产品',
                'logo_url': 'https://logo.clearbit.com/kogan.com'
            },
            'Noon': {
                'description': '中东地区领先的电商平台',
                'logo_url': 'https://logo.clearbit.com/noon.com'
            },
            'Souq': {
                'description': '中东地区电商平台，亚马逊旗下',
                'logo_url': 'https://logo.clearbit.com/souq.com'
            },
            'Daraz': {
                'description': '南亚地区电商平台，阿里巴巴旗下',
                'logo_url': 'https://logo.clearbit.com/daraz.com'
            },
            'Myntra': {
                'description': '印度时尚电商平台，沃尔玛旗下',
                'logo_url': 'https://logo.clearbit.com/myntra.com'
            }
        }
        
        platforms = db.query(Platform).all()
        updated_count = 0
        
        for platform in platforms:
            if platform.name in platform_updates:
                update_data = platform_updates[platform.name]
                platform.description = update_data['description']
                platform.logo_url = update_data['logo_url']
                updated_count += 1
        
        db.commit()
        print(f"已更新 {updated_count} 个平台的描述和logo")
        
    except Exception as e:
        db.rollback()
        print(f"更新平台数据时出错: {e}")
    finally:
        db.close()

def delete_large_categories_and_reassign():
    """删除前6个大分类，并将关联商品重新分配到细分类别"""
    db = SessionLocal()
    try:
        # 获取前6个分类（通常是大分类）
        large_categories = db.query(ProductCategory).order_by(ProductCategory.id).limit(6).all()
        
        print("准备删除的大分类:")
        for cat in large_categories:
            print(f"ID: {cat.id}, Name: {cat.name}, Description: {cat.description}")
        
        # 分类映射规则（根据商品描述关键词映射到具体分类）
        category_mapping = {
            # 电子产品相关
            '手机': ['智能手机', '手机配件', '移动电源'],
            '电脑': ['笔记本电脑', '台式电脑', '电脑配件'],
            '耳机': ['蓝牙耳机', '有线耳机', '游戏耳机'],
            '音响': ['蓝牙音箱', '智能音箱', 'HiFi音响'],
            
            # 服装相关
            '衣服': ['男装T恤', '女装连衣裙', '童装套装'],
            '鞋子': ['运动鞋', '休闲鞋', '高跟鞋'],
            '包包': ['双肩包', '手提包', '钱包'],
            
            # 家居相关
            '家具': ['沙发椅凳', '床上用品', '收纳整理'],
            '厨具': ['厨房小电器', '餐具茶具', '烘焙用具'],
            '装饰': ['墙面装饰', '桌面摆件', '照明灯具'],
            
            # 美妆相关
            '化妆': ['面部彩妆', '眼部彩妆', '唇部彩妆'],
            '护肤': ['面部护理', '身体护理', '防晒产品'],
            '香水': ['女士香水', '男士香水', '中性香水'],
            
            # 运动相关
            '健身': ['健身器材', '瑜伽用品', '运动营养'],
            '户外': ['户外装备', '露营用品', '登山用品'],
            '球类': ['篮球用品', '足球用品', '网球用品'],
            
            # 母婴相关
            '婴儿': ['婴儿服装', '婴儿用品', '婴儿玩具'],
            '孕妇': ['孕妇装', '孕妇用品', '产后护理'],
            '儿童': ['儿童玩具', '儿童图书', '儿童用品']
        }
        
        # 获取所有细分类别
        all_categories = db.query(ProductCategory).all()
        category_name_to_id = {cat.name: cat.id for cat in all_categories}
        
        # 处理每个大分类下的商品
        for large_cat in large_categories:
            products = db.query(Product).filter(Product.category_id == large_cat.id).all()
            print(f"\n处理分类 '{large_cat.name}' 下的 {len(products)} 个商品")
            
            for product in products:
                # 根据商品名称和描述找到最合适的细分类别
                new_category_id = find_best_category(product, category_name_to_id, category_mapping)
                if new_category_id:
                    product.category_id = new_category_id
                    print(f"商品 '{product.name}' 重新分配到分类ID: {new_category_id}")
                else:
                    # 如果找不到合适的分类，分配到一个默认的细分类别
                    default_category = db.query(ProductCategory).filter(
                        ProductCategory.name == '其他商品'
                    ).first()
                    if default_category:
                        product.category_id = default_category.id
                        print(f"商品 '{product.name}' 分配到默认分类")
        
        # 删除大分类
        for large_cat in large_categories:
            db.delete(large_cat)
        
        db.commit()
        print(f"\n已删除 {len(large_categories)} 个大分类，并重新分配了相关商品")
        
    except Exception as e:
        db.rollback()
        print(f"删除分类和重新分配商品时出错: {e}")
    finally:
        db.close()

def find_best_category(product, category_name_to_id, category_mapping):
    """根据商品信息找到最合适的细分类别"""
    product_text = (product.name + ' ' + (product.description or '')).lower()
    
    # 遍历映射规则
    for keyword, target_categories in category_mapping.items():
        if keyword in product_text:
            # 找到第一个存在的目标分类
            for target_cat in target_categories:
                if target_cat in category_name_to_id:
                    return category_name_to_id[target_cat]
    
    # 如果没有找到匹配的关键词，尝试直接匹配分类名称
    for cat_name, cat_id in category_name_to_id.items():
        if any(word in product_text for word in cat_name.lower().split()):
            return cat_id
    
    return None

if __name__ == "__main__":
    print("开始检查当前数据...")
    check_current_data()
    
    print("\n开始更新平台数据...")
    update_platform_data()
    
    print("\n开始删除大分类并重新分配商品...")
    delete_large_categories_and_reassign()
    
    print("\n操作完成，再次检查数据...")
    check_current_data()