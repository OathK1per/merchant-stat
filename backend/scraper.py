import requests
from bs4 import BeautifulSoup
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import json
import re
import time
from urllib.parse import urlparse
from typing import Dict, Any, Optional, List
from config import USER_AGENT, REQUEST_TIMEOUT, USE_PROXY, PROXY_URL, VERIFY_SSL

# 商品数据模型
class ProductData:
    def __init__(self):
        self.name = ""
        self.url = ""
        self.price = 0.0
        self.currency = "USD"
        self.sales_count = 0
        self.image_url = ""
        self.description = ""
        self.specifications = {}
        self.platform_name = ""
        self.category_name = ""

# 基础爬虫类
class BaseScraper:
    def __init__(self):
        self.headers = {
            "User-Agent": USER_AGENT,
            "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
        }
    
    def get_platform_name(self, url):
        """从URL中提取平台名称"""
        domain = urlparse(url).netloc.lower()
        
        # 主流电商平台
        if "amazon" in domain:
            return "Amazon"
        elif "ebay" in domain:
            return "eBay"
        elif "aliexpress" in domain:
            return "AliExpress"
        elif "wish" in domain:
            return "Wish"
        elif "shopee" in domain:
            return "Shopee"
        elif "lazada" in domain:
            return "Lazada"
        
        # 中国电商平台
        elif "taobao" in domain or "tmall" in domain:
            return "淘宝/天猫"
        elif "jd.com" in domain or "jd.hk" in domain:
            return "京东"
        elif "pinduoduo" in domain or "yangkeduo" in domain:
            return "拼多多"
        elif "1688" in domain:
            return "1688"
        
        # 日本电商平台
        elif "rakuten" in domain:
            return "乐天"
        elif "yahoo" in domain and "jp" in domain:
            return "Yahoo购物"
        elif "mercari" in domain:
            return "Mercari"
        
        # 韩国电商平台
        elif "gmarket" in domain:
            return "Gmarket"
        elif "11st" in domain:
            return "11번가"
        elif "coupang" in domain:
            return "Coupang"
        
        # 东南亚电商平台
        elif "tokopedia" in domain:
            return "Tokopedia"
        elif "bukalapak" in domain:
            return "Bukalapak"
        elif "tiki" in domain:
            return "Tiki"
        elif "sendo" in domain:
            return "Sendo"
        
        # 欧洲电商平台
        elif "allegro" in domain:
            return "Allegro"
        elif "cdiscount" in domain:
            return "Cdiscount"
        elif "otto" in domain:
            return "Otto"
        
        # 其他平台
        else:
            # 尝试从域名中提取平台名称
            domain_parts = domain.replace('www.', '').split('.')
            if domain_parts:
                return domain_parts[0].capitalize()
            return "其他"
    
    def guess_category(self, product_name, description):
        """根据商品名称和描述猜测分类"""
        # 扩展的多语言关键词匹配
        electronics_keywords = [
            # 英文
            "phone", "computer", "laptop", "tablet", "camera", "headphone", "speaker", "monitor", "keyboard", "mouse",
            "smartphone", "iphone", "android", "macbook", "ipad", "gaming", "console", "tv", "smart watch", "earbuds",
            # 中文
            "电话", "手机", "电脑", "笔记本", "平板", "相机", "耳机", "音响", "显示器", "键盘", "鼠标",
            "智能手机", "苹果", "安卓", "游戏机", "电视", "智能手表", "无线耳机",
            # 日文
            "スマホ", "パソコン", "ノートパソコン", "タブレット", "カメラ", "ヘッドホン", "スピーカー", "モニター",
            # 韩文
            "스마트폰", "컴퓨터", "노트북", "태블릿", "카메라", "헤드폰", "스피커", "모니터"
        ]
        
        clothing_keywords = [
            # 英文
            "shirt", "dress", "pants", "shoes", "hat", "jacket", "coat", "sweater", "jeans", "sneakers",
            "t-shirt", "hoodie", "skirt", "shorts", "boots", "sandals", "suit", "blazer", "underwear", "socks",
            # 中文
            "衬衫", "连衣裙", "裤子", "鞋", "帽子", "夹克", "外套", "毛衣", "牛仔裤", "运动鞋",
            "T恤", "卫衣", "裙子", "短裤", "靴子", "凉鞋", "西装", "内衣", "袜子",
            # 日文
            "シャツ", "ドレス", "パンツ", "靴", "帽子", "ジャケット", "コート", "セーター", "ジーンズ",
            # 韩文
            "셔츠", "드레스", "바지", "신발", "모자", "재킷", "코트", "스웨터", "청바지"
        ]
        
        home_keywords = [
            # 英文
            "furniture", "decoration", "kitchen", "bedroom", "living room", "dining", "chair", "table", "sofa",
            "bed", "lamp", "curtain", "pillow", "blanket", "storage", "organizer", "vase", "candle",
            # 中文
            "家具", "装饰", "厨房", "卧室", "客厅", "餐厅", "椅子", "桌子", "沙发",
            "床", "灯", "窗帘", "枕头", "毯子", "收纳", "整理", "花瓶", "蜡烛",
            # 日文
            "家具", "装飾", "キッチン", "寝室", "リビング", "ダイニング", "椅子", "テーブル", "ソファ",
            # 韩文
            "가구", "장식", "주방", "침실", "거실", "식당", "의자", "테이블", "소파"
        ]
        
        beauty_keywords = [
            # 英文
            "makeup", "skincare", "cosmetic", "lipstick", "foundation", "mascara", "perfume", "lotion",
            "cream", "serum", "cleanser", "moisturizer", "sunscreen", "shampoo", "conditioner",
            # 中文
            "化妆品", "护肤", "美妆", "口红", "粉底", "睫毛膏", "香水", "乳液",
            "面霜", "精华", "洁面", "保湿", "防晒", "洗发水", "护发素",
            # 日文
            "化粧品", "スキンケア", "コスメ", "口紅", "ファンデーション", "マスカラ", "香水",
            # 韩文
            "화장품", "스킨케어", "코스메틱", "립스틱", "파운데이션", "마스카라", "향수"
        ]
        
        food_keywords = [
            # 英文
            "food", "drink", "snack", "coffee", "tea", "chocolate", "candy", "cookie", "cake", "bread",
            "juice", "water", "wine", "beer", "supplement", "vitamin", "protein", "organic",
            # 中文
            "食品", "饮料", "零食", "咖啡", "茶", "巧克力", "糖果", "饼干", "蛋糕", "面包",
            "果汁", "水", "酒", "啤酒", "保健品", "维生素", "蛋白质", "有机",
            # 日文
            "食品", "飲み物", "スナック", "コーヒー", "茶", "チョコレート", "お菓子", "クッキー",
            # 韩文
            "식품", "음료", "스낵", "커피", "차", "초콜릿", "사탕", "쿠키"
        ]
        
        sports_keywords = [
            # 英文
            "sports", "fitness", "gym", "exercise", "running", "yoga", "basketball", "football", "tennis",
            "swimming", "cycling", "hiking", "camping", "outdoor", "athletic", "workout", "training",
            # 中文
            "运动", "健身", "体育", "锻炼", "跑步", "瑜伽", "篮球", "足球", "网球",
            "游泳", "骑行", "徒步", "露营", "户外", "运动装", "训练",
            # 日文
            "スポーツ", "フィットネス", "ジム", "運動", "ランニング", "ヨガ", "バスケ",
            # 韩文
            "스포츠", "피트니스", "헬스", "운동", "러닝", "요가", "농구"
        ]
        
        text = (product_name + " " + description).lower()
        
        if any(keyword.lower() in text for keyword in electronics_keywords):
            return "电子产品"
        elif any(keyword.lower() in text for keyword in clothing_keywords):
            return "服装鞋帽"
        elif any(keyword.lower() in text for keyword in home_keywords):
            return "家居用品"
        elif any(keyword.lower() in text for keyword in beauty_keywords):
            return "美妆护肤"
        elif any(keyword.lower() in text for keyword in food_keywords):
            return "食品饮料"
        elif any(keyword.lower() in text for keyword in sports_keywords):
            return "运动户外"
        else:
            return "其他"

