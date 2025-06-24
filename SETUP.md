# Merchant Stat 项目配置指南

本指南将帮助您在开发环境和生产环境中正确配置和运行 Merchant Stat 项目。

## 🔧 环境配置

### 1. 克隆项目
```bash
git clone <your-repository-url>
cd merchant-stat
```

### 2. 配置环境变量

#### 开发环境
```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件
# Windows: notepad .env
# Linux/Mac: nano .env 或 vim .env
```

在 `.env` 文件中配置以下内容：
```env
# 环境配置
ENVIRONMENT=development

# 数据库配置（开发环境）
DB_HOST=159.75.77.175  # 外网数据库IP
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_actual_password
DB_NAME=merchant_stat

# MySQL Root密码
MYSQL_ROOT_PASSWORD=your_root_password

# 域名配置
PRODUCTION_DOMAIN=your-domain.com
```

## 🚀 开发环境运行

### 方法1：使用自动化脚本（推荐）

#### Windows
```cmd
# 双击运行或在命令行执行
start-dev.bat
```

#### Linux/Mac
```bash
# 添加执行权限（首次运行）
chmod +x start-dev.sh

# 运行脚本
./start-dev.sh
```

### 方法2：手动启动

#### 启动后端
```bash
cd backend
pip install -r requirements.txt
python start.py
```

#### 启动前端（新终端窗口）
```bash
cd frontend
npm install
npm run dev
```

### 访问地址
- 后端API: http://localhost:8000
- 前端界面: http://localhost:3000
- API文档: http://localhost:8000/docs

## 🏭 生产环境部署

### 1. 服务器环境准备

#### 安装依赖
```bash
# CentOS/RHEL/OpenCloudOS
sudo yum update -y
sudo yum install -y python3 python3-pip nodejs npm mysql-server

# Ubuntu/Debian
sudo apt update
sudo apt install -y python3 python3-pip nodejs npm mysql-server
```

#### 安装PM2（进程管理器）
```bash
npm install -g pm2
```

### 2. 配置生产环境

#### 设置环境变量
```bash
# 方法1：直接设置环境变量
export ENVIRONMENT=production
export DB_HOST=localhost
export DB_USER=your_production_user
export DB_PASSWORD=your_production_password
export DB_NAME=merchant_stat
export PRODUCTION_DOMAIN=your-domain.com
```

#### 方法2：使用PM2配置文件
```bash
# 复制PM2配置模板
cp ecosystem.config.js.example ecosystem.config.js

# 编辑配置文件
nano ecosystem.config.js
```

在 `ecosystem.config.js` 中修改以下内容：
```javascript
module.exports = {
  apps: [
    {
      name: 'merchant-stat-backend',
      script: 'backend/start.py',
      interpreter: 'python3',
      cwd: '/path/to/your/project',  // 修改为实际路径
      env: {
        ENVIRONMENT: 'production',
        DB_HOST: 'localhost',
        DB_USER: 'your_production_user',     // 修改为实际用户名
        DB_PASSWORD: 'your_production_password', // 修改为实际密码
        DB_NAME: 'merchant_stat',
        PRODUCTION_DOMAIN: 'your-domain.com'    // 修改为实际域名
      }
    }
  ]
};
```

### 3. 数据库配置

#### 创建数据库和用户
```sql
-- 登录MySQL
mysql -u root -p

-- 创建数据库
CREATE DATABASE merchant_stat CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户并授权
CREATE USER 'merchant_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON merchant_stat.* TO 'merchant_user'@'localhost';
FLUSH PRIVILEGES;

-- 退出
EXIT;
```

### 4. 部署应用

#### 安装依赖
```bash
# 后端依赖
cd backend
pip3 install -r requirements.txt
cd ..

# 前端依赖和构建
cd frontend
npm install
npm run build
cd ..
```

#### 初始化数据库
```bash
cd backend
python3 init_db.py
cd ..
```

#### 启动服务
```bash
# 使用PM2启动
pm2 start ecosystem.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs

# 设置开机自启
pm2 startup
pm2 save
```

### 5. Nginx配置（可选）

创建 `/etc/nginx/sites-available/merchant-stat`：
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/your/project/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端API代理
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

启用配置：
```bash
sudo ln -s /etc/nginx/sites-available/merchant-stat /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔍 常用命令

### PM2 管理命令
```bash
# 查看所有进程状态
pm2 status

# 查看特定应用日志
pm2 logs merchant-stat-backend

# 重启应用
pm2 restart merchant-stat-backend

# 停止应用
pm2 stop merchant-stat-backend

# 删除应用
pm2 delete merchant-stat-backend

# 监控面板
pm2 monit
```

### 数据库管理
```bash
# 备份数据库
mysqldump -u merchant_user -p merchant_stat > backup.sql

# 恢复数据库
mysql -u merchant_user -p merchant_stat < backup.sql
```

## 🛠️ 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查数据库服务是否运行：`sudo systemctl status mysql`
   - 检查用户权限：确保数据库用户有正确的访问权限
   - 检查防火墙设置

2. **npm命令未找到**
   ```bash
   # 安装Node.js和npm
   curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
   sudo yum install -y nodejs
   ```

3. **端口被占用**
   ```bash
   # 查看端口占用
   netstat -tulpn | grep :8000
   
   # 杀死占用进程
   sudo kill -9 <PID>
   ```

4. **权限问题**
   ```bash
   # 确保项目目录有正确权限
   sudo chown -R $USER:$USER /path/to/project
   chmod +x start-dev.sh
   ```

## 📝 注意事项

1. **安全性**
   - 生产环境中使用强密码
   - 定期更新依赖包
   - 配置防火墙规则
   - 使用HTTPS（配置SSL证书）

2. **性能优化**
   - 生产环境使用Nginx作为反向代理
   - 配置数据库连接池
   - 启用Gzip压缩
   - 配置缓存策略

3. **监控和日志**
   - 定期检查PM2日志
   - 配置日志轮转
   - 监控系统资源使用情况
   - 设置告警机制

## 📞 技术支持

如果遇到问题，请检查：
1. 环境变量配置是否正确
2. 数据库连接是否正常
3. 依赖包是否完整安装
4. 端口是否被占用
5. 日志文件中的错误信息