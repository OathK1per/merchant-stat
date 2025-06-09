#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import os

# 添加backend目录到Python路径
sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend'))

from models import SessionLocal, Platform

def update_remaining_logos():
    """补充剩余平台的logo数据"""
    db = SessionLocal()
    try:
        # 获取所有平台
        platforms = db.query(Platform).all()
        
        # 更多平台的logo映射
        additional_logos = {
            'Newegg': 'https://logo.clearbit.com/newegg.com',
            'Wayfair': 'https://logo.clearbit.com/wayfair.com',
            'Target': 'https://logo.clearbit.com/target.com',
            'Best Buy': 'https://logo.clearbit.com/bestbuy.com',
            'Home Depot': 'https://logo.clearbit.com/homedepot.com',
            'Costco': 'https://logo.clearbit.com/costco.com',
            'Overstock': 'https://logo.clearbit.com/overstock.com',
            'Bonanza': 'https://logo.clearbit.com/bonanza.com',
            'Reverb': 'https://logo.clearbit.com/reverb.com',
            'Poshmark': 'https://logo.clearbit.com/poshmark.com',
            'Rakuten': 'https://logo.clearbit.com/rakuten.com',
            'Yahoo Shopping': 'https://logo.clearbit.com/shopping.yahoo.com',
            'Mercado Libre': 'https://logo.clearbit.com/mercadolibre.com',
            'OLX': 'https://logo.clearbit.com/olx.com',
            'Flipkart': 'https://logo.clearbit.com/flipkart.com',
            'Snapdeal': 'https://logo.clearbit.com/snapdeal.com',
            'Paytm Mall': 'https://logo.clearbit.com/paytmmall.com',
            'Tokopedia': 'https://logo.clearbit.com/tokopedia.com',
            'Bukalapak': 'https://logo.clearbit.com/bukalapak.com',
            'Blibli': 'https://logo.clearbit.com/blibli.com',
            'Qoo10': 'https://logo.clearbit.com/qoo10.com',
            'Coupang': 'https://logo.clearbit.com/coupang.com',
            'Gmarket': 'https://logo.clearbit.com/gmarket.co.kr',
            '11Street': 'https://logo.clearbit.com/11st.co.kr',
            'Tmall Global': 'https://logo.clearbit.com/tmall.com',
            'JD.com': 'https://logo.clearbit.com/jd.com',
            'Pinduoduo': 'https://logo.clearbit.com/yangkeduo.com',
            'Temu': 'https://logo.clearbit.com/temu.com',
            'Shein': 'https://logo.clearbit.com/shein.com'
        }
        
        updated_count = 0
        
        for platform in platforms:
            # 如果logo_url为空或者是旧的本地路径，则更新
            if (not platform.logo_url or 
                platform.logo_url == '无' or 
                platform.logo_url.startswith('/images/')):
                
                if platform.name in additional_logos:
                    platform.logo_url = additional_logos[platform.name]
                    updated_count += 1
                    print(f"更新平台 '{platform.name}' 的logo: {platform.logo_url}")
                else:
                    # 为没有在映射中的平台生成通用logo URL
                    domain = platform.name.lower().replace(' ', '').replace('.', '')
                    platform.logo_url = f'https://logo.clearbit.com/{domain}.com'
                    updated_count += 1
                    print(f"为平台 '{platform.name}' 生成logo: {platform.logo_url}")
        
        db.commit()
        print(f"\n总共更新了 {updated_count} 个平台的logo")
        
        # 显示更新后的结果
        print("\n=== 更新后的平台logo情况 ===")
        platforms = db.query(Platform).all()
        for platform in platforms:
            print(f"ID: {platform.id}, Name: {platform.name}, Logo: {platform.logo_url}")
        
    except Exception as e:
        db.rollback()
        print(f"更新logo时出错: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    update_remaining_logos()