# 请求爬虫类
class RequestScraper(BaseScraper):
    def __init__(self):
        super().__init__()
    
    def fetch_page(self, url):
        """获取页面内容"""
        max_retries = 3
        retry_count = 0
        
        # 设置代理
        proxies = None
        if USE_PROXY and PROXY_URL:
            proxies = {
                "http": PROXY_URL,
                "https": PROXY_URL
            }
        
        while retry_count < max_retries:
            try:
                response = requests.get(
                    url, 
                    headers=self.headers, 
                    timeout=REQUEST_TIMEOUT,
                    proxies=proxies,
                    verify=VERIFY_SSL
                )
                response.raise_for_status()
                return response.text
            except Exception as e:
                retry_count += 1
                print(f"请求页面时出错 (尝试 {retry_count}/{max_retries}): {e}")
                
                if retry_count < max_retries:
                    # 重试前等待时间递增
                    time.sleep(2 * retry_count)
                else:
                    return None

# Selenium爬虫类
class SeleniumScraper(BaseScraper):
    def __init__(self):
        super().__init__()
        self.driver = None
    
    def initialize_driver(self):
        """初始化Selenium WebDriver"""
        try:
            chrome_options = Options()
            chrome_options.add_argument("--headless")  # 无头模式
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            chrome_options.add_argument(f"user-agent={USER_AGENT}")
            # 添加忽略SSL错误的选项
            chrome_options.add_argument("--ignore-certificate-errors")
            chrome_options.add_argument("--ignore-ssl-errors")
            # 禁用图片加载以提高速度
            chrome_options.add_argument("--blink-settings=imagesEnabled=false")
            # 设置页面加载策略为eager，只等待DOM树加载完成
            chrome_options.page_load_strategy = 'eager'
            
            # 添加代理设置
            if USE_PROXY and PROXY_URL:
                chrome_options.add_argument(f'--proxy-server={PROXY_URL}')
            
            # 直接使用Chrome驱动，不使用ChromeDriverManager
            try:
                # 尝试不使用service参数
                self.driver = webdriver.Chrome(options=chrome_options)
            except:
                # 如果失败，尝试使用默认service
                service = Service()
                self.driver = webdriver.Chrome(service=service, options=chrome_options)
            
            # 设置页面加载超时
            self.driver.set_page_load_timeout(60)  # 增加页面加载超时时间
            self.driver.set_script_timeout(60)     # 增加脚本执行超时时间
            
            return True
        except Exception as e:
            print(f"初始化WebDriver时出错: {e}")
            return False
    
    def fetch_page(self, url):
        """使用Selenium获取页面内容"""
        if not self.driver and not self.initialize_driver():
            return None
        
        max_retries = 3
        retry_count = 0
        
        while retry_count < max_retries:
            try:
                self.driver.get(url)
                # 等待页面加载完成，使用显式等待替代固定时间等待
                try:
                    # 等待body元素加载完成
                    WebDriverWait(self.driver, 10).until(
                        EC.presence_of_element_located((By.TAG_NAME, "body"))
                    )
                except:
                    # 如果等待超时，继续执行，可能页面已部分加载
                    pass
                
                return self.driver.page_source
            except Exception as e:
                retry_count += 1
                print(f"使用Selenium获取页面时出错 (尝试 {retry_count}/{max_retries}): {e}")
                
                if retry_count < max_retries:
                    # 重试前等待时间递增
                    time.sleep(2 * retry_count)
                    # 刷新驱动
                    self.close()
                    if not self.initialize_driver():
                        return None
                else:
                    return None
    
    def scrape_product(self, url):
        """通用商品信息抓取方法"""
        html = self.fetch_page(url)
        if not html:
            return None
        
        soup = BeautifulSoup(html, 'html.parser')
        product = ProductData()
        product.url = url
        product.platform_name = self.get_platform_name(url)
        
        # 尝试提取商品名称 - 使用多种常见的选择器
        name_selectors = [
            'h1', '.product-title', '.product-name', '.item-title',
            '[data-testid="product-title"]', '.title', '#product-title'
        ]
        for selector in name_selectors:
            name_elem = soup.select_one(selector)
            if name_elem and name_elem.text.strip():
                product.name = name_elem.text.strip()
                break
        
        # 尝试提取价格 - 使用多种常见的选择器
        price_selectors = [
            '.price', '.product-price', '.item-price', '.current-price',
            '[data-testid="price"]', '.price-current', '.sale-price'
        ]
        for selector in price_selectors:
            price_elem = soup.select_one(selector)
            if price_elem:
                price_text = price_elem.text.strip()
                # 提取货币符号和价格
                currency_match = re.search(r'([^\d,.]+)', price_text)
                if currency_match:
                    product.currency = currency_match.group(1).strip()
                
                # 提取数字部分
                price_match = re.search(r'[\d,.]+', price_text)
                if price_match:
                    price_str = price_match.group(0).replace(',', '')
                    try:
                        product.price = float(price_str)
                        break
                    except ValueError:
                        continue
        
        # 尝试提取图片URL - 使用多种常见的选择器
        img_selectors = [
            '.product-image img', '.item-image img', '.main-image img',
            '[data-testid="product-image"] img', '.gallery img:first-child'
        ]
        for selector in img_selectors:
            img_elem = soup.select_one(selector)
            if img_elem and ('src' in img_elem.attrs or 'data-src' in img_elem.attrs):
                product.image_url = img_elem.get('src') or img_elem.get('data-src')
                if product.image_url:
                    break
        
        # 尝试提取描述 - 使用多种常见的选择器
        desc_selectors = [
            '.product-description', '.item-description', '.description',
            '[data-testid="description"]', '.product-details', '.summary'
        ]
        for selector in desc_selectors:
            desc_elem = soup.select_one(selector)
            if desc_elem and desc_elem.text.strip():
                product.description = desc_elem.text.strip()[:500]  # 限制长度
                break
        
        # 猜测分类
        product.category_name = self.guess_category(product.name, product.description)
        
        return product
    
    def close(self):
        """关闭WebDriver"""
        if self.driver:
            self.driver.quit()
            self.driver = None

