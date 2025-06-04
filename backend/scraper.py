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
        domain = urlparse(url).netloc
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
        else:
            return "其他"
    
    def guess_category(self, product_name, description):
        """根据商品名称和描述猜测分类"""
        # 简单的关键词匹配
        electronics_keywords = ["phone", "电话", "手机", "computer", "电脑", "laptop", "笔记本", "tablet", "平板", "camera", "相机"]
        clothing_keywords = ["shirt", "衬衫", "dress", "连衣裙", "pants", "裤子", "shoes", "鞋", "hat", "帽子"]
        home_keywords = ["furniture", "家具", "decoration", "装饰", "kitchen", "厨房", "bedroom", "卧室"]
        beauty_keywords = ["makeup", "化妆品", "skincare", "护肤", "cosmetic", "美妆"]
        food_keywords = ["food", "食品", "drink", "饮料", "snack", "零食"]
        
        text = (product_name + " " + description).lower()
        
        if any(keyword in text for keyword in electronics_keywords):
            return "电子产品"
        elif any(keyword in text for keyword in clothing_keywords):
            return "服装鞋帽"
        elif any(keyword in text for keyword in home_keywords):
            return "家居用品"
        elif any(keyword in text for keyword in beauty_keywords):
            return "美妆护肤"
        elif any(keyword in text for keyword in food_keywords):
            return "食品饮料"
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
            self.driver.set_page_load_timeout(30)  # 增加页面加载超时时间
            self.driver.set_script_timeout(30)     # 增加脚本执行超时时间
            
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