import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, message, Row, Col, Typography, Spin } from 'antd';
import { UserOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import './Login.css'; // 导入 CSS 文件

const { Title } = Typography

const Login = () => {
  const navigate = useNavigate()
  const { login, getCaptcha, isAuthenticated, error, clearError } = useAuthStore()
  
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [captchaId, setCaptchaId] = useState('')
  const [captchaImage, setCaptchaImage] = useState('')
  
  // 如果已经登录，重定向到首页
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])
  
  // 显示错误信息
  useEffect(() => {
    if (error) {
      message.error(error)
      clearError()
    }
  }, [error, clearError])
  
  // 获取验证码
  const fetchCaptcha = async () => {
    try {
      const data = await getCaptcha()
      if (data) {
        setCaptchaId(data.captcha_id)
        setCaptchaImage(data.image)
      }
    } catch (err) {
      message.error('获取验证码失败，请刷新重试')
    }
  }
  
  // 组件加载时获取验证码
  useEffect(() => {
    fetchCaptcha()
  }, [])
  
  // 提交登录表单
  const handleSubmit = async (values) => {
    setLoading(true)
    
    try {
      const success = await login({
        username: values.username,
        password: values.password,
        captcha_id: captchaId,
        captcha_value: values.captcha,
      })
      
      if (success) {
        message.success('登录成功')
        navigate('/')
      } else {
        // 登录失败，刷新验证码
        fetchCaptcha()
        form.setFieldsValue({ captcha: '' })
      }
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="login-container">
      <Row justify="center" align="middle" className="login-row">
        <Col xs={22} sm={16} md={12} lg={8} xl={6}>
          <Card className="login-card">
            <div className="login-header">
              <Title level={2} className="login-title">跨境电商商品统计系统</Title>
            </div>
            
            <Form
              form={form}
              name="login"
              onFinish={handleSubmit}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="用户名" 
                  autoComplete="username"
                />
              </Form.Item>
              
              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password 
                  prefix={<LockOutlined />} 
                  placeholder="密码" 
                  autoComplete="current-password"
                />
              </Form.Item>
              
              <Form.Item>
                <Row gutter={8}>
                  <Col span={16}>
                    <Form.Item
                      name="captcha"
                      noStyle
                      rules={[{ required: true, message: '请输入验证码' }]}
                    >
                      <Input 
                        prefix={<SafetyOutlined />} 
                        placeholder="验证码" 
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <div 
                      className="captcha-container" 
                      onClick={fetchCaptcha}
                      title="点击刷新验证码"
                    >
                      {captchaImage ? (
                        <img 
                          src={`data:image/png;base64,${captchaImage}`} 
                          alt="验证码" 
                          className="captcha-image"
                        />
                      ) : (
                        <Spin size="small" />
                      )}
                    </div>
                  </Col>
                </Row>
              </Form.Item>
              
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  className="login-button" 
                  loading={loading}
                  block
                >
                  登录
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Login