# 亚马逊爬虫
class AmazonScraper(SeleniumScraper):
    def __init__(self):
        super().__init__()
    
    def scrape_product(self, url):
        """抓取亚马逊商品信息"""
        html = self.fetch_page(url)
        if not html:
            return None
        
        soup = BeautifulSoup(html, 'html.parser')
        product = ProductData()
        product.url = url
        product.platform_name = "Amazon"
        
        # 提取商品名称
        name_elem = soup.select_one("#productTitle")
        if name_elem:
            product.name = name_elem.text.strip()
        
        # 提取价格
        price_elem = soup.select_one(".a-price .a-offscreen")
        if price_elem:
            price_text = price_elem.text.strip()
            # 提取货币符号和价格
            currency_match = re.search(r'([^\d,.]+)', price_text)
            if currency_match:
                product.currency = currency_match.group(1)
            
            # 提取数字部分
            price_match = re.search(r'[\d,.]+', price_text)
            if price_match:
                price_str = price_match.group(0).replace(',', '')
                try:
                    product.price = float(price_str)
                except ValueError:
                    product.price = 0.0
        
        # 提取图片URL
        img_elem = soup.select_one("#landingImage")
        if img_elem and 'src' in img_elem.attrs:
            product.image_url = img_elem['src']
        
        # 提取描述
        desc_elem = soup.select_one("#productDescription")
        if desc_elem:
            product.description = desc_elem.text.strip()
        
        # 提取规格参数
        specs = {}
        spec_elems = soup.select("#productDetails_techSpec_section_1 tr")
        for elem in spec_elems:
            key_elem = elem.select_one("th")
            value_elem = elem.select_one("td")
            if key_elem and value_elem:
                key = key_elem.text.strip()
                value = value_elem.text.strip()
                specs[key] = value
        
        product.specifications = specs
        
        # 猜测分类
        product.category_name = self.guess_category(product.name, product.description)
        
        return product

