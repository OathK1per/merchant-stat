import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // 处理401错误（未授权）
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data || error)
  }
)

// 认证相关API
export const authAPI = {
  // 获取验证码
  getCaptcha: () => api.get('/auth/captcha'),
  
  // 用户登录
  login: (data) => api.post('/auth/login', data),
  
  // 获取当前用户信息
  getCurrentUser: () => api.get('/auth/me'),
}

// 商品相关API
export const productAPI = {
  // 获取商品列表
  getProducts: (params) => api.get('/products', { params }),
  
  // 获取单个商品
  getProduct: (id) => api.get(`/products/${id}`),
  
  // 创建商品
  createProduct: (data) => api.post('/products', data),
  
  // 批量创建商品
  createProductsBulk: (data) => api.post('/products/bulk', data),
  
  // 从URL抓取商品
  scrapeProduct: (data) => api.post('/products/scrape', data),
  
  // 更新商品
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  
  // 删除商品
  deleteProduct: (id) => api.delete(`/products/${id}`),
}

// 分类相关API
export const categoryAPI = {
  // 获取所有分类
  getCategories: () => api.get('/categories'),
  
  // 获取单个分类
  getCategory: (id) => api.get(`/categories/${id}`),
  
  // 创建分类
  createCategory: (data) => api.post('/categories', data),
  
  // 更新分类
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  
  // 删除分类
  deleteCategory: (id) => api.delete(`/categories/${id}`),
}

// 平台相关API
export const platformAPI = {
  // 获取所有平台
  getPlatforms: () => api.get('/platforms'),
  
  // 获取单个平台
  getPlatform: (id) => api.get(`/platforms/${id}`),
  
  // 创建平台
  createPlatform: (data) => api.post('/platforms', data),
  
  // 更新平台
  updatePlatform: (id, data) => api.put(`/platforms/${id}`, data),
  
  // 删除平台
  deletePlatform: (id) => api.delete(`/platforms/${id}`),
}

// 通知相关API
export const notificationAPI = {
  // 获取通知列表
  getNotifications: (params) => api.get('/notifications', { params }),
  
  // 获取单个通知
  getNotification: (id) => api.get(`/notifications/${id}`),
  
  // 创建通知（仅管理员）
  createNotification: (data) => api.post('/notifications', data),
  
  // 标记通知为已读
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  
  // 标记所有通知为已读
  markAllAsRead: () => api.put('/notifications/read-all'),
  
  // 删除通知
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
}

// 系统相关API
export const systemAPI = {
  // 获取系统信息
  getSystemInfo: () => api.get('/system-info'),
  // 获取统计数据
  getStats: () => api.get('/system-stats'),
}

export default api