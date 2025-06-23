from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
import json
import cloudscraper
from models import get_db, ProductDetail, create_tables

router = APIRouter()

# Ensure tables are created
create_tables()

class RankRequest(BaseModel):
    cate_id: str = "002"

@router.post("/rank/parse_and_save/", tags=["Rank"])
async def parse_and_save_rank(db: Session = Depends(get_db)):
    try:
        with open('c:\\project\\merchant-stat\\rank.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="rank.json not found")
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Error decoding rank.json")

    if 'data' not in data:
        raise HTTPException(status_code=400, detail="Invalid JSON structure: key 'data' not found")

    return await process_rank_data(data, db)

@router.post("/rank/fetch_and_save/", tags=["Rank"])
async def fetch_and_save_rank(request: RankRequest, db: Session = Depends(get_db)):
    """
    从DHgate API获取排行数据并保存到数据库
    """
    api_url = f"https://www.dhgate.com/home/web/pcRank.do?client=pc&language=en&cateId={request.cate_id}&sort=5&dispCurrency=USD&type="
    
    try:
        # 使用cloudscraper创建会话来绕过Cloudflare保护
        scraper = cloudscraper.create_scraper(
            browser={
                'browser': 'chrome',
                'platform': 'windows',
                'desktop': True
            }
        )
        
        print(f"Fetching data from: {api_url}")
        
        # 发送请求
        response = scraper.get(api_url, timeout=30)
        
        print(f"Response status code: {response.status_code}")
        print(f"Response headers: {dict(response.headers)}")
        print(f"Response content (first 500 chars): {response.text[:500]}")
        
        # 检查响应状态码
        if response.status_code != 200:
            raise HTTPException(
                status_code=500, 
                detail=f"API returned status code {response.status_code}: {response.text[:200]}"
            )
        
        # 检查响应内容是否为空
        if not response.text.strip():
            raise HTTPException(
                status_code=500, 
                detail="API returned empty response"
            )
        
        # 解析JSON数据
        try:
            data = response.json()
        except json.JSONDecodeError as e:
            print(f"Failed to parse JSON. Response content: {response.text[:1000]}")
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to parse JSON response: {str(e)}"
            )
        
        # 检查数据结构
        if 'data' not in data:
            print(f"API response structure: {list(data.keys()) if isinstance(data, dict) else type(data)}")
            raise HTTPException(
                status_code=500, 
                detail="API response does not contain 'data' field"
            )
        
        # 处理数据并保存到数据库
        result = await process_rank_data(data, db)
        return result
        
    except Exception as e:
        if "requests" in str(type(e)):
            print(f"Request error: {str(e)}")
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to fetch data from API: {str(e)}"
            )
        else:
            raise
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Unexpected error: {str(e)}"
        )

async def process_rank_data(data: dict, db: Session):

    """
    处理排行数据并保存到数据库的通用函数
    """
    products_to_add = []
    added_item_codes = set()  # 跟踪已添加到列表中的item_code
    added_count = 0
    for key in data['data']:
        for item in data['data'][key]:
            # Get itemCode from link object
            link_info = item.get('link', {})
            item_code = link_info.get('itemCode')
            if not item_code:
                print(f"Skipping item due to missing itemCode in link: {item.get('link', {})}")
                continue

            # 检查数据库中是否已存在
            existing_product = db.query(ProductDetail).filter(ProductDetail.item_code == item_code).first()
            if existing_product:
                print(f"Product with itemcode {item_code} already exists in database. Skipping.")
                continue
            
            # 检查当前批次中是否已添加相同的item_code
            if item_code in added_item_codes:
                print(f"Product with itemcode {item_code} already added to current batch. Skipping.")
                continue
            
            # 添加到已处理的item_code集合中
            added_item_codes.add(item_code)

            product_detail = ProductDetail(
                img_url=item.get('seo600ImagePath'),
                img_text=item.get('imgText'),
                org_o_price=item.get('orgOPrice'),
                org_price=item.get('orgPrice'),
                o_price_interval=item.get('oPriceInterval'),
                price_interval=item.get('priceInterval'),
                seller_store_url=item.get('sellerStoreUrl'),
                recentlysold=item.get('recentlysold'),
                domain_name=item.get('domainname'),
                product_id=item.get('productId'),
                reviews_core=item.get('reviewsCore'),
                feedback_score_percentum=item.get('sellerInfo', {}).get('feedbackScorePercentum'),
                item_code=item_code,
                catalog_id=item.get('catalogid'),
                link_url=item.get('link', {}).get('url'),
                json_object=json.dumps(item, ensure_ascii=False)
            )
            products_to_add.append(product_detail)
            added_count += 1

    try:
        db.add_all(products_to_add)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    return {"message": f"Successfully added {len(products_to_add)} products to the database."}