# eBay爬虫
class EbayScraper(RequestScraper):
    def __init__(self):
        super().__init__()
    
    def scrape_product(self, url):
        """抓取eBay商品信息"""
        html = self.fetch_page(url)
        if not html:
            return None
        
        soup = BeautifulSoup(html, 'html.parser')
        product = ProductData()
        product.url = url
        product.platform_name = "eBay"
        
        # 提取商品名称
        name_elem = soup.select_one("h1.x-item-title__mainTitle")
        if name_elem:
            product.name = name_elem.text.strip()
        
        # 提取价格
        price_elem = soup.select_one(".x-price-primary .x-price-primary__content")
        if price_elem:
            price_text = price_elem.text.strip()
            # 提取货币符号和价格
            currency_match = re.search(r'([^\d,.]+)', price_text)
            if currency_match:
                product.currency = currency_match.group(1)
            
            # 提取数字部分
            price_match = re.search(r'[\d,.]+', price_text)
            if price_match:
                price_str = price_match.group(0).replace(',', '')
                try:
                    product.price = float(price_str)
                except ValueError:
                    product.price = 0.0
        
        # 提取图片URL
        img_elem = soup.select_one(".ux-image-carousel-item img")
        if img_elem and 'src' in img_elem.attrs:
            product.image_url = img_elem['src']
        
        # 提取描述
        desc_elem = soup.select_one("#desc_ifr")
        if desc_elem and 'src' in desc_elem.attrs:
            # eBay的描述通常在iframe中，需要额外请求
            desc_url = desc_elem['src']
            desc_html = self.fetch_page(desc_url)
            if desc_html:
                desc_soup = BeautifulSoup(desc_html, 'html.parser')
                product.description = desc_soup.text.strip()
        
        # 提取规格参数
        specs = {}
        spec_elems = soup.select(".ux-labels-values__labels-content")
        value_elems = soup.select(".ux-labels-values__values-content")
        
        for i in range(min(len(spec_elems), len(value_elems))):
            key = spec_elems[i].text.strip()
            value = value_elems[i].text.strip()
            specs[key] = value
        
        product.specifications = specs
        
        # 猜测分类
        product.category_name = self.guess_category(product.name, product.description)
        
        return product

