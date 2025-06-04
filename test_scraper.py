import sys
import os

# 添加项目根目录到Python路径
sys.path.append(os.path.abspath('.'))

# 修改导入语句，使用正确的路径
from backend.scraper import RequestScraper, SeleniumScraper
from backend.config import USER_AGENT, REQUEST_TIMEOUT, USE_PROXY, PROXY_URL, VERIFY_SSL

def test_request_scraper():
    print('测试 RequestScraper...')
    scraper = RequestScraper()
    # 测试一个稳定的网站
    html = scraper.fetch_page('https://www.baidu.com')
    if html:
        print('RequestScraper 连接成功!')
        print(f'获取到 {len(html)} 字节的内容')
    else:
        print('RequestScraper 连接失败!')

def test_selenium_scraper():
    print('\n测试 SeleniumScraper...')
    scraper = SeleniumScraper()
    try:
        # 测试一个稳定的网站
        html = scraper.fetch_page('https://www.baidu.com')
        if html:
            print('SeleniumScraper 连接成功!')
            print(f'获取到 {len(html)} 字节的内容')
        else:
            print('SeleniumScraper 连接失败!')
    finally:
        scraper.close()

if __name__ == '__main__':
    test_request_scraper()
    test_selenium_scraper()