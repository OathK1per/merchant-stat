import React, { useState, useEffect } from 'react'
import { Table, Card, Input, Button, Space, Tag, message, Image, Tooltip, Modal, Descriptions } from 'antd'
import { SearchOutlined, ReloadOutlined, EyeOutlined, LinkOutlined } from '@ant-design/icons'
import { productDetailService } from '../services/api'

const { Search } = Input

const ProductDetailList = () => {
  const [loading, setLoading] = useState(false)
  const [productDetails, setProductDetails] = useState([])
  const [searchText, setSearchText] = useState('')
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  })
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [sortField, setSortField] = useState(null)
  const [sortOrder, setSortOrder] = useState(null)

  // 获取产品详情列表
  const fetchProductDetails = async (page = 1, pageSize = 20, search = '', sortField = null, sortOrder = null) => {
    setLoading(true)
    try {
      // 这里需要根据实际API调整
      const params = {
        page,
        pageSize,
        search,
      }
      
      // 添加排序参数
      if (sortField && sortOrder) {
        params.sortField = sortField
        params.sortOrder = sortOrder
      }
      
      const response = await productDetailService.getList(params)
      
      setProductDetails(response.data || [])
      setPagination({
        current: page,
        pageSize,
        total: response.total || 0,
      })
    } catch (error) {
      message.error('获取产品详情列表失败')
      console.error('Error fetching product details:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProductDetails()
  }, [])

  // 处理搜索
  const handleSearch = (value) => {
    setSearchText(value)
    fetchProductDetails(1, pagination.pageSize, value, sortField, sortOrder)
  }

  // 处理刷新
  const handleRefresh = () => {
    fetchProductDetails(pagination.current, pagination.pageSize, searchText, sortField, sortOrder)
  }

  // 处理分页和排序变化
  const handleTableChange = (paginationInfo, filters, sorter) => {
    let newSortField = null
    let newSortOrder = null
    
    // 处理排序
    if (sorter && sorter.field && sorter.order) {
      newSortField = sorter.field
      newSortOrder = sorter.order
      setSortField(newSortField)
      setSortOrder(newSortOrder)
    } else if (!sorter || !sorter.order) {
      // 清除排序
      setSortField(null)
      setSortOrder(null)
    }
    
    fetchProductDetails(
      paginationInfo.current, 
      paginationInfo.pageSize, 
      searchText, 
      newSortField, 
      newSortOrder
    )
  }

  // 查看详情
  const handleViewDetail = (record) => {
    setSelectedProduct(record)
    setDetailModalVisible(true)
  }

  // 关闭详情弹窗
  const handleCloseDetailModal = () => {
    setDetailModalVisible(false)
    setSelectedProduct(null)
  }

  // 打开链接
  const openLink = (url) => {
    if (url) {
      window.open(url, '_blank')
    }
  }

  const columns = [
    {
      title: '商品图片',
      dataIndex: 'img_url',
      key: 'img_url',
      width: 100,
      render: (imgUrl, record) => (
        <Image
          width={60}
          height={60}
          src={imgUrl}
          alt={record.img_text || record.item_code}
          style={{ objectFit: 'cover', borderRadius: 4 }}
          fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
        />
      ),
    },
    {
      title: '商品代码',
      dataIndex: 'item_code',
      key: 'item_code',
      width: 120,
      render: (text) => (
        <Tooltip title={text}>
          <span style={{ fontFamily: 'monospace' }}>{text}</span>
        </Tooltip>
      ),
    },
    {
      title: '商品名称',
      dataIndex: 'img_text',
      key: 'img_text',
      width: 200,
      ellipsis: {
        showTitle: false,
      },
      render: (text) => (
        <Tooltip title={text}>
          <span>{text || '-'}</span>
        </Tooltip>
      ),
    },
    {
      title: '价格',
      dataIndex: 'org_price',
      key: 'org_price',
      width: 100,
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      render: (price) => (
        <span style={{ fontWeight: 'bold', color: '#f50' }}>
          {price || '-'}
        </span>
      ),
    },
    {
      title: '店铺链接',
      dataIndex: 'seller_store_url',
      key: 'seller_store_url',
      width: 120,
      render: (url) => (
        url ? (
          <Button
            type="link"
            icon={<LinkOutlined />}
            onClick={() => openLink(url)}
            size="small"
          >
            店铺
          </Button>
        ) : '-'
      ),
    },
    {
      title: '最近销量',
      dataIndex: 'recentlysold',
      key: 'recentlysold',
      width: 100,
      sorter: true,
      sortDirections: ['ascend', 'descend'],
      render: (sold) => (
        <span style={{ color: '#52c41a' }}>
          {sold || '-'}
        </span>
      ),
    },
    {
      title: '域名',
      dataIndex: 'domain_name',
      key: 'domain_name',
      width: 120,
      render: (domain) => (
        <Tag color="blue">{domain || '-'}</Tag>
      ),
    },
    {
      title: '评分',
      dataIndex: 'reviews_core',
      key: 'reviews_core',
      width: 80,
      render: (score) => (
        <span style={{ color: '#faad14' }}>
          {score || '-'}
        </span>
      ),
    },
    {
      title: '商品链接',
      dataIndex: 'link_url',
      key: 'link_url',
      width: 120,
      render: (url) => (
        url ? (
          <Button
            type="link"
            icon={<LinkOutlined />}
            onClick={() => openLink(url)}
            size="small"
          >
            查看商品
          </Button>
        ) : '-'
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
            size="small"
          >
            查看
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div className="product-detail-list">
      <Card>
        <div style={{ marginBottom: 16 }}>
          <Space>
            <Search
              placeholder="搜索商品名称或代码"
              allowClear
              enterButton={<SearchOutlined />}
              size="middle"
              style={{ width: 300 }}
              onSearch={handleSearch}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              loading={loading}
            >
              刷新
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={productDetails}
          rowKey="item_code"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
          }}
          onChange={handleTableChange}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title="商品详细信息"
        open={detailModalVisible}
        onCancel={handleCloseDetailModal}
        footer={[
          <Button key="close" onClick={handleCloseDetailModal}>
            关闭
          </Button>,
        ]}
        width={1200}
      >
        {selectedProduct && (
          <div>
            <div style={{ marginBottom: 16, textAlign: 'center' }}>
              <Image
                width={200}
                height={200}
                src={selectedProduct.img_url}
                alt={selectedProduct.img_text || selectedProduct.item_code}
                style={{ objectFit: 'cover', borderRadius: 8 }}
              />
            </div>
            <Descriptions bordered column={2} size="small">
              <Descriptions.Item label="商品代码" span={2}>
                <span style={{ fontFamily: 'monospace' }}>{selectedProduct.item_code}</span>
              </Descriptions.Item>
              <Descriptions.Item label="商品名称" span={2}>
                {selectedProduct.img_text || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="原价">
                {selectedProduct.org_o_price || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="现价">
                {selectedProduct.org_price || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="原价区间">
                {selectedProduct.o_price_interval || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="现价区间">
                {selectedProduct.price_interval || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="最近销量">
                {selectedProduct.recentlysold || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="域名">
                {selectedProduct.domain_name || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="产品ID">
                {selectedProduct.product_id || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="评分">
                {selectedProduct.reviews_core || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="反馈评分百分比">
                {selectedProduct.feedback_score_percentum || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="目录ID">
                {selectedProduct.catalog_id || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="店铺链接" span={2}>
                {selectedProduct.seller_store_url ? (
                  <Button
                    type="link"
                    icon={<LinkOutlined />}
                    onClick={() => openLink(selectedProduct.seller_store_url)}
                  >
                    {selectedProduct.seller_store_url}
                  </Button>
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="商品链接" span={2}>
                {selectedProduct.link_url ? (
                  <Button
                    type="link"
                    icon={<LinkOutlined />}
                    onClick={() => openLink(selectedProduct.link_url)}
                  >
                    {selectedProduct.link_url}
                  </Button>
                ) : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间" span={2}>
                {selectedProduct.created_at ? new Date(selectedProduct.created_at).toLocaleString('zh-CN') : '-'}
              </Descriptions.Item>
              {selectedProduct.json_object && (
                <Descriptions.Item label="JSON数据" span={2}>
                  <pre style={{ 
                    background: '#f5f5f5', 
                    padding: 8, 
                    borderRadius: 4, 
                    fontSize: 12,
                    maxHeight: 200,
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(JSON.parse(selectedProduct.json_object), null, 2)}
                  </pre>
                </Descriptions.Item>
              )}
            </Descriptions>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ProductDetailList