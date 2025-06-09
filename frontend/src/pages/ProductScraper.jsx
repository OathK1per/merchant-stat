import React, { useState, useEffect } from 'react'
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Typography, 
  Divider, 
  Select, 
  InputNumber, 
  Upload, 
  message, 
  Spin, 
  Modal, 
  Tabs,
  Table,
  Space,
  Tag
} from 'antd'
import { 
  CloudDownloadOutlined, 
  LinkOutlined, 
  PlusOutlined, 
  UploadOutlined, 
  FileExcelOutlined,
  DeleteOutlined,
  EditOutlined
} from '@ant-design/icons'
import { useProductStore } from '../stores/productStore'

const { Title, Text, Paragraph } = Typography
const { Option } = Select
const { TabPane } = Tabs
const { TextArea } = Input

const ProductScraper = () => {
  const { 
    scrapeProduct, 
    createProduct, 
    createProductsBulk,
    categories, 
    platforms, 
    loading, 
    error,
    fetchCategories,
    fetchPlatforms
  } = useProductStore()
  
  const [form] = Form.useForm()
  const [manualForm] = Form.useForm()
  const [bulkForm] = Form.useForm()
  
  const [scrapedProduct, setScrapedProduct] = useState(null)
  const [manualModalVisible, setManualModalVisible] = useState(false)
  const [bulkProducts, setBulkProducts] = useState([])
  const [editingProduct, setEditingProduct] = useState(null)
  
  // 加载分类和平台数据
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        // 设置加载状态但不清除现有数据
        if (isMounted) {
          // 并行获取数据
          await Promise.all([
            fetchCategories(),
            fetchPlatforms()
          ]);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load data:', err);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [fetchCategories, fetchPlatforms]);
  
  // 处理错误信息
  useEffect(() => {
    if (error) {
      message.error(error)
    }
  }, [error])
  
  // 处理URL抓取
  const handleScrape = async (values) => {
    try {
      const product = await scrapeProduct(values.url)
      if (product) {
        setScrapedProduct(product)
        message.success('商品信息抓取成功！')
        form.resetFields() // 清空输入栏
      }
    } catch (error) {
      message.error('抓取失败: ' + (error.message || '未知错误'))
    }
  }
  
  // 处理手动添加商品
  const handleManualSubmit = async (values) => {
    try {
      const product = await createProduct(values)
      if (product) {
        message.success('商品添加成功')
        manualForm.resetFields()
        setManualModalVisible(false)
      }
    } catch (error) {
      message.error('添加失败: ' + (error.message || '未知错误'))
    }
  }
  
  // 处理批量添加商品
  const handleBulkSubmit = async () => {
    if (bulkProducts.length === 0) {
      message.warning('请先添加商品数据')
      return
    }
    
    try {
      const result = await createProductsBulk(bulkProducts)
      if (result) {
        message.success(`成功导入 ${result.length} 条商品数据`)
        setBulkProducts([])
      }
    } catch (error) {
      message.error('批量导入失败: ' + (error.message || '未知错误'))
    }
  }
  
  // 添加商品到批量列表
  const addToBulkList = () => {
    bulkForm.validateFields().then(values => {
      if (editingProduct) {
        // 更新现有商品
        const updatedProducts = bulkProducts.map(item => 
          item.tempId === editingProduct.tempId ? { ...values, tempId: editingProduct.tempId } : item
        )
        setBulkProducts(updatedProducts)
        setEditingProduct(null)
      } else {
        // 添加新商品
        const newProduct = {
          ...values,
          tempId: Date.now(), // 临时ID用于前端标识
        }
        setBulkProducts([...bulkProducts, newProduct])
      }
      
      bulkForm.resetFields()
      message.success(editingProduct ? '商品已更新' : '商品已添加到列表')
    })
  }
  
  // 编辑批量列表中的商品
  const editBulkProduct = (product) => {
    setEditingProduct(product)
    bulkForm.setFieldsValue(product)
  }
  
  // 删除批量列表中的商品
  const deleteBulkProduct = (tempId) => {
    setBulkProducts(bulkProducts.filter(item => item.tempId !== tempId))
    message.success('商品已从列表中移除')
  }
  
  // 批量列表表格列定义
  const bulkColumns = [
    {
      title: '商品名称',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: '平台',
      dataIndex: 'platform_id',
      key: 'platform_id',
      render: (platformId) => {
        const platform = platforms.find(p => p.id === platformId)
        return platform ? platform.name : '-'
      },
    },
    {
      title: '分类',
      dataIndex: 'category_id',
      key: 'category_id',
      render: (categoryId) => {
        const category = categories.find(c => c.id === categoryId)
        return category ? category.name : '-'
      },
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price, record) => {
        if (!price) return '-'
        const currency = record.currency || 'USD'
        return `${currency} ${price}`
      },
    },
    {
      title: '销量',
      dataIndex: 'sales',
      key: 'sales',
      render: (sales) => sales || '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => editBulkProduct(record)}
            title="编辑"
          />
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => deleteBulkProduct(record.tempId)}
            title="删除"
          />
        </Space>
      ),
    },
  ]
  
  return (
    <div className="scraper-container">
      <Title level={2}>数据抓取</Title>
      
      <Tabs defaultActiveKey="url">
        <TabPane 
          tab={
            <span>
              <LinkOutlined /> URL抓取
            </span>
          } 
          key="url"
        >
          <Card className="scraper-card">
            <Form
              form={form}
              name="scraper_form"
              onFinish={handleScrape}
              layout="vertical"
            >
              <Form.Item
                name="url"
                label="商品URL"
                rules={[{ required: true, message: '请输入商品URL' }]}
              >
                <Input 
                  placeholder="输入跨境电商平台商品URL" 
                  prefix={<LinkOutlined />} 
                  allowClear
                />
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<CloudDownloadOutlined />} 
                  loading={loading}
                >
                  开始抓取
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <PlusOutlined /> 手动添加
            </span>
          } 
          key="manual"
        >
          <Card className="scraper-card">
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setManualModalVisible(true)}
            >
              添加商品
            </Button>
            
            <Modal
              title="手动添加商品"
              open={manualModalVisible}
              onCancel={() => setManualModalVisible(false)}
              footer={null}
              width={700}
            >
              <Form
                form={manualForm}
                name="manual_form"
                onFinish={handleManualSubmit}
                layout="vertical"
              >
                <Form.Item
                  name="name"
                  label="商品名称"
                  rules={[{ required: true, message: '请输入商品名称' }]}
                >
                  <Input placeholder="输入商品名称" />
                </Form.Item>
                
                <Form.Item
                  name="url"
                  label="商品URL"
                  rules={[{ required: true, message: '请输入商品URL' }]}
                >
                  <Input placeholder="输入商品URL" />
                </Form.Item>
                
                <Form.Item
                  name="image_url"
                  label="商品图片URL"
                >
                  <Input placeholder="输入商品图片URL" />
                </Form.Item>
                
                <Form.Item
                  name="platform_id"
                  label="电商平台"
                  rules={[{ required: true, message: '请选择电商平台' }]}
                >
                  <Select placeholder="选择电商平台">
                    {platforms.map(platform => (
                      <Option key={platform.id} value={platform.id}>{platform.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
                
                <Form.Item
                  name="category_id"
                  label="商品分类"
                  rules={[{ required: true, message: '请选择商品分类' }]}
                >
                  <Select placeholder="选择商品分类">
                    {categories.map(category => (
                      <Option key={category.id} value={category.id}>{category.name}</Option>
                    ))}
                  </Select>
                </Form.Item>
                
                <Form.Item
                  name="price"
                  label="商品价格"
                >
                  <InputNumber 
                    placeholder="输入商品价格" 
                    min={0} 
                    precision={2} 
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                
                <Form.Item
                  name="sales"
                  label="销量"
                >
                  <InputNumber 
                    placeholder="输入销量" 
                    min={0} 
                    style={{ width: '100%' }}
                  />
                </Form.Item>
                
                <Form.Item
                  name="parameters"
                  label="商品参数"
                >
                  <TextArea 
                    placeholder="输入商品参数，JSON格式" 
                    rows={4}
                  />
                </Form.Item>
                
                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    style={{ marginRight: '8px' }}
                  >
                    保存
                  </Button>
                  <Button onClick={() => setManualModalVisible(false)}>
                    取消
                  </Button>
                </Form.Item>
              </Form>
            </Modal>
          </Card>
        </TabPane>
        
        <TabPane 
          tab={
            <span>
              <FileExcelOutlined /> 批量导入
            </span>
          } 
          key="bulk"
        >
          <Card className="scraper-card">
            <div className="bulk-import">
              <div className="bulk-form">
                <Form
                  form={bulkForm}
                  name="bulk_form"
                  layout="vertical"
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="name"
                        label="商品名称"
                        rules={[{ required: true, message: '请输入商品名称' }]}
                      >
                        <Input placeholder="输入商品名称" />
                      </Form.Item>
                    </Col>
                    
                    <Col span={12}>
                      <Form.Item
                        name="url"
                        label="商品URL"
                        rules={[{ required: true, message: '请输入商品URL' }]}
                      >
                        <Input placeholder="输入商品URL" />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="platform_id"
                        label="电商平台"
                        rules={[{ required: true, message: '请选择电商平台' }]}
                      >
                        <Select placeholder="选择电商平台">
                          {platforms.map(platform => (
                            <Option key={platform.id} value={platform.id}>{platform.name}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    
                    <Col span={12}>
                      <Form.Item
                        name="category_id"
                        label="商品分类"
                        rules={[{ required: true, message: '请选择商品分类' }]}
                      >
                        <Select placeholder="选择商品分类">
                          {categories.map(category => (
                            <Option key={category.id} value={category.id}>{category.name}</Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        name="price"
                        label="商品价格"
                      >
                        <InputNumber 
                          placeholder="输入商品价格" 
                          min={0} 
                          precision={2} 
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                    
                    <Col span={8}>
                      <Form.Item
                        name="sales"
                        label="销量"
                      >
                        <InputNumber 
                          placeholder="输入销量" 
                          min={0} 
                          style={{ width: '100%' }}
                        />
                      </Form.Item>
                    </Col>
                    
                    <Col span={8}>
                      <Form.Item
                        name="image_url"
                        label="商品图片URL"
                      >
                        <Input placeholder="输入商品图片URL" />
                      </Form.Item>
                    </Col>
                  </Row>
                  
                  <Form.Item>
                    <Button 
                      type="primary" 
                      onClick={addToBulkList}
                      style={{ marginRight: '8px' }}
                    >
                      {editingProduct ? '更新商品' : '添加到列表'}
                    </Button>
                    {editingProduct && (
                      <Button 
                        onClick={() => {
                          setEditingProduct(null)
                          bulkForm.resetFields()
                        }}
                      >
                        取消编辑
                      </Button>
                    )}
                  </Form.Item>
                </Form>
              </div>
              
              <Divider>商品列表</Divider>
              
              <Table 
                columns={bulkColumns} 
                dataSource={bulkProducts} 
                rowKey="tempId"
                pagination={false}
                locale={{ emptyText: '暂无商品数据，请添加' }}
              />
              
              <div style={{ marginTop: '16px', textAlign: 'right' }}>
                <Button 
                  type="primary" 
                  icon={<UploadOutlined />} 
                  onClick={handleBulkSubmit}
                  disabled={bulkProducts.length === 0}
                  loading={loading}
                >
                  批量导入
                </Button>
              </div>
            </div>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  )
}

export default ProductScraper

// 添加Row和Col组件定义
const Row = ({ children, gutter }) => {
  return (
    <div style={{ display: 'flex', marginLeft: -gutter/2, marginRight: -gutter/2 }}>
      {children}
    </div>
  )
}

const Col = ({ children, span }) => {
  const width = span * 100 / 24 + '%'
  return (
    <div style={{ padding: '0 8px', width }}>
      {children}
    </div>
  )
}