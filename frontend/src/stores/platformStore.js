import { create } from 'zustand'
import { platformAPI } from '../services/api'

export const usePlatformStore = create((set, get) => ({
  // 状态
  platforms: [],
  currentPlatform: null,
  loading: false,
  error: null,
  
  // 获取所有平台
  fetchPlatforms: async () => {
    try {
      set({ loading: true, error: null })
      
      const platforms = await platformAPI.getPlatforms()
      
      set({
        platforms,
        loading: false,
      })
      
      return platforms
    } catch (error) {
      set({
        loading: false,
        error: error.detail || '获取平台列表失败',
      })
      return []
    }
  },
  
  // 获取单个平台
  fetchPlatform: async (id) => {
    try {
      set({ loading: true, error: null })
      
      const platform = await platformAPI.getPlatform(id)
      
      set({
        currentPlatform: platform,
        loading: false,
      })
      
      return platform
    } catch (error) {
      set({
        loading: false,
        error: error.detail || '获取平台详情失败',
      })
      return null
    }
  },
  
  // 创建平台
  createPlatform: async (data) => {
    try {
      set({ loading: true, error: null })
      
      const platform = await platformAPI.createPlatform(data)
      
      // 更新列表
      await get().fetchPlatforms()
      
      set({ loading: false })
      return platform
    } catch (error) {
      set({
        loading: false,
        error: error.detail || '创建平台失败',
      })
      return null
    }
  },
  
  // 更新平台
  updatePlatform: async (id, data) => {
    try {
      set({ loading: true, error: null })
      
      const platform = await platformAPI.updatePlatform(id, data)
      
      // 更新列表
      await get().fetchPlatforms()
      
      set({ loading: false })
      return platform
    } catch (error) {
      set({
        loading: false,
        error: error.detail || '更新平台失败',
      })
      return null
    }
  },
  
  // 删除平台
  deletePlatform: async (id) => {
    try {
      set({ loading: true, error: null })
      
      await platformAPI.deletePlatform(id)
      
      // 更新列表
      await get().fetchPlatforms()
      
      set({ loading: false })
      return true
    } catch (error) {
      set({
        loading: false,
        error: error.detail || '删除平台失败',
      })
      return false
    }
  },
}))