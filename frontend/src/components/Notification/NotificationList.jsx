import React from 'react'
import { List, Typography, Button, Empty, Spin, Badge } from 'antd'
import { CheckOutlined, BellOutlined } from '@ant-design/icons'

const { Text, Title } = Typography

const NotificationList = ({ notifications, loading, onRead, onReadAll, onClose }) => {
  // 格式化通知时间
  const formatTime = (dateString) => {
    if (!dateString) return ''
    
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHour = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHour / 24)
    
    if (diffDay > 0) {
      return `${diffDay}天前`
    } else if (diffHour > 0) {
      return `${diffHour}小时前`
    } else if (diffMin > 0) {
      return `${diffMin}分钟前`
    } else {
      return '刚刚'
    }
  }
  
  return (
    <div className="notification-dropdown">
      <div className="notification-header">
        <Title level={5} style={{ margin: 0 }}>
          <BellOutlined /> 系统通知
        </Title>
        
        <Button 
          type="link" 
          size="small" 
          onClick={onReadAll}
          disabled={!notifications.some(n => !n.is_read)}
        >
          <CheckOutlined /> 全部已读
        </Button>
      </div>
      
      <div className="notification-content">
        {loading ? (
          <div className="notification-loading">
            <Spin />
          </div>
        ) : notifications.length === 0 ? (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE} 
            description="暂无通知" 
            style={{ margin: '20px 0' }}
          />
        ) : (
          <List
            dataSource={notifications}
            renderItem={item => (
              <List.Item
                className={`notification-item ${!item.is_read ? 'unread' : ''}`}
                actions={[
                  !item.is_read && (
                    <Button 
                      type="link" 
                      size="small" 
                      onClick={() => onRead(item.id)}
                    >
                      标为已读
                    </Button>
                  )
                ]}
              >
                <List.Item.Meta
                  title={
                    <div className="notification-title">
                      {!item.is_read && <Badge status="processing" />}
                      <span>{item.title}</span>
                    </div>
                  }
                  description={
                    <div>
                      <div className="notification-message">{item.message}</div>
                      <Text type="secondary" className="notification-time">
                        {formatTime(item.created_at)}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>
      
      <div className="notification-footer">
        <Button type="link" onClick={onClose} block>
          关闭
        </Button>
      </div>
    </div>
  )
}

export default NotificationList