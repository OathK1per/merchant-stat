import React, { useEffect, useState } from 'react'
import { 
  Table, 
  Card, 
  Input, 
  Button, 
  Space, 
  Popconfirm, 
  message, 
  Tag, 
  Tooltip, 
  Form,
  Select,
  InputNumber,
  Row,
  Col
} from 'antd'
import { 
  SearchOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  EyeOutlined,
  ReloadOutlined,
  ShopOutlined,
  TagsOutlined,
  DollarOutlined
} from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { useProductStore } from '../stores/productStore'
import { useCategoryStore } from '../stores/categoryStore'
import { usePlatformStore } from '../stores/platformStore'
import { AnimatedCard, AnimatedList, AnimationWrapper } from '../components/Animation'
import { AnimatedButton } from '../components/Animation'

const { Option } = Select

const ProductList = () => {
  const [form] = Form.useForm()
  const { 
    products, 
    loading, 
    fetchProducts, 
    deleteProduct, 
    total, 
    page, 
    pageSize, 
    setPage, 
    setPageSize 
  } = useProductStore()
  
  const { categories, fetchCategories } = useCategoryStore()
  const { platforms, fetchPlatforms } = usePlatformStore()
  
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [filters, setFilters] = useState({})
  const [sorter, setSorter] = useState({})
  
  // 初始化数据
  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchPlatforms()
  }, [])
  
  // 处理表格变化
  const handleTableChange = (pagination, filters, sorter) => {
    setPage(pagination.current)
    setPageSize(pagination.pageSize)
    
    // 处理排序
    if (sorter.field && sorter.order) {
      setSorter({
        sort_by: sorter.field,
        sort_order: sorter.order === 'ascend' ? 'asc' : 'desc'
      })
    } else {
      setSorter({})
    }
    
    // 重新获取数据
    fetchProducts({
      page: pagination.current,
      limit: pagination.pageSize,
      ...filters,
      ...(sorter.field && sorter.order ? {
        sort_by: sorter.field,
        sort_order: sorter.order === 'ascend' ? 'asc' : 'desc'
      } : {})
    })
  }
  
  // 处理搜索
  const handleSearch = (values) => {
    const formattedFilters = {}
    
    // 格式化过滤条件
    Object.keys(values).forEach(key => {
      if (values[key] !== undefined && values[key] !== null && values[key] !== '') {
        if (key === 'price_range') {
          if (values[key][0]) formattedFilters.min_price = values[key][0]
          if (values[key][1]) formattedFilters.max_price = values[key][1]
        } else {
          formattedFilters[key] = values[key]
        }
      }
    })
    
    setFilters(formattedFilters)
    setPage(1) // 重置页码
    
    // 获取数据
    fetchProducts({
      page: 1,
      ...formattedFilters,
      ...sorter
    })
  }
  
  // 重置筛选
  const handleReset = () => {
    form.resetFields()
    setFilters({})
    setSorter({})
    setPage(1)
    fetchProducts({ page: 1 })
  }
  
  // 处理删除
  const handleDelete = async (id) => {
    try {
      await deleteProduct(id)
      message.success('删除成功')
    } catch (error) {
      message.error('删除失败: ' + error.message)
    }
  }
  
  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的商品')
      return
    }
    
    try {
      // 逐个删除
      for (const id of selectedRowKeys) {
        await deleteProduct(id)
      }
      
      message.success(`成功删除 ${selectedRowKeys.length} 个商品`)
      setSelectedRowKeys([])
    } catch (error) {
      message.error('批量删除失败: ' + error.message)
    }
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
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Tooltip title={text}>
          <Link to={`/products/${record.id}`}>{text.length > 30 ? `${text.substring(0, 30)}...` : text}</Link>
        </Tooltip>
      ),
      sorter: true,
    },
    {
      title: '平台',
      dataIndex: ['platform', 'name'],
      key: 'platform',
      render: (text) => text ? <Tag color={getPlatformColor(text)}>{text}</Tag> : '-',
      filters: platforms.map(p => ({ text: p.name, value: p.id })),
    },
    {
      title: '分类',
      dataIndex: ['category', 'name'],
      key: 'category',
      render: (text) => text || '-',
      filters: categories.map(c => ({ text: c.name, value: c.id })),
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (text) => text ? `¥${text.toFixed(2)}` : '-',
      sorter: true,
    },
    {
      title: '销量',
      dataIndex: 'sales',
      key: 'sales',
      render: (text) => text || 0,
      sorter: true,
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      render: (text) => text ? new Date(text).toLocaleString() : '-',
      sorter: true,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <AnimatedButton animationType="scale" type="text" icon={<EyeOutlined />} title="查看详情">
            <Link to={`/products/${record.id}`}>查看</Link>
          </AnimatedButton>
          <AnimatedButton animationType="scale" type="text" icon={<EditOutlined />} title="编辑商品">
            <Link to={`/products/edit/${record.id}`}>编辑</Link>
          </AnimatedButton>
          <Popconfirm
            title="确定要删除这个商品吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <AnimatedButton animationType="scale" type="text" danger icon={<DeleteOutlined />} title="删除商品">
              删除
            </AnimatedButton>
          </Popconfirm>
        </Space>
      ),
    },
  ]
  
  // 行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (keys) => setSelectedRowKeys(keys),
  }
  
  return (
    <AnimationWrapper type="fadeIn">
      <div className="product-list-container">
        <AnimatedCard 
          animationType="hover"
          className="filter-card" 
          style={{ marginBottom: 16 }}
        >
          <Form
            form={form}
            name="product_filter"
            layout="vertical"
            onFinish={handleSearch}
          >
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="name" label="商品名称">
                  <Input 
                    placeholder="输入商品名称" 
                    prefix={<SearchOutlined />} 
                  />
                </Form.Item>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="category_id" label="分类">
                  <Select 
                    placeholder="选择分类" 
                    allowClear
                    prefix={<TagsOutlined />}
                  >
                    {categories.map(category => (
                      <Option key={category.id} value={category.id}>{category.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="platform_id" label="平台">
                  <Select 
                    placeholder="选择平台" 
                    allowClear
                    prefix={<ShopOutlined />}
                  >
                    {platforms.map(platform => (
                      <Option key={platform.id} value={platform.id}>{platform.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <Form.Item name="price_range" label="价格范围">
                  <Input.Group compact>
                    <Form.Item
                      name={['price_range', 0]}
                      noStyle
                    >
                      <InputNumber 
                        style={{ width: '45%' }} 
                        placeholder="最低价" 
                        min={0}
                        prefix={<DollarOutlined />}
                      />
                    </Form.Item>
                    <Input
                      style={{ width: '10%', textAlign: 'center', pointerEvents: 'none', backgroundColor: '#fff' }}
                      placeholder="~"
                      disabled
                    />
                    <Form.Item
                      name={['price_range', 1]}
                      noStyle
                    >
                      <InputNumber 
                        style={{ width: '45%' }} 
                        placeholder="最高价" 
                        min={0}
                        prefix={<DollarOutlined />}
                      />
                    </Form.Item>
                  </Input.Group>
                </Form.Item>
              </Col>
            </Row>
            
            <Row>
              <Col span={24} style={{ textAlign: 'right' }}>
                <Space>
                  <AnimatedButton animationType="bounce" onClick={handleReset} icon={<ReloadOutlined />}>
                    重置
                  </AnimatedButton>
                  <AnimatedButton animationType="bounce" type="primary" htmlType="submit" icon={<SearchOutlined />}>
                    搜索
                  </AnimatedButton>
                  {selectedRowKeys.length > 0 && (
                    <Popconfirm
                      title={`确定要删除选中的 ${selectedRowKeys.length} 个商品吗？`}
                      onConfirm={handleBatchDelete}
                      okText="确定"
                      cancelText="取消"
                    >
                      <AnimatedButton animationType="bounce" danger icon={<DeleteOutlined />}>
                        批量删除 ({selectedRowKeys.length})
                      </AnimatedButton>
                    </Popconfirm>
                  )}
                </Space>
              </Col>
            </Row>
          </Form>
        </AnimatedCard>
        
        <AnimatedCard animationType="hover">
          <AnimatedList animation="slideUp" staggerDelay={0.05}>
            <Table
              rowKey="id"
              rowSelection={rowSelection}
              columns={columns}
              dataSource={products}
              loading={loading}
              pagination={{
                current: page,
                pageSize: pageSize,
                total: total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `共 ${total} 条记录`,
              }}
              onChange={handleTableChange}
            />
          </AnimatedList>
        </AnimatedCard>
      </div>
    </AnimationWrapper>
  )
}

export default ProductList