import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Dashboard.css'
import ReceiptList from './ReceiptList'
import DeliveryList from './DeliveryList'
import Stock from './Stock'
import MoveHistory from './MoveHistory'
import Footer from '../components/Footer'
import Chatbot from '../components/Chatbot'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [dashboardData, setDashboardData] = useState({
    receipts: { toReceive: 0, late: 0, operations: 0 },
    deliveries: { toDeliver: 0, waiting: 0, operations: 0 }
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [chatbotOpen, setChatbotOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Auto-refresh data every 30 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return
    const interval = setInterval(() => {
      if (!loading) {
        fetchDashboardData()
      }
    }, 30000) // Refresh every 30 seconds for dashboard
    return () => clearInterval(interval)
  }, [autoRefresh, loading])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5001/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setDashboardData({
          receipts: {
            toReceive: data.pendingReceipts || 0,
            late: data.lateReceipts || 0,
            operations: data.totalReceipts || 0
          },
          deliveries: {
            toDeliver: data.pendingDeliveries || 0,
            waiting: data.waitingDeliveries || 0,
            operations: data.totalDeliveries || 0
          }
        })
        setError('')
        setLastUpdate(Date.now())
      } else {
        throw new Error(`Failed to fetch dashboard data: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'operations', label: 'Operations' },
    { id: 'stock', label: 'Stock' },
    { id: 'history', label: 'Move History' },
    { id: 'settings', label: 'Settings' },
  ]

  // Helper function to calculate bar width percentage
  const getBarWidth = (value, maxValue) => {
    if (maxValue === 0) return 0;
    return Math.min((value / maxValue) * 100, 100);
  };

  // Calculate max values for bar scaling
  const maxReceiptValue = Math.max(dashboardData.receipts.late, dashboardData.receipts.operations, 1);
  const maxDeliveryValue = Math.max(dashboardData.deliveries.waiting, dashboardData.deliveries.operations, 1);

  return (
    <div className="dashboard">
      {/* New Main Navbar */}
      <nav className="main-navbar">
        <div className="navbar-content">
          {/* Logo Section */}
          <div className="navbar-brand">
            <div className="logo-placeholder">
              <img 
                src="/logo.jpg" 
                alt="StockShelf Logo" 
                style={{width: '32px', height: '32px', borderRadius: '4px'}}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <span 
                className="logo-text"
                style={{display: 'none'}}
              >
                SS
              </span>
            </div>
            <h1 className="brand-title">
              <span className="brand-stock">Stock</span>Shelf
            </h1>
          </div>

          {/* Navigation Tabs */}
          <div className="navbar-tabs">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`navbar-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="tab-label">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Controls Section */}
          <div className="navbar-controls">
            <label className="auto-refresh-control">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
              />
              Auto-refresh
            </label>
            <button
              className="btn-refresh"
              onClick={fetchDashboardData}
              disabled={loading}
              title="Refresh data manually"
            >
              ↻
            </button>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {currentPage === 'dashboard' && (
        <>
          {/* Status info */}
          <div className="status-info">
            <span>
              Last updated: {new Date(lastUpdate).toLocaleTimeString()}
              {autoRefresh && ' • Auto-refresh every 30s'}
            </span>
            <span>
              Real-time inventory tracking
            </span>
          </div>

          {/* Error display */}
          {error && (
            <div className="error-message" style={{
              backgroundColor: '#fee', 
              color: '#c33', 
              padding: '1rem', 
              margin: '1rem', 
              borderRadius: '4px',
              border: '1px solid #fcc',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>{error}</span>
              <button 
                onClick={fetchDashboardData} 
                style={{
                  padding: '0.5rem 1rem', 
                  backgroundColor: '#007bff', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Retry
              </button>
            </div>
          )}

          <main className="dashboard-content">
            {activeTab === 'dashboard' && (
              <div className="dashboard-grid">
                {/* Receipt Card */}
                <button 
                  className="card receipt-card"
                  onClick={() => setCurrentPage('receipt')}
                  style={{position: 'relative'}}
                >
                  <div className="card-header">
                    <h2>Receipt</h2>
                    <button 
                      className="btn-icon" 
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate('/create-receipt')
                      }}
                    >
                      +
                    </button>
                    {autoRefresh && (
                      <div style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#28a745',
                        borderRadius: '50%',
                        animation: 'pulse 2s infinite'
                      }}></div>
                    )}
                  </div>
                  <div className="card-body">
                    <div className="status-box">
                      <span className="status-label">
                        {loading ? 'Loading...' : `${dashboardData.receipts.toReceive} to receive`}
                        {!loading && (
                          <small style={{display: 'block', fontSize: '0.7rem', color: '#666'}}>
                            Live updates enabled
                          </small>
                        )}
                      </span>
                    </div>
                    <div className="stats">
                      <div className="stat stat-with-bar">
                        <span className="stat-number">{dashboardData.receipts.late}</span>
                        <span className="stat-label">Late</span>
                        <div className="stat-bar">
                          <div 
                            className="stat-bar-fill late-bar" 
                            style={{ 
                              width: `${getBarWidth(dashboardData.receipts.late, maxReceiptValue)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="stat stat-with-bar">
                        <span className="stat-number">{dashboardData.receipts.operations}</span>
                        <span className="stat-label">operations</span>
                        <div className="stat-bar">
                          <div 
                            className="stat-bar-fill operations-bar" 
                            style={{ 
                              width: `${getBarWidth(dashboardData.receipts.operations, maxReceiptValue)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Delivery Card */}
                <button 
                  className="card delivery-card"
                  onClick={() => setCurrentPage('delivery')}
                  style={{position: 'relative'}}
                >
                  <div className="card-header">
                    <h2>Delivery</h2>
                    <button 
                      className="btn-icon" 
                      onClick={(e) => {
                        e.stopPropagation()
                        alert('Create Delivery form coming soon!')
                      }}
                    >
                      +
                    </button>
                    {autoRefresh && (
                      <div style={{
                        position: 'absolute',
                        top: '0.5rem',
                        right: '0.5rem',
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#28a745',
                        borderRadius: '50%',
                        animation: 'pulse 2s infinite'
                      }}></div>
                    )}
                  </div>
                  <div className="card-body">
                    <div className="status-box">
                      <span className="status-label">
                        {loading ? 'Loading...' : `${dashboardData.deliveries.toDeliver} to Deliver`}
                        {!loading && (
                          <small style={{display: 'block', fontSize: '0.7rem', color: '#666'}}>
                            Live updates enabled
                          </small>
                        )}
                      </span>
                    </div>
                    <div className="stats">
                      <div className="stat stat-with-bar">
                        <span className="stat-number">{dashboardData.deliveries.waiting}</span>
                        <span className="stat-label">waiting</span>
                        <div className="stat-bar">
                          <div 
                            className="stat-bar-fill waiting-bar" 
                            style={{ 
                              width: `${getBarWidth(dashboardData.deliveries.waiting, maxDeliveryValue)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="stat stat-with-bar">
                        <span className="stat-number">{dashboardData.deliveries.operations}</span>
                        <span className="stat-label">operations</span>
                        <div className="stat-bar">
                          <div 
                            className="stat-bar-fill operations-bar" 
                            style={{ 
                              width: `${getBarWidth(dashboardData.deliveries.operations, maxDeliveryValue)}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            )}

            {activeTab === 'operations' && (
              <div className="tab-content">
                <h2>Operations</h2>
                <p>Operations content goes here</p>
              </div>
            )}

            {activeTab === 'stock' && (
              <Stock />
            )}

            {activeTab === 'history' && (
              <MoveHistory />
            )}

            {activeTab === 'settings' && (
              <div className="tab-content">
                <h2>Settings</h2>
                <p>Settings content goes here</p>
              </div>
            )}
          </main>
        </>
      )}

      {currentPage === 'receipt' && (
        <>
          {/* Status info for receipt page */}
          <div className="status-info">
            <span>Receipt Management</span>
            <span>
              <button onClick={() => setCurrentPage('dashboard')} style={{background: 'none', border: 'none', color: '#007bff', cursor: 'pointer'}}>
                ← Back to Dashboard
              </button>
            </span>
          </div>
          <ReceiptList onBack={() => setCurrentPage('dashboard')} />
        </>
      )}

      {currentPage === 'delivery' && (
        <>
          {/* Status info for delivery page */}
          <div className="status-info">
            <span>Delivery Management</span>
            <span>
              <button onClick={() => setCurrentPage('dashboard')} style={{background: 'none', border: 'none', color: '#007bff', cursor: 'pointer'}}>
                ← Back to Dashboard
              </button>
            </span>
          </div>
          <DeliveryList onBack={() => setCurrentPage('dashboard')} />
        </>
      )}

      <Footer />

      {/* Floating Chatbot Widget */}
      {chatbotOpen && (
        <div className="chatbot-widget">
          <Chatbot />
          <button 
            className="chatbot-close"
            onClick={() => setChatbotOpen(false)}
          >
            ✕
          </button>
        </div>
      )}
      {!chatbotOpen && (
        <button
          className="chatbot-toggle"
          onClick={() => setChatbotOpen(true)}
          title="Open AI Assistant"
        >
          💬
        </button>
      )}
    </div>
  )
}