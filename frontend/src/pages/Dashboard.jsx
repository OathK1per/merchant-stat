import React, { useEffect, useState } from 'react'
import { Row, Col, Card, Statistic, List, Typography, Spin, Empty, Tag } from 'antd'
import { 
  ShoppingOutlined, 
  TagsOutlined, 
  ShopOutlined, 
  RiseOutlined,
  FallOutlined,
  FireOutlined
} from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { useProductStore } from '../stores/productStore'
import { systemAPI } from '../services/api'
import { AnimatedCard, AnimatedList, AnimationWrapper } from '../components/Animation'

const { Title, Text } = Typography

const Dashboard = () => {
  const { fetchProducts, products, loading } = useProductStore()
  const [stats, setStats] = useState(null)
  const [topProducts, setTopProducts] = useState([])
  const [statsLoading, setStatsLoading] = useState(true)
  
  // 获取统计数据
  useEffect(() => {
    const getStats = async () => {
      try {
        setStatsLoading(true)
        const data = await systemAPI.getStats()
        setStats(data)
        
        // 获取热门商品
        const topProductsData = await useProductStore.getState().fetchProducts({
          limit: 5,
          sort_by: 'sales',
          sort_order: 'desc'
        })
        
        setTopProducts(topProductsData?.items || [])
      } catch (error) {
        console.error('获取统计数据失败:', error)
      } finally {
        setStatsLoading(false)
      }
    }
    
    getStats()
  }, [])
  
  // 格式化价格
  const formatPrice = (price) => {
    return price ? `¥${price.toFixed(2)}` : '-'
  }
  
  // 获取平台标签颜色
  const getPlatformColor = (platform) => {
    const colorMap = {
      'Amazon': 'orange',
      'eBay': 'blue',
      'AliExpress': 'red',
      'Shopee': 'green',
      'Lazada': 'purple',
      'Wish': 'cyan',
      'Walmart': 'geekblue',
      'Etsy': 'volcano',
    }
    
    return colorMap[platform] || 'default'
  }
  
  return (
    <AnimationWrapper type="fadeIn">
      <div className="dashboard-container">
        <Title level={2}>系统概览</Title>
        
        {statsLoading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : (
          <>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={12} lg={6}>
                <AnimatedCard animationType="scale" animationProps={{ transition: { delay: 0.1 } }}>
                  <Statistic 
                    title="商品总数" 
                    value={stats?.product_count || 0} 
                    prefix={<ShoppingOutlined />} 
                  />
                </AnimatedCard>
              </Col>
              
              <Col xs={24} sm={12} md={12} lg={6}>
                <AnimatedCard animationType="scale" animationProps={{ transition: { delay: 0.2 } }}>
                  <Statistic 
                    title="分类总数" 
                    value={stats?.category_count || 0} 
                    prefix={<TagsOutlined />} 
                  />
                </AnimatedCard>
              </Col>
              
              <Col xs={24} sm={12} md={12} lg={6}>
                <AnimatedCard animationType="scale" animationProps={{ transition: { delay: 0.3 } }}>
                  <Statistic 
                    title="平台总数" 
                    value={stats?.platform_count || 0} 
                    prefix={<ShopOutlined />} 
                  />
                </AnimatedCard>
              </Col>
              
              <Col xs={24} sm={12} md={12} lg={6}>
                <AnimatedCard animationType="scale" animationProps={{ transition: { delay: 0.4 } }}>
                  <Statistic 
                    title="今日新增" 
                    value={stats?.today_added || 0} 
                    prefix={<RiseOutlined />} 
                    valueStyle={{ color: '#3f8600' }}
                  />
                </AnimatedCard>
              </Col>
            </Row>
            
            <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
              <Col xs={24} lg={12}>
                <AnimatedCard 
                  animationType="hover"
                  title={
                    <span>
                      <FireOutlined style={{ color: '#ff4d4f' }} /> 热门商品
                    </span>
                  }
                  className="dashboard-card"
                >
                  {topProducts.length === 0 ? (
                    <Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  ) : (
                    <AnimatedList animation="slideUp" staggerDelay={0.08}>
                      <List
                        dataSource={topProducts}
                        renderItem={item => (
                          <List.Item>
                            <List.Item.Meta
                              title={
                                <Link to={`/products/${item.id}`}>{item.name}</Link>
                              }
                              description={
                                <div>
                                  <Tag color={getPlatformColor(item.platform?.name)}>
                                    {item.platform?.name || '未知平台'}
                                  </Tag>
                                  <Text type="secondary" style={{ marginLeft: '8px' }}>
                                    销量: {item.sales || 0}
                                  </Text>
                                  <Text type="secondary" style={{ marginLeft: '8px' }}>
                                    价格: {formatPrice(item.price)}
                                  </Text>
                                </div>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    </AnimatedList>
                  )}
                </AnimatedCard>
              </Col>
              
              <Col xs={24} lg={12}>
                <AnimatedCard 
                  animationType="hover"
                  title={
                    <span>
                      <ShopOutlined style={{ color: '#1890ff' }} /> 平台分布
                    </span>
                  }
                  className="dashboard-card"
                >
                  {!stats?.platform_distribution || Object.keys(stats.platform_distribution).length === 0 ? (
                    <Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  ) : (
                    <AnimatedList animation="slideLeft" staggerDelay={0.08}>
                      <List
                        dataSource={Object.entries(stats.platform_distribution).sort((a, b) => b[1] - a[1])}
                        renderItem={([platform, count]) => (
                          <List.Item>
                            <List.Item.Meta
                              title={
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                  <span>
                                    <Tag color={getPlatformColor(platform)}>{platform}</Tag>
                                  </span>
                                  <span>{count} 件商品</span>
                                </div>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    </AnimatedList>
                  )}
                </AnimatedCard>
              </Col>
            </Row>
            
            <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
              <Col span={24}>
                <AnimatedCard 
                  animationType="hover"
                  title={
                    <span>
                      <TagsOutlined style={{ color: '#722ed1' }} /> 分类分布
                    </span>
                  }
                  className="dashboard-card"
                >
                  {!stats?.category_distribution || Object.keys(stats.category_distribution).length === 0 ? (
                    <Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                  ) : (
                    <Row gutter={[16, 16]}>
                      {Object.entries(stats.category_distribution)
                        .sort((a, b) => b[1] - a[1])
                        .map(([category, count], index) => (
                          <Col key={category} xs={12} sm={8} md={6} lg={4}>
                            <AnimationWrapper type="staggered" index={index}>
                              <Card size="small">
                                <Statistic 
                                  title={category} 
                                  value={count} 
                                  suffix="件" 
                                  valueStyle={{ fontSize: '16px' }}
                                />
                              </Card>
                            </AnimationWrapper>
                          </Col>
                        ))
                      }
                    </Row>
                  )}
                </AnimatedCard>
              </Col>
            </Row>
          </>
        )}
      </div>
    </AnimationWrapper>
  )
}

export default Dashboard