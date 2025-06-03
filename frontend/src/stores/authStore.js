import { create } from 'zustand'
import { authAPI } from '../services/api'

export const useAuthStore = create((set, get) => ({
  // 状态
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  
  // 获取验证码
  getCaptcha: async () => {
    try {
      const response = await authAPI.getCaptcha()
      return response
    } catch (error) {
      set({ error: error.detail || '获取验证码失败' })
      return null
    }
  },
  
  // 登录
  login: async (credentials) => {
    try {
      set({ loading: true, error: null })
      const response = await authAPI.login(credentials)
      
      // 保存token到localStorage
      localStorage.setItem('token', response.access_token)
      
      // 更新状态
      set({
        user: {
          id: response.user_id,
          username: response.username,
          fullName: response.full_name,
          isAdmin: response.is_admin,
          lastLogin: response.last_login,
        },
        isAuthenticated: true,
        loading: false,
      })
      
      return true
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: error.detail || '登录失败',
      })
      return false
    }
  },
  
  // 检查认证状态
  checkAuth: async () => {
    try {
      set({ loading: true })
      
      // 检查localStorage中是否有token
      const token = localStorage.getItem('token')
      if (!token) {
        set({ user: null, isAuthenticated: false, loading: false })
        return false
      }
      
      // 获取当前用户信息
      const user = await authAPI.getCurrentUser()
      
      set({
        user: {
          id: user.id,
          username: user.username,
          fullName: user.full_name,
          isAdmin: user.is_admin,
          lastLogin: user.last_login,
        },
        isAuthenticated: true,
        loading: false,
      })
      
      return true
    } catch (error) {
      // 清除无效的token
      localStorage.removeItem('token')
      
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      })
      
      return false
    }
  },
  
  // 登出
  logout: () => {
    // 清除token
    localStorage.removeItem('token')
    
    // 更新状态
    set({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    })
  },
  
  // 清除错误
  clearError: () => set({ error: null }),
}))