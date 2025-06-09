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
  ShopOutlined
} from '@ant-design/icons'
import { usePlatformStore } from '../stores/platformStore'
import { AnimatedCard, AnimatedList, AnimationWrapper } from '../components/Animation'
import { AnimatedButton } from '../components/Animation'

const PlatformConfig = () => {
  const [form] = Form.useForm()
  const [searchForm] = Form.useForm()
  const { 
    platforms, 
    loading, 
    fetchPlatforms, 
    createPlatform,
    updatePlatform,
    deletePlatform
  } = usePlatformStore()
  
  const [searchText, setSearchText] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingPlatform, setEditingPlatform] = useState(null)
  const [filteredPlatforms, setFilteredPlatforms] = useState([])
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  })

  useEffect(() => {
    fetchPlatforms()
  }, [])

  useEffect(() => {
    filterPlatforms()
  }, [platforms, searchText])

  const filterPlatforms = () => {
    let filtered = platforms
    if (searchText) {
      filtered = platforms.filter(platform => 
        platform.name.toLowerCase().includes(searchText.toLowerCase()) ||
        (platform.description && platform.description.toLowerCase().includes(searchText.toLowerCase())) ||
        (platform.website && platform.website.toLowerCase().includes(searchText.toLowerCase()))
      )
    }
    setFilteredPlatforms(filtered)
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
    filterPlatforms()
  }

  const handlePaginationChange = (page, pageSize) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize: pageSize
    }))
  }

  const handleAdd = () => {
    setEditingPlatform(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEdit = (platform) => {
    setEditingPlatform(platform)
    form.setFieldsValue(platform)
    setIsModalVisible(true)
  }

  const handleDelete = async (id) => {
    try {
      await deletePlatform(id)
      message.success('删除成功')
      fetchPlatforms()
    } catch (error) {
      message.error('删除失败：' + (error.response?.data?.detail || error.message))
    }
  }

  const handleSubmit = async (values) => {
    try {
      if (editingPlatform) {
        await updatePlatform(editingPlatform.id, values)
        message.success('更新成功')
      } else {
        await createPlatform(values)
        message.success('创建成功')
      }
      setIsModalVisible(false)
      form.resetFields()
      fetchPlatforms()
    } catch (error) {
      message.error('操作失败：' + (error.response?.data?.detail || error.message))
    }
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
    setEditingPlatform(null)
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '平台名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <Space>
          <ShopOutlined />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: '网站地址',
      dataIndex: 'website',
      key: 'website',
      render: (text) => text ? (
        <a href={text} target="_blank" rel="noopener noreferrer">
          {text}
        </a>
      ) : '-',
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
            title="确定要删除这个平台吗？"
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
      <div className="platform-config">
        <AnimatedCard>
          <div className="page-header">
            <div className="header-content">
              <div className="title-section">
                <h2>平台配置</h2>
                <p>管理电商平台信息</p>
              </div>
            </div>
          </div>

          <div className="search-section">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8}>
                <Input
                  placeholder="搜索平台名称、网站或描述"
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
                    新增平台
                  </AnimatedButton>
                  <AnimatedButton
                    icon={<ReloadOutlined />}
                    onClick={fetchPlatforms}
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
              dataSource={filteredPlatforms}
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
                    description="暂无平台数据"
                  />
                ),
              }}
            />
          </AnimatedList>
        </AnimatedCard>

        <Modal
          title={editingPlatform ? '编辑平台' : '新增平台'}
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
              label="平台名称"
              rules={[
                { required: true, message: '请输入平台名称' },
                { max: 50, message: '平台名称不能超过50个字符' }
              ]}
            >
              <Input placeholder="请输入平台名称" />
            </Form.Item>

            <Form.Item
              name="website"
              label="网站地址"
              rules={[
                { type: 'url', message: '请输入有效的网站地址' },
                { max: 200, message: '网站地址不能超过200个字符' }
              ]}
            >
              <Input placeholder="请输入网站地址（如：https://www.example.com）" />
            </Form.Item>

            <Form.Item
              name="logo_url"
              label="Logo地址"
              rules={[
                { type: 'url', message: '请输入有效的Logo地址' },
                { max: 200, message: 'Logo地址不能超过200个字符' }
              ]}
            >
              <Input placeholder="请输入Logo地址（可选）" />
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
                placeholder="请输入平台描述（可选）" 
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={loading}>
                  {editingPlatform ? '更新' : '创建'}
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

export default PlatformConfig