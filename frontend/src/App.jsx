import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Login from './login.jsx'
import Signup from './signup.jsx'
import Dashboard from './pages/Dashboard'
import Chatbot from './components/Chatbot'
import LandingPage from './components/LandingPage'
import Footer from './components/Footer'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken')
  return token ? children : <Navigate to="/login" />
}

// Wrapper components with footer
const LandingPageWithFooter = () => (
  <div className="page-wrapper">
    <LandingPage />
    <Footer />
  </div>
)

const LoginWithFooter = () => (
  <div className="page-wrapper">
    <Login />
    <Footer />
  </div>
)

const SignupWithFooter = () => (
  <div className="page-wrapper">
    <Signup />
    <Footer />
  </div>
)

const DashboardWithFooter = () => (
  <div className="page-wrapper">
    <Dashboard />
    <Footer />
  </div>
)

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'))

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('authToken')
      setIsAuthenticated(!!token)
    }

    // Check auth state when component mounts
    checkAuth()

    // Listen for storage changes (when user logs in/out in other tabs)
    window.addEventListener('storage', checkAuth)
    
    return () => {
      window.removeEventListener('storage', checkAuth)
    }
  }, [])

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPageWithFooter />} />
          <Route path="/login" element={<LoginWithFooter />} />
          <Route path="/signup" element={<SignupWithFooter />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardWithFooter />
              </ProtectedRoute>
            }
          />
        </Routes>
        
        {/* Show Chatbot only when user is authenticated */}
        {isAuthenticated && <Chatbot />}
      </div>
    </Router>
  )
}

export default App
