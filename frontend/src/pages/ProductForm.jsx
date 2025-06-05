import React, { useEffect, useState } from 'react'
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Select, 
  InputNumber, 
  message, 
  Spin, 
  Typography,
  Divider,
  Space
} from 'antd'
import { useNavigate, useParams } from 'react-router-dom'
import { useProductStore } from '../stores/productStore'
import { useCategoryStore } from '../stores/categoryStore'
import { usePlatformStore } from '../stores/platformStore'
import { AnimatedCard, AnimationWrapper } from '../components/Animation'

const { Option } = Select
const { TextArea } = Input
const { Title } = Typography

const ProductForm = () => {
  const [form] = Form.useForm()
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id
  
  const { 
    currentProduct, 
    fetchProduct, 
    createProduct, 
    updateProduct, 
    loading, 
    error, 
    clearError 
  } = useProductStore()
  
  const { categories, fetchCategories } = useCategoryStore()
  const { platforms, fetchPlatforms } = usePlatformStore()
  
  const [initialValues, setInitialValues] = useState({
    name: '',
    url: '',
    price: 0,
    currency: 'USD',
    sales_count: 0,
    image_url: '',
    description: '',
    category_id: undefined,
    platform_id: undefined,
    specifications: {}
  })
  
  // 加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        // 并行加载分类和平台数据
        await Promise.all([
          fetchCategories(),
          fetchPlatforms()
        ])
        
        // 如果是编辑模式，加载商品数据
        if (isEditing) {
          const product = await fetchProduct(id)
          if (product) {
            setInitialValues({
              name: product.name,
              url: product.url,
              price: product.price,
              currency: product.currency,
              sales_count: product.sales_count,
              image_url: product.image_url || '',
              description: product.description || '',
              category_id: product.category_id,
              platform_id: product.platform_id,
              specifications: product.specifications || {}
            })
            form.setFieldsValue({
              name: product.name,
              url: product.url,
              price: product.price,
              currency: product.currency,
              sales_count: product.sales_count,
              image_url: product.image_url || '',
              description: product.description || '',
              category_id: product.category_id,
              platform_id: product.platform_id
            })
          }
        }
      } catch (error) {
        message.error(`加载数据失败: ${error.message || '请稍后重试'}`)
      }
    }
    
    loadData()
    
    // 组件卸载时清除错误
    return () => {
      clearError()
    }
  }, [fetchCategories, fetchPlatforms, fetchProduct, id, isEditing, form, clearError])
  
  // 表单提交
  const handleSubmit = async (values) => {
    try {
      if (isEditing) {
        // 更新商品
        await updateProduct(id, values)
        message.success('商品更新成功')
      } else {
        // 创建商品
        await createProduct(values)
        message.success('商品创建成功')
      }
      
      // 返回商品列表页
      navigate('/products')
    } catch (error) {
      message.error(`保存失败: ${error.message || '请稍后重试'}`)
    }
  }
  
  // 取消
  const handleCancel = () => {
    navigate('/products')
  }
  
  return (
    <AnimationWrapper animation="fadeIn" transition={{ duration: 0.2 }}>
      <AnimatedCard animation="fadeIn">
        <Card 
          title={
            <Title level={4}>{isEditing ? '编辑商品' : '新增商品'}</Title>
          }
        >
          {loading && !isEditing ? (
            <div style={{ textAlign: 'center', padding: '50px 0' }}>
              <Spin size="large" tip="加载中..." />
            </div>
          ) : (
            <Form
              form={form}
              layout="vertical"
              initialValues={initialValues}
              onFinish={handleSubmit}
            >
              <Form.Item
                name="name"
                label="商品名称"
                rules={[{ required: true, message: '请输入商品名称' }]}
              >
                <Input placeholder="请输入商品名称" />
              </Form.Item>
              
              <Form.Item
                name="url"
                label="商品链接"
                rules={[{ required: true, message: '请输入商品链接' }]}
              >
                <Input placeholder="请输入商品链接" />
              </Form.Item>
              
              <Form.Item
                name="price"
                label="价格"
                rules={[{ required: true, message: '请输入价格' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                  placeholder="请输入价格"
                />
              </Form.Item>
              
              <Form.Item
                name="currency"
                label="货币"
                rules={[{ required: true, message: '请选择货币' }]}
              >
                <Select placeholder="请选择货币">
                  <Option value="USD">美元 (USD)</Option>
                  <Option value="CNY">人民币 (CNY)</Option>
                  <Option value="EUR">欧元 (EUR)</Option>
                  <Option value="GBP">英镑 (GBP)</Option>
                  <Option value="JPY">日元 (JPY)</Option>
                </Select>
              </Form.Item>
              
              <Form.Item
                name="sales_count"
                label="销量"
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="请输入销量"
                />
              </Form.Item>
              
              <Form.Item
                name="image_url"
                label="商品图片URL"
              >
                <Input placeholder="请输入商品图片URL" />
              </Form.Item>
              
              <Form.Item
                name="category_id"
                label="分类"
                rules={[{ required: true, message: '请选择分类' }]}
              >
                <Select placeholder="请选择分类">
                  {categories.map(category => (
                    <Option key={category.id} value={category.id}>{category.name}</Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item
                name="platform_id"
                label="平台"
                rules={[{ required: true, message: '请选择平台' }]}
              >
                <Select placeholder="请选择平台">
                  {platforms.map(platform => (
                    <Option key={platform.id} value={platform.id}>{platform.name}</Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item
                name="description"
                label="商品描述"
              >
                <TextArea rows={4} placeholder="请输入商品描述" />
              </Form.Item>
              
              <Divider />
              
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    {isEditing ? '更新' : '创建'}
                  </Button>
                  <Button onClick={handleCancel}>取消</Button>
                </Space>
              </Form.Item>
            </Form>
          )}
        </Card>
      </AnimatedCard>
    </AnimationWrapper>
  )
}

export default ProductForm