# AliExpress爬虫
class AliExpressScraper(SeleniumScraper):
    def __init__(self):
        super().__init__()
    
    def scrape_product(self, url):
        """抓取AliExpress商品信息"""
        html = self.fetch_page(url)
        if not html:
            return None
        
        soup = BeautifulSoup(html, 'html.parser')
        product = ProductData()
        product.url = url
        product.platform_name = "AliExpress"
        
        # 尝试从页面脚本中提取JSON数据
        script_data = None
        for script in soup.select("script"):
            if script.string and "window.runParams" in script.string:
                try:
                    # 提取JSON数据
                    json_str = re.search(r'data: ({.*})', script.string)
                    if json_str:
                        script_data = json.loads(json_str.group(1))
                        break
                except:
                    continue
        
        if script_data and "productInfoComponent" in script_data:
            info = script_data["productInfoComponent"]
            
            # 提取商品名称
            if "subject" in info:
                product.name = info["subject"]
            
            # 提取价格
            if "price" in info and "formatedAmount" in info["price"]:
                price_text = info["price"]["formatedAmount"]
                # 提取货币符号和价格
                currency_match = re.search(r'([^\d,.]+)', price_text)
                if currency_match:
                    product.currency = currency_match.group(1)
                
                # 提取数字部分
                price_match = re.search(r'[\d,.]+', price_text)
                if price_match:
                    price_str = price_match.group(0).replace(',', '')
                    try:
                        product.price = float(price_str)
                    except ValueError:
                        product.price = 0.0
            
            # 提取图片URL
            if "imagePathList" in info and len(info["imagePathList"]) > 0:
                product.image_url = info["imagePathList"][0]
            
            # 提取销量
            if "tradeComponent" in script_data and "formatTradeCount" in script_data["tradeComponent"]:
                sales_text = script_data["tradeComponent"]["formatTradeCount"]
                sales_match = re.search(r'\d+', sales_text)
                if sales_match:
                    try:
                        product.sales_count = int(sales_match.group(0))
                    except ValueError:
                        product.sales_count = 0
            
            # 提取规格参数
            if "specsModule" in script_data and "props" in script_data["specsModule"]:
                specs = {}
                for prop in script_data["specsModule"]["props"]:
                    if "attrName" in prop and "attrValue" in prop:
                        specs[prop["attrName"]] = prop["attrValue"]
                product.specifications = specs
        
        # 如果无法从脚本中提取，尝试从HTML中提取
        if not product.name:
            name_elem = soup.select_one(".product-title")
            if name_elem:
                product.name = name_elem.text.strip()
        
        if not product.image_url:
            img_elem = soup.select_one(".magnifier-image")
            if img_elem and 'src' in img_elem.attrs:
                product.image_url = img_elem['src']
        
        # 提取描述
        desc_elem = soup.select_one(".product-description")
        if desc_elem:
            product.description = desc_elem.text.strip()
        
        # 猜测分类
        product.category_name = self.guess_category(product.name, product.description)
        
        return product

# 通用爬虫工厂
class ScraperFactory:
    @staticmethod
    def get_scraper(url):
        """根据URL返回对应的爬虫实例"""
        domain = urlparse(url).netloc.lower()
        
        if "amazon" in domain:
            return AmazonScraper()
        elif "ebay" in domain:
            return EbayScraper()
        elif "aliexpress" in domain:
            return AliExpressScraper()
        else:
            # 对于其他网站，使用通用的Selenium爬虫
            return SeleniumScraper()

# 主抓取函数
def scrape_product_from_url(url):
    """从URL抓取商品信息"""
    scraper = ScraperFactory.get_scraper(url)
    try:
        if isinstance(scraper, SeleniumScraper):
            product = scraper.scrape_product(url)
            scraper.close()  # 关闭Selenium WebDriver
        else:
            product = scraper.scrape_product(url)
        
        return product
    except Exception as e:
        print(f"抓取商品信息时出错: {e}")
        if isinstance(scraper, SeleniumScraper):
            scraper.close()
        return None