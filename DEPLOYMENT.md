# 跨境电商商品统计系统部署指南

本文档提供在 Windows 和 Linux 环境下部署跨境电商商品统计系统的详细步骤。

## 系统要求

### 通用要求
- Python 3.8+
- Node.js 16+
- npm 8+
- MySQL 5.7+

## Windows 环境部署

### 1. 克隆代码库
```bash
git clone <repository-url>
cd merchant-stat
```

### 2. 配置数据库
- 确保 MySQL 服务已启动
- 创建数据库 `merchant_stat`
- 根据需要修改 `backend/config.py` 中的数据库配置

### 3. 启动系统
直接运行根目录下的 `start.bat` 文件：
```bash
start.bat
```

这将自动启动后端和前端服务。

## Linux 环境部署

### 1. 克隆代码库
```bash
git clone <repository-url>
cd merchant-stat
```

### 2. 配置数据库
- 确保 MySQL 服务已启动
- 创建数据库 `merchant_stat`
- 根据需要修改 `backend/config.py` 中的数据库配置

### 3. 设置执行权限
为所有 shell 脚本添加执行权限：
```bash
chmod +x start.sh
chmod +x backend/start.sh
chmod +x frontend/start.sh
```

### 4. 配置生产环境域名（可选）
如果您有特定的生产环境域名，可以设置环境变量：
```bash
export PRODUCTION_DOMAIN=your-domain.com
```

### 5. 启动系统
运行根目录下的 `start.sh` 脚本：
```bash
./start.sh
```

这将自动启动后端和前端服务。

## 生产环境部署建议

### 后端服务
在生产环境中，建议使用 Gunicorn 或 Uvicorn 作为 WSGI/ASGI 服务器，并配合 Nginx 作为反向代理：

```bash
# 安装 Gunicorn
pip install gunicorn

# 使用 Gunicorn 启动后端服务
cd backend
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000
```

### 前端服务
在生产环境中，建议构建静态文件并使用 Nginx 提供服务：

```bash
# 构建前端静态文件
cd frontend
npm install
npm run build

# 然后配置 Nginx 提供 dist 目录中的静态文件
```

### Nginx 配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/merchant-stat/frontend/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 静态文件代理
    location /static {
        proxy_pass http://localhost:8000;
    }
}
```

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查 MySQL 服务是否运行
   - 验证 `backend/config.py` 中的数据库配置是否正确

2. **前端无法连接后端 API**
   - 确认后端服务正在运行
   - 检查 `frontend/vite.config.js` 中的代理配置
   - 验证 CORS 设置是否正确

3. **Linux 环境下脚本无法执行**
   - 确保已添加执行权限：`chmod +x *.sh`
   - 检查脚本中的行尾序列（可能需要转换 CRLF 为 LF）

## 注意事项

- 生产环境中应使用 HTTPS 确保安全
- 定期备份数据库
- 考虑设置监控和日志系统
- 在生产环境中，应该使用环境变量而非硬编码的配置