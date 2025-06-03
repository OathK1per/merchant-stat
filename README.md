# 跨境电商商品统计系统

这是一个用于统计和管理各个跨境电商平台热门商品信息的系统。通过爬虫技术自动抓取商品数据，或手动录入、批量导入商品信息，帮助用户分析和跟踪跨境电商市场趋势。

## 系统架构

系统采用前后端分离架构：

- **前端**：基于React框架和Ant Design组件库构建的单页面应用
- **后端**：基于FastAPI构建的RESTful API服务
- **数据库**：MySQL关系型数据库存储商品、分类、平台等信息
- **爬虫引擎**：集成Selenium和BeautifulSoup的网页爬虫，支持多平台数据抓取

## 核心功能

### 1. 用户认证与授权

- 用户登录：支持用户名/密码认证，集成验证码防护
- JWT令牌：使用JWT进行API认证，保障系统安全
- 权限控制：区分管理员和普通用户权限

### 2. 商品数据管理

- **商品抓取**：输入商品URL，自动抓取商品信息（名称、价格、图片、描述等）
- **手动录入**：支持手动输入商品详细信息
- **批量导入**：支持Excel等格式批量导入商品数据
- **商品列表**：展示所有商品，支持多条件筛选、排序和分页
- **数据统计**：按平台、分类统计商品数量和价格分布

### 3. 爬虫引擎

- **多平台支持**：支持Amazon、eBay、AliExpress等主流跨境电商平台
- **自适应解析**：针对不同平台的页面结构进行专门解析
- **无头浏览器**：使用Selenium无头浏览器处理JavaScript渲染的页面
- **智能分类**：基于商品名称和描述自动推荐商品分类

## 技术栈详解

### 前端技术

- **React**：用于构建用户界面的JavaScript库
- **Ant Design**：企业级UI设计语言和React组件库
- **Zustand**：轻量级状态管理库
- **Axios**：基于Promise的HTTP客户端
- **React Router**：React应用的路由管理
- **Vite**：现代前端构建工具，提供更快的开发体验

### 后端技术

- **FastAPI**：高性能的Python API框架，基于标准Python类型提示
- **SQLAlchemy**：Python SQL工具包和ORM系统
- **Pydantic**：数据验证和设置管理库
- **JWT**：用于API认证的JSON Web Token
- **Selenium**：自动化浏览器测试工具，用于爬取动态网页
- **BeautifulSoup**：HTML和XML解析库

### 数据库设计

系统使用MySQL数据库，主要包含以下数据表：

- **用户表(sys_user)**：存储用户信息和认证数据
- **商品表(product)**：存储商品基本信息
- **分类表(product_category)**：商品分类信息
- **平台表(platform)**：电商平台信息
- **通知表(notification)**：系统通知信息

## 安装与部署

### 环境要求

- **Python**: 3.8+
- **Node.js**: 14.0+
- **MySQL**: 5.7+
- **Chrome浏览器**: 用于Selenium爬虫

### 后端部署

1. 安装Python依赖：
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. 配置数据库：
   - 修改`backend/config.py`中的数据库连接信息
   - 初始化数据库：`python init_db.py`

3. 启动后端服务：
   ```bash
   python start.py
   # 或使用批处理文件
   start.bat
   ```

### 前端部署

1. 安装Node.js依赖：
   ```bash
   cd frontend
   npm install
   ```

2. 启动开发服务器：
   ```bash
   npm run dev
   # 或使用批处理文件
   start.bat
   ```

3. 构建生产版本：
   ```bash
   npm run build
   ```

### 一键启动（Windows）

使用项目根目录的`start.bat`可以同时启动前端和后端服务：
```bash
start.bat
```

## 安全说明

- 系统使用JWT进行API认证，密钥随机生成
- 用户密码使用bcrypt算法加密存储
- CORS配置限制了允许的来源域名
- 默认管理员账号：admin，初始密码在首次运行时输出到控制台

## 使用指南

### 登录系统

1. 访问前端应用（默认为http://localhost:3000）
2. 使用管理员账号登录（用户名：admin，密码：见初始化输出）

### 抓取商品

1. 导航到"商品抓取"页面
2. 输入商品URL（支持Amazon、eBay、AliExpress等）
3. 点击"抓取"按钮，系统会自动获取商品信息
4. 检查并编辑抓取结果，点击"保存"按钮

### 查看商品列表

1. 导航到"商品列表"页面
2. 使用筛选条件（分类、平台、价格区间等）筛选商品
3. 点击商品可查看详情

## 常见问题

1. **爬虫无法正常工作**
   - 确保已安装Chrome浏览器
   - 检查网络连接是否正常
   - 目标网站可能有反爬虫机制，尝试降低请求频率

2. **数据库连接失败**
   - 检查MySQL服务是否运行
   - 验证数据库连接信息是否正确
   - 确保数据库用户有足够权限

3. **前端无法连接后端API**
   - 检查后端服务是否正常运行
   - 确认API地址配置是否正确
   - 检查CORS配置是否允许前端域名

## 开发者说明

### 添加新平台支持

1. 在`backend/scraper.py`中创建新的爬虫类，继承`BaseScraper`
2. 实现`scrape_product`方法，解析特定平台的页面结构
3. 在`ScraperFactory`类中添加新平台的判断逻辑

### 扩展商品属性

1. 修改`backend/models.py`中的`Product`模型
2. 更新`backend/routers/products.py`中的相关API
3. 调整前端组件以显示新属性

## 贡献指南

欢迎贡献代码、报告问题或提出改进建议。请遵循以下步骤：

1. Fork项目仓库
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

本项目采用MIT许可证。详见LICENSE文件。