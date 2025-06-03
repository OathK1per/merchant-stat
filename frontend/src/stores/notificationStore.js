import { create } from 'zustand'
import { notificationAPI } from '../services/api'

export const useNotificationStore = create((set, get) => ({
  // 状态
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  
  // 获取通知列表
  fetchNotifications: async () => {
    try {
      set({ loading: true, error: null })
      const response = await notificationAPI.getNotifications()
      
      // 计算未读通知数量
      const unreadCount = response.filter(item => !item.is_read).length
      
      set({
        notifications: response,
        unreadCount,
        loading: false,
      })
    } catch (error) {
      set({
        loading: false,
        error: error.detail || '获取通知失败',
      })
    }
  },
  
  // 获取未读通知
  fetchUnreadNotifications: async () => {
    try {
      set({ loading: true, error: null })
      const response = await notificationAPI.getNotifications({ is_read: false })
      
      set({
        notifications: response,
        unreadCount: response.length,
        loading: false,
      })
    } catch (error) {
      set({
        loading: false,
        error: error.detail || '获取未读通知失败',
      })
    }
  },
  
  // 标记通知为已读
  markAsRead: async (id) => {
    try {
      await notificationAPI.markAsRead(id)
      
      // 更新本地状态
      const { notifications } = get()
      const updatedNotifications = notifications.map(item =>
        item.id === id ? { ...item, is_read: true } : item
      )
      
      // 重新计算未读数量
      const unreadCount = updatedNotifications.filter(item => !item.is_read).length
      
      set({
        notifications: updatedNotifications,
        unreadCount,
      })
    } catch (error) {
      set({ error: error.detail || '标记通知失败' })
    }
  },
  
  // 标记所有通知为已读
  markAllAsRead: async () => {
    try {
      await notificationAPI.markAllAsRead()
      
      // 更新本地状态
      const { notifications } = get()
      const updatedNotifications = notifications.map(item => ({ ...item, is_read: true }))
      
      set({
        notifications: updatedNotifications,
        unreadCount: 0,
      })
    } catch (error) {
      set({ error: error.detail || '标记所有通知失败' })
    }
  },
  
  // 删除通知
  deleteNotification: async (id) => {
    try {
      await notificationAPI.deleteNotification(id)
      
      // 更新本地状态
      const { notifications } = get()
      const updatedNotifications = notifications.filter(item => item.id !== id)
      
      // 重新计算未读数量
      const unreadCount = updatedNotifications.filter(item => !item.is_read).length
      
      set({
        notifications: updatedNotifications,
        unreadCount,
      })
    } catch (error) {
      set({ error: error.detail || '删除通知失败' })
    }
  },
  
  // 清除错误
  clearError: () => set({ error: null }),
}))