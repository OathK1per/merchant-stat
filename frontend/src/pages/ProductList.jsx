import React, { useEffect, useState } from 'react'
import { 
  Table, 
  Card, 
  Input, 
  Button, 
  Space, 
  Select, 
  Form, 
  InputNumber, 
  Tag, 
  Tooltip, 
  Typography, 
  Popconfirm,
  message,
  Image
} from 'antd'
import { 
  SearchOutlined, 
  ReloadOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  EyeOutlined,
  LinkOutlined
} from '@ant-design/icons'
import { useProductStore } from '../stores/productStore'

const { Title, Text } = Typography
const { Option } = Select

const ProductList = () => {
  const { 
    products, 
    total, 
    loading, 
    filters, 
    pagination, 
    categories, 
    platforms,
    fetchProducts, 
    fetchCategories, 
    fetchPlatforms, 
    setFilters, 
    setPagination, 
    resetFilters,
    deleteProduct
  } = useProductStore()
  
  const [form] = Form.useForm()
  
  // 初始化数据
  useEffect(() => {
    const init = async () => {
      await fetchCategories()
      await fetchPlatforms()
      await fetchProducts()
    }
    
    init()
  }, [])
  
  // 当筛选条件或分页变化时，重新获取数据
  useEffect(() => {
    fetchProducts()
  }, [filters, pagination])
  
  // 处理筛选表单提交
  const handleFilterSubmit = (values) => {
    setFilters(values)
  }
  
  // 重置筛选条件
  const handleReset = () => {
    form.resetFields()
    resetFilters()
  }
  
  // 处理分页变化
  const handleTableChange = (pagination, filters, sorter) => {
    setPagination({
      current: pagination.current,
      pageSize: pagination.pageSize,
    })
    
    // 处理排序
    if (sorter.field && sorter.order) {
      const sortOrder = sorter.order === 'ascend' ? 'asc' : 'desc'
      setFilters({
        sort_by: sorter.field,
        sort_order: sortOrder,
      })
    }
  }
  
  // 处理删除商品
  const handleDelete = async (id) => {
    try {
      await deleteProduct(id)
      message.success('商品删除成功')
    } catch (error) {
      message.error('删除失败: ' + (error.message || '未知错误'))
    }
  }
  
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
  
  // 表格列定义
  const columns = [
    {
      title: '商品图片',
      dataIndex: 'image_url',
      key: 'image_url',
      width: 100,
      render: (image_url) => (
        image_url ? (
          <Image 
            src={image_url} 
            alt="商品图片" 
            style={{ width: 60, height: 60, objectFit: 'cover' }}
            fallback="data:image/png;base64,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"
          />
        ) : (
          <div style={{ width: 60, height: 60, background: '#f0f0f0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Text type="secondary">无图片</Text>
          </div>
        )
      ),
    },
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: {
        showTitle: false,
      },
      render: (name, record) => (
        <Tooltip title={name}>
          <a href={record.url} target="_blank" rel="noopener noreferrer">
            {name} <LinkOutlined />
          </a>
        </Tooltip>
      ),
      sorter: true,
    },
    {
      title: '平台',
      dataIndex: ['platform', 'name'],
      key: 'platform',
      render: (platform) => (
        platform ? <Tag color={getPlatformColor(platform)}>{platform}</Tag> : '-'
      ),
      filters: platforms.map(p => ({ text: p.name, value: p.id })),
    },
    {
      title: '分类',
      dataIndex: ['category', 'name'],
      key: 'category',
      render: (category) => category || '-',
      filters: categories.map(c => ({ text: c.name, value: c.id })),
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price) => formatPrice(price),
      sorter: true,
    },
    {
      title: '销量',
      dataIndex: 'sales',
      key: 'sales',
      render: (sales) => sales || '-',
      sorter: true,
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (date) => new Date(date).toLocaleString(),
      sorter: true,
      defaultSortOrder: 'descend',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            title="查看详情"
            onClick={() => window.open(record.url, '_blank')}
          />
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            title="编辑商品"
          />
          <Popconfirm
            title="确定要删除这个商品吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              title="删除商品"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]
  
  return (
    <div className="product-list-container">
      <Title level={2}>商品列表</Title>
      
      <Card className="filter-card">
        <Form
          form={form}
          name="product_filter"
          layout="inline"
          onFinish={handleFilterSubmit}
          initialValues={filters}
        >
          <Form.Item name="name" label="商品名称">
            <Input 
              placeholder="搜索商品名称" 
              allowClear 
              prefix={<SearchOutlined />} 
            />
          </Form.Item>
          
          <Form.Item name="category_id" label="商品分类">
            <Select 
              placeholder="选择分类" 
              allowClear 
              style={{ width: 150 }}
            >
              {categories.map(category => (
                <Option key={category.id} value={category.id}>{category.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item name="platform_id" label="电商平台">
            <Select 
              placeholder="选择平台" 
              allowClear 
              style={{ width: 150 }}
            >
              {platforms.map(platform => (
                <Option key={platform.id} value={platform.id}>{platform.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item label="价格范围">
            <Input.Group compact>
              <Form.Item name="min_price" noStyle>
                <InputNumber 
                  placeholder="最低价" 
                  style={{ width: 100 }} 
                  min={0}
                />
              </Form.Item>
              <Input 
                style={{ width: 30, pointerEvents: 'none', backgroundColor: '#fff' }}
                placeholder="~"
                disabled
              />
              <Form.Item name="max_price" noStyle>
                <InputNumber 
                  placeholder="最高价" 
                  style={{ width: 100 }} 
                  min={0}
                />
              </Form.Item>
            </Input.Group>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                筛选
              </Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>
                重置
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
      
      <Card className="table-card">
        <Table 
          columns={columns} 
          dataSource={products} 
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
          onChange={handleTableChange}
        />
      </Card>
    </div>
  )
}

export default ProductList