import React, { useState, useEffect } from 'react'
import { Layout, Menu, Badge, Dropdown, Avatar, Typography, Spin, message } from 'antd'
import { 
  DashboardOutlined, 
  ShoppingOutlined, 
  CloudDownloadOutlined, 
  UserOutlined, 
  LogoutOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../stores/authStore'
import { useNotificationStore } from '../../stores/notificationStore'
import NotificationList from '../Notification/NotificationList'
import { PageTransition } from '../Animation'

const { Header, Sider, Content } = Layout
const { Title, Text } = Typography

const AppLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuthStore()
  const { 
    notifications, 
    unreadCount, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead 
  } = useNotificationStore()
  
  const [collapsed, setCollapsed] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  
  // 获取通知
  useEffect(() => {
    fetchNotifications()
    
    // 定时刷新通知
    const interval = setInterval(() => {
      fetchNotifications()
    }, 60000) // 每分钟刷新一次
    
    return () => clearInterval(interval)
  }, [fetchNotifications])
  
  // 处理菜单选中
  const getSelectedKey = () => {
    const path = location.pathname
    if (path === '/') return ['dashboard']
    if (path.startsWith('/products')) return ['products']
    if (path.startsWith('/scraper')) return ['scraper']
    return []
  }
  
  // 处理登出
  const handleLogout = () => {
    logout()
    message.success('已成功退出登录')
    navigate('/login')
  }
  
  // 用户菜单
  const userMenu = {
    items: [
      {
        key: 'user-info',
        icon: <UserOutlined />,
        label: (
          <div>
            <div>{user?.fullName || user?.username}</div>
            <div>
              <small style={{ color: 'rgba(0, 0, 0, 0.45)' }}>
                {user?.isAdmin ? '管理员' : '普通用户'}
              </small>
            </div>
          </div>
        ),
        disabled: true,
      },
      { type: 'divider' },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
        onClick: handleLogout,
      },
    ],
  }
  
  // 格式化登录时间
  const formatLoginTime = (dateString) => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  }
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        width={220}
        theme="light"
        className="app-sider"
      >
        <div className="logo">
          {!collapsed ? (
            <Title level={4} style={{ margin: 0 }}>商品统计系统</Title>
          ) : (
            <Title level={4} style={{ margin: 0 }}>统计</Title>
          )}
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={getSelectedKey()}
          items={[
            {
              key: 'dashboard',
              icon: <DashboardOutlined />,
              label: <Link to="/">首页</Link>,
            },
            {
              key: 'products',
              icon: <ShoppingOutlined />,
              label: <Link to="/products">商品列表</Link>,
            },
            {
              key: 'scraper',
              icon: <CloudDownloadOutlined />,
              label: <Link to="/scraper">数据抓取</Link>,
            },
          ]}
        />
      </Sider>
      
      <Layout>
        <Header className="app-header">
          <div className="header-left">
            {React.createElement(
              collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, 
              {
                className: 'trigger',
                onClick: () => setCollapsed(!collapsed),
              }
            )}
          </div>
          
          <div className="header-right">
            {user?.lastLogin && (
              <div className="login-info">
                <Text type="secondary">上次登录: {formatLoginTime(user.lastLogin)}</Text>
              </div>
            )}
            
            <Dropdown
              trigger={['click']}
              open={notificationOpen}
              onOpenChange={setNotificationOpen}
              dropdownRender={() => (
                <NotificationList 
                  notifications={notifications}
                  onRead={markAsRead}
                  onReadAll={markAllAsRead}
                  onClose={() => setNotificationOpen(false)}
                />
              )}
              placement="bottomRight"
            >
              <Badge count={unreadCount} overflowCount={99}>
                <div className="header-icon">
                  <BellOutlined style={{ fontSize: '18px' }} />
                </div>
              </Badge>
            </Dropdown>
            
            <Dropdown menu={userMenu} trigger={['click']} placement="bottomRight">
              <div className="user-dropdown">
                <Avatar icon={<UserOutlined />} />
                {!collapsed && (
                  <span className="username">{user?.username}</span>
                )}
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content className="app-content">
          <PageTransition location={location.pathname} type="fade">
            <Outlet />
          </PageTransition>
        </Content>
      </Layout>
    </Layout>
  )
}

export default AppLayout