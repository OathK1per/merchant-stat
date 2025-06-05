import { create } from 'zustand'
import { categoryAPI } from '../services/api'

export const useCategoryStore = create((set, get) => ({
  // 状态
  categories: [],
  currentCategory: null,
  loading: false,
  error: null,
  
  // 获取所有分类
  fetchCategories: async () => {
    try {
      set({ loading: true, error: null })
      
      const categories = await categoryAPI.getCategories()
      
      set({
        categories,
        loading: false,
      })
      
      return categories
    } catch (error) {
      set({
        loading: false,
        error: error.detail || '获取分类列表失败',
      })
      return []
    }
  },
  
  // 获取单个分类
  fetchCategory: async (id) => {
    try {
      set({ loading: true, error: null })
      
      const category = await categoryAPI.getCategory(id)
      
      set({
        currentCategory: category,
        loading: false,
      })
      
      return category
    } catch (error) {
      set({
        loading: false,
        error: error.detail || '获取分类详情失败',
      })
      return null
    }
  },
  
  // 创建分类
  createCategory: async (data) => {
    try {
      set({ loading: true, error: null })
      
      const category = await categoryAPI.createCategory(data)
      
      // 更新列表
      await get().fetchCategories()
      
      set({ loading: false })
      return category
    } catch (error) {
      set({
        loading: false,
        error: error.detail || '创建分类失败',
      })
      return null
    }
  },
  
  // 更新分类
  updateCategory: async (id, data) => {
    try {
      set({ loading: true, error: null })
      
      const category = await categoryAPI.updateCategory(id, data)
      
      // 更新列表
      await get().fetchCategories()
      
      set({ loading: false })
      return category
    } catch (error) {
      set({
        loading: false,
        error: error.detail || '更新分类失败',
      })
      return null
    }
  },
  
  // 删除分类
  deleteCategory: async (id) => {
    try {
      set({ loading: true, error: null })
      
      await categoryAPI.deleteCategory(id)
      
      // 更新列表
      await get().fetchCategories()
      
      set({ loading: false })
      return true
    } catch (error) {
      set({
        loading: false,
        error: error.detail || '删除分类失败',
      })
      return false
    }
  },
}))