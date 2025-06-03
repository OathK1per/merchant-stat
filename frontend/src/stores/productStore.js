import { create } from 'zustand'
import { productAPI, categoryAPI, platformAPI } from '../services/api'

export const useProductStore = create((set, get) => ({
  // 状态
  products: [],
  total: 0,
  currentProduct: null,
  categories: [],
  platforms: [],
  loading: false,
  error: null,
  filters: {
    category_id: null,
    platform_id: null,
    name: '',
    min_price: null,
    max_price: null,
  },
  pagination: {
    current: 1,
    pageSize: 10,
  },
  
  // 获取商品列表
  fetchProducts: async () => {
    try {
      set({ loading: true, error: null })
      
      const { filters, pagination } = get()
      const params = {
        skip: (pagination.current - 1) * pagination.pageSize,
        limit: pagination.pageSize,
        ...filters,
      }
      
      const response = await productAPI.getProducts(params)
      
      set({
        products: response.items,
        total: response.total,
        loading: false,
      })
    } catch (error) {
      set({
        loading: false,
        error: error.detail || '获取商品列表失败',
      })
    }
  },
  
  // 获取单个商品
  fetchProduct: async (id) => {
    try {
      set({ loading: true, error: null })
      
      const product = await productAPI.getProduct(id)
      
      set({
        currentProduct: product,
        loading: false,
      })
      
      return product
    } catch (error) {
      set({
        loading: false,
        error: error.detail || '获取商品详情失败',
      })
      return null
    }
  },
  
  // 创建商品
  createProduct: async (data) => {
    try {
      set({ loading: true, error: null })
      
      const product = await productAPI.createProduct(data)
      
      // 更新列表
      await get().fetchProducts()
      
      set({ loading: false })
      return product
    } catch (error) {
      set({
        loading: false,
        error: error.detail || '创建商品失败',
      })
      return null
    }
  },
  
  // 批量创建商品
  createProductsBulk: async (data) => {
    try {
      set({ loading: true, error: null })
      
      const products = await productAPI.createProductsBulk(data)
      
      // 更新列表
      await get().fetchProducts()
      
      set({ loading: false })
      return products
    } catch (error) {
      set({
        loading: false,
        error: error.detail || '批量创建商品失败',
      })
      return null
    }
  },
  
  // 从URL抓取商品
  scrapeProduct: async (url) => {
    try {
      set({ loading: true, error: null })
      
      const product = await productAPI.scrapeProduct({ url })
      
      // 更新列表
      await get().fetchProducts()
      
      set({ loading: false })
      return product
    } catch (error) {
      set({
        loading: false,
        error: error.detail || '抓取商品失败',
      })
      return null
    }
  },
  
  // 更新商品
  updateProduct: async (id, data) => {
    try {
      set({ loading: true, error: null })
      
      const product = await productAPI.updateProduct(id, data)
      
      // 更新列表
      await get().fetchProducts()
      
      set({ loading: false })
      return product
    } catch (error) {
      set({
        loading: false,
        error: error.detail || '更新商品失败',
      })
      return null
    }
  },
  
  // 删除商品
  deleteProduct: async (id) => {
    try {
      set({ loading: true, error: null })
      
      await productAPI.deleteProduct(id)
      
      // 更新列表
      await get().fetchProducts()
      
      set({ loading: false })
      return true
    } catch (error) {
      set({
        loading: false,
        error: error.detail || '删除商品失败',
      })
      return false
    }
  },
  
  // 获取所有分类
  fetchCategories: async () => {
    try {
      const categories = await categoryAPI.getCategories()
      set({ categories })
      return categories
    } catch (error) {
      set({ error: error.detail || '获取分类失败' })
      return []
    }
  },
  
  // 获取所有平台
  fetchPlatforms: async () => {
    try {
      const platforms = await platformAPI.getPlatforms()
      set({ platforms })
      return platforms
    } catch (error) {
      set({ error: error.detail || '获取平台失败' })
      return []
    }
  },
  
  // 设置筛选条件
  setFilters: (filters) => {
    set({
      filters: { ...get().filters, ...filters },
      pagination: { ...get().pagination, current: 1 }, // 重置到第一页
    })
  },
  
  // 重置筛选条件
  resetFilters: () => {
    set({
      filters: {
        category_id: null,
        platform_id: null,
        name: '',
        min_price: null,
        max_price: null,
      },
    })
  },
  
  // 设置分页
  setPagination: (pagination) => {
    set({ pagination: { ...get().pagination, ...pagination } })
  },
  
  // 清除错误
  clearError: () => set({ error: null }),
}))