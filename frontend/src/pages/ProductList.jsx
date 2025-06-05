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
  Col,
  Empty,
  Spin,
  Alert
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
    setPageSize,
    setSorter,
    resetFilters,
    setFilters,
    error
  } = useProductStore()
  
  const { categories, fetchCategories } = useCategoryStore()
  const { platforms, fetchPlatforms } = usePlatformStore()
  
  const [selectedRowKeys, setSelectedRowKeys] = useState([])
  const [localFilters, setLocalFilters] = useState({})
  const [dataLoaded, setDataLoaded] = useState(false)
  
  // 添加重试功能
  const handleRetry = () => {
    message.info('正在重新加载数据...')
    fetchProducts()
      .then(() => message.success('数据加载成功'))
      .catch(error => message.error(`重新加载失败: ${error.message || '请稍后再试'}`));
  }

  // 渲染错误状态
  const renderError = () => {
    if (!error) return null;
    
    return (
      <div style={{ textAlign: 'center', margin: '20px 0' }}>
        <Alert
          message="加载错误"
          description={error}
          type="error"
          showIcon
        />
        <Button 
          type="primary" 
          onClick={handleRetry} 
          style={{ marginTop: 16 }}
          icon={<ReloadOutlined />}
        >
          重新加载
        </Button>
      </div>
    );
  }
  
  // 初始化数据
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        if (isMounted) {
          // 设置加载状态，但不立即清除已有数据
          // 这样可以避免闪现空白页面
          setDataLoaded(false);
        }
        
        // 并行加载所有数据
        await Promise.all([
          fetchProducts(),
          fetchCategories(),
          fetchPlatforms()
        ]);
        
        if (isMounted) {
          setDataLoaded(true);
        }
      } catch (error) {
        console.error('加载数据失败:', error);
        if (isMounted) {
          message.error('加载数据失败，请刷新页面重试');
          setDataLoaded(true); // 即使出错也要设置加载完成，避免一直显示加载中
        }
      }
    };
    
    loadData();
    
    // 清理函数，防止组件卸载后仍然设置状态
    return () => {
      isMounted = false;
    };
  }, [fetchProducts, fetchCategories, fetchPlatforms]); // 添加依赖项
  
  // 处理表格变化（排序、筛选、分页）
  const handleTableChange = (pagination, filters, sorter) => {
    // 处理排序
    if (sorter && sorter.field) {
      setSorter({
        sort_field: sorter.field,
        sort_order: sorter.order
      })
    }
    
    // 处理分页
    setPage(pagination.current)
    setPageSize(pagination.pageSize)
    
    // 获取数据，包含当前的筛选条件
    const params = {
      page: pagination.current,
      page_size: pagination.pageSize,
    }
    
    // 添加排序参数
    if (sorter && sorter.field) {
      params.sort_field = sorter.field
      params.sort_order = sorter.order
    }
    
    // 合并当前的筛选条件
    fetchProducts(params).catch(error => {
      message.error(`加载数据失败: ${error.message || '请稍后重试'}`)
    })
  }
  
  // 处理搜索
  const handleSearch = (values) => {
    // 初始化所有筛选参数为null，确保删除筛选项后不会使用旧值
    const filterParams = {
      category_id: null,
      platform_id: null,
      name: null,
      min_price: null,
      max_price: null
    }
    
    // 处理分类，只有当值存在时才设置
    if (values.category_id) {
      filterParams.category_id = values.category_id
    }
    
    // 处理平台，只有当值存在时才设置
    if (values.platform_id) {
      filterParams.platform_id = values.platform_id
    }
    
    // 处理名称，只有当值存在时才设置
    if (values.name) {
      filterParams.name = values.name
    }
    
    // 处理价格范围，只有当值存在时才设置
    if (values.price_range && values.price_range[0]) {
      filterParams.min_price = values.price_range[0]
    }
    
    if (values.price_range && values.price_range[1]) {
      filterParams.max_price = values.price_range[1]
    }
    
    // 设置筛选条件并重置页码
    setFilters(filterParams)
    setLocalFilters(filterParams)
    setPage(1)
    
    // 重新获取数据，使用当前的筛选参数
    fetchProducts({
      page: 1,
      ...filterParams
    }).catch(error => {
      message.error(`搜索失败: ${error.message || '请稍后重试'}`)
    })
  }
  
  // 处理重置
  const handleReset = () => {
    form.resetFields()
    resetFilters()
    setLocalFilters({})
    fetchProducts().catch(error => {
      message.error(`重置失败: ${error.message || '请稍后重试'}`)
    })
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
          <a href={record.url} target="_blank" rel="noopener noreferrer">
            {text.length > 30 ? `${text.substring(0, 30)}...` : text}
          </a>
        </Tooltip>
      ),
      sorter: true,
    },
    {
      title: '平台',
      dataIndex: 'platform_name',
      key: 'platform',
      render: (text) => text ? <Tag color={getPlatformColor(text)}>{text}</Tag> : '-',
      filters: platforms.map(p => ({ text: p.name, value: p.id })),
    },
    {
      title: '分类',
      dataIndex: 'category_name',
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
      dataIndex: 'sales_count',
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
    <AnimationWrapper animation="fadeIn" transition={{ duration: 0.2 }}>
      <AnimatedCard animation="fadeIn">
        <Card title="商品列表" extra={<Link to="/products/create"><Button type="primary">添加商品</Button></Link>}>
          {/* 筛选表单 */}
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSearch}
            style={{ marginBottom: 16 }}
          >
            <Row gutter={16}>
              <Col xs={24} sm={12} md={6} lg={6}>
                <Form.Item name="name" label="商品名称">
                  <Input placeholder="输入商品名称" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6} lg={6}>
                <Form.Item name="category_id" label="分类">
                  <Select placeholder="选择分类" allowClear>
                    {categories.map(category => (
                      <Option key={category.id} value={category.id}>{category.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6} lg={6}>
                <Form.Item name="platform_id" label="平台">
                  <Select placeholder="选择平台" allowClear>
                    {platforms.map(platform => (
                      <Option key={platform.id} value={platform.id}>{platform.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={6} lg={6}>
                <Form.Item name="price_range" label="价格范围">
                  <Input.Group compact>
                    <Form.Item name={['price_range', 0]} noStyle>
                      <InputNumber style={{ width: '45%' }} placeholder="最低价" />
                    </Form.Item>
                    <Input
                      style={{ width: '10%', textAlign: 'center' }}
                      placeholder="~"
                      disabled
                    />
                    <Form.Item name={['price_range', 1]} noStyle>
                      <InputNumber style={{ width: '45%' }} placeholder="最高价" />
                    </Form.Item>
                  </Input.Group>
                </Form.Item>
              </Col>
            </Row>
            <Row>
              <Col span={24} style={{ textAlign: 'right' }}>
                <Space>
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>搜索</Button>
                  <Button onClick={handleReset} icon={<ReloadOutlined />}>重置</Button>
                  {selectedRowKeys.length > 0 && (
                    <Popconfirm
                      title="确定要删除选中的商品吗？"
                      onConfirm={handleBatchDelete}
                      okText="确定"
                      cancelText="取消"
                    >
                      <Button danger icon={<DeleteOutlined />}>批量删除</Button>
                    </Popconfirm>
                  )}
                </Space>
              </Col>
            </Row>
          </Form>
          
          {/* 错误信息显示 */}
          {renderError()}
          
          {/* 商品列表表格 - 移除AnimatedList以减少嵌套动画 */}
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
            locale={{
              emptyText: loading ? (
                <Spin tip="加载中..." size="large">
                  <div style={{ padding: '50px 0' }}></div>
                </Spin>
              ) : (
                <Empty description="暂无数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              )
            }}
          />
        </Card>
      </AnimatedCard>
    </AnimationWrapper>
  )
}

export default ProductList