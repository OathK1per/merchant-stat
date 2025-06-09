import React, { useState, useEffect } from 'react'
import { 
  Table, 
  Card, 
  Input, 
  Button, 
  Space, 
  Popconfirm, 
  message, 
  Modal,
  Form,
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
  PlusOutlined,
  ReloadOutlined,
  TagsOutlined
} from '@ant-design/icons'
import { useCategoryStore } from '../stores/categoryStore'
import { AnimatedCard, AnimatedList, AnimationWrapper } from '../components/Animation'
import { AnimatedButton } from '../components/Animation'

const CategoryConfig = () => {
  const [form] = Form.useForm()
  const [searchForm] = Form.useForm()
  const { 
    categories, 
    loading, 
    fetchCategories, 
    createCategory,
    updateCategory,
    deleteCategory
  } = useCategoryStore()
  
  const [searchText, setSearchText] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [filteredCategories, setFilteredCategories] = useState([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    filterCategories()
  }, [categories, searchText])

  const filterCategories = () => {
    let filtered = categories
    if (searchText) {
      filtered = categories.filter(category => 
        category.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchText.toLowerCase()))
      )
    }
    setFilteredCategories(filtered)
    setPagination(prev => ({
      ...prev,
      current: 1,
      total: filtered.length
    }))
  }

  const handleSearch = (value) => {
    setSearchText(value)
  }

  const handleSearchClick = () => {
    filterCategories()
  }

  const handlePaginationChange = (page, pageSize) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: pageSize
    }))
  }

  const handleAdd = () => {
    setEditingCategory(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    form.setFieldsValue(category)
    setIsModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id)
      message.success('删除成功')
      fetchCategories()
    } catch (error) {
      message.error('删除失败：' + (error.response?.data?.detail || error.message))
    }
  }

  const handleSubmit = async (values) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, values)
        message.success('更新成功')
      } else {
        await createCategory(values)
        message.success('创建成功')
      }
      setIsModalVisible(false)
      form.resetFields()
      fetchCategories()
    } catch (error) {
      message.error('操作失败：' + (error.response?.data?.detail || error.message))
    }
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
    setEditingCategory(null)
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <TagsOutlined />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      render: (text) => text || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (text) => text ? new Date(text).toLocaleString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <AnimatedButton
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            编辑
          </AnimatedButton>
          <Popconfirm
            title="确定要删除这个分类吗？"
            description="删除后无法恢复，请谨慎操作。"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <AnimatedButton
              type="link"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              删除
            </AnimatedButton>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <AnimationWrapper>
      <div className="category-config">
        <AnimatedCard>
          <div className="page-header">
            <div className="header-content">
              <div className="title-section">
                <h2>分类配置</h2>
                <p>管理商品分类信息</p>
              </div>
            </div>
          </div>

          <div className="search-section">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Input
                  placeholder="搜索分类名称或描述"
                  allowClear
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onPressEnter={handleSearchClick}
                  prefix={<SearchOutlined />}
                />
              </Col>
              <Col xs={24} sm={12} md={16}>
                <Space className="action-buttons">
                  <AnimatedButton
                    type="default"
                    icon={<SearchOutlined />}
                    onClick={handleSearchClick}
                  >
                    搜索
                  </AnimatedButton>
                  <AnimatedButton
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleAdd}
                  >
                    新增分类
                  </AnimatedButton>
                  <AnimatedButton
                    icon={<ReloadOutlined />}
                    onClick={fetchCategories}
                    loading={loading}
                  >
                    刷新
                  </AnimatedButton>
                </Space>
              </Col>
            </Row>
          </div>

          <AnimatedList>
            <Table
              columns={columns}
              dataSource={filteredCategories}
              rowKey="id"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
                pageSizeOptions: ['10', '20', '50', '100'],
                onChange: handlePaginationChange,
                onShowSizeChange: handlePaginationChange,
              }}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="暂无分类数据"
                  />
                ),
              }}
            />
          </AnimatedList>
        </AnimatedCard>

        <Modal
          title={editingCategory ? '编辑分类' : '新增分类'}
          open={isModalVisible}
          onCancel={handleCancel}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="name"
              label="分类名称"
              rules={[
                { required: true, message: '请输入分类名称' },
                { max: 50, message: '分类名称不能超过50个字符' }
              ]}
            >
              <Input placeholder="请输入分类名称" />
            </Form.Item>

            <Form.Item
              name="description"
              label="描述"
              rules={[
                { max: 500, message: '描述不能超过500个字符' }
              ]}
            >
              <Input.TextArea 
                rows={4} 
                placeholder="请输入分类描述（可选）" 
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {editingCategory ? '更新' : '创建'}
                </Button>
                <Button onClick={handleCancel}>
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </AnimationWrapper>
  )
}

export default CategoryConfig