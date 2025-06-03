from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import uvicorn
import os

from config import ALLOW_ORIGINS, API_PREFIX
from models import get_db, SysUser
from auth import get_current_active_user

# 导入路由
from routers import auth, products, categories, platforms, notifications

# 创建FastAPI应用
app = FastAPI(
    title="跨境电商商品统计系统",
    description="用于统计各个跨境电商平台热门商品信息的系统",
    version="1.0.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(products.router, prefix=API_PREFIX)
app.include_router(categories.router, prefix=API_PREFIX)
app.include_router(platforms.router, prefix=API_PREFIX)
app.include_router(notifications.router, prefix=API_PREFIX)

# 创建静态文件目录
os.makedirs("static/images", exist_ok=True)

# 挂载静态文件
app.mount("/static", StaticFiles(directory="static"), name="static")

# 根路由
@app.get("/")
async def root():
    return {"message": "跨境电商商品统计系统API"}

# 健康检查
@app.get("/health")
async def health_check():
    return {"status": "ok"}

# 获取系统信息（需要认证）
@app.get("/api/system-info")
async def system_info(current_user: SysUser = Depends(get_current_active_user)):
    return {
        "app_name": "跨境电商商品统计系统",
        "version": "1.0.0",
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "is_admin": current_user.is_admin
        }
    }

# 异常处理
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": f"发生内部错误: {str(exc)}"},
    )

# 启动应用
if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)