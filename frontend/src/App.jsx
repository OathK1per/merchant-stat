import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Spin } from 'antd'
import { useAuthStore } from './stores/authStore'
import LoginPage from './pages/Login'
import Layout from "./components/Layout/AppLayout";
import Dashboard from './pages/Dashboard'
import ProductList from './pages/ProductList'
import ProductForm from './pages/ProductForm'
import ProductScraper from './pages/ProductScraper'
import NotFound from './pages/NotFound'

const App = () => {
  const { isAuthenticated, loading, checkAuth } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [])

  if (loading) {
    return (
      <div className="app-loading">
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
        
        <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/create" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
          <Route path="scraper" element={<ProductScraper />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App