import os
from datetime import timedelta
import secrets
from urllib.parse import quote_plus

# 环境检测：通过环境变量 ENVIRONMENT 来判断当前环境
# 可选值：development（开发环境）、production（生产环境）
ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")

# 根据环境选择数据库主机
if ENVIRONMENT == "production":
    # 生产环境：使用本地数据库
    DEFAULT_DB_HOST = "localhost"
else:
    # 开发环境：使用外网IP
    DEFAULT_DB_HOST = "159.75.77.175"

# 从环境变量获取数据库配置，如果不存在则使用默认值
DB_CONFIG = {
    "host": os.environ.get("DB_HOST", DEFAULT_DB_HOST),
    "port": int(os.environ.get("DB_PORT", 3306)),
    "user": os.environ.get("DB_USER", "root"),
    "password": os.environ.get("DB_PASSWORD", "zyp345@C"),
    "database": os.environ.get("DB_NAME", "merchant_stat")
}

# 对密码进行URL编码
encoded_password = quote_plus(DB_CONFIG['password'])

# 数据库连接URL
DATABASE_URL = f"mysql+pymysql://{DB_CONFIG['user']}:{encoded_password}@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}"

# JWT配置
SECRET_KEY = secrets.token_hex(32)  # 生成随机安全密钥
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24小时

# 验证码配置
CAPTCHA_EXPIRE_SECONDS = 300  # 验证码有效期5分钟

# 爬虫配置
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
REQUEST_TIMEOUT = 60  # 增加请求超时时间（秒）

# 代理设置（默认不启用）
USE_PROXY = False
PROXY_URL = ""  # 例如 "http://127.0.0.1:7890" 或 "socks5://127.0.0.1:1080"

# SSL设置
VERIFY_SSL = False  # 是否验证SSL证书

# 应用配置
API_PREFIX = "/api"
# 限制CORS来源，允许本地开发环境、特定域名和所有生产环境域名
# 支持所有192.168网段的访问
ALLOW_ORIGINS = [
    "http://localhost:3000", 
    "http://127.0.0.1:3000", 
    "http://localhost:8000", 
    "http://127.0.0.1:8000"
]

# 使用正则表达式匹配192.168网段
ALLOW_ORIGIN_REGEX = r"^http://192\.168\.[0-9]{1,3}\.[0-9]{1,3}:(3000|8000)$"

# 如果设置了环境变量 PRODUCTION_DOMAIN，则添加到允许的来源列表中
import os
PRODUCTION_DOMAIN = os.environ.get("PRODUCTION_DOMAIN")
if PRODUCTION_DOMAIN:
    # 添加 HTTP 和 HTTPS 版本的域名
    ALLOW_ORIGINS.extend([f"http://{PRODUCTION_DOMAIN}", f"https://{PRODUCTION_DOMAIN}"])