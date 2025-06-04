import os
from datetime import timedelta
import secrets

# 数据库配置
DB_CONFIG = {
    "host": "159.75.77.175",
    "port": 3306,
    "user": "root",
    "password": "zyp345",
    "database": "merchant_stat"
}

# 数据库连接URL
DATABASE_URL = f"mysql+pymysql://{DB_CONFIG['user']}:{DB_CONFIG['password']}@{DB_CONFIG['host']}:{DB_CONFIG['port']}/{DB_CONFIG['database']}"

# JWT配置
SECRET_KEY = secrets.token_hex(32)  # 生成随机安全密钥
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24小时

# 验证码配置
CAPTCHA_EXPIRE_SECONDS = 300  # 验证码有效期5分钟

# 爬虫配置
USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
REQUEST_TIMEOUT = 30  # 增加请求超时时间（秒）

# 代理设置（默认不启用）
USE_PROXY = False
PROXY_URL = ""  # 例如 "http://127.0.0.1:7890" 或 "socks5://127.0.0.1:1080"

# SSL设置
VERIFY_SSL = False  # 是否验证SSL证书

# 应用配置
API_PREFIX = "/api"
# 限制CORS来源，只允许本地开发环境和特定域名
ALLOW_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:8000", "http://127.0.0.1:8000"]