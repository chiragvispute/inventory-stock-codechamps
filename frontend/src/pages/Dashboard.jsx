import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Dashboard.css'
import ReceiptList from './ReceiptList'
import DeliveryList from './DeliveryList'
import Stock from './Stock'

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
    navigate('/login')
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'operations', label: 'Operations' },
    { id: 'stock', label: 'Stock' },
    { id: 'history', label: 'Move History' },
    { id: 'settings', label: 'Settings' },
  ]

  return (
    <div className="dashboard">
      {currentPage === 'dashboard' && (
        <>
          <header className="dashboard-header">
            <div className="header-content">
              <h1>Dashboard</h1>
              <nav className="tabs">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span className="tab-label">{tab.label}</span>
                  </button>
                ))}
              </nav>
              <div className="dashboard-controls">
                <label style={{display: 'flex', alignItems: 'center', marginRight: '1rem', fontSize: '0.875rem'}}>
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    style={{marginRight: '0.5rem'}}
                  />
                  Auto-refresh
                </label>
                <button 
                  className="btn-refresh" 
                  onClick={fetchDashboardData} 
                  disabled={loading}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.6 : 1,
                    marginRight: '1rem'
                  }}
                >
                  {loading ? '...' : '↻'}
                </button>
                <button className="btn-logout" onClick={handleLogout}>Logout</button>
              </div>
            </div>
          </header>

          {/* Status bar */}
          <div className="status-bar" style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#f8f9fa',
            borderBottom: '1px solid #dee2e6',
            fontSize: '0.875rem',
            color: '#6c757d',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
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
                >
                  <div className="card-header">
                    <h2>Receipt</h2>
                    <button className="btn-icon" onClick={(e) => e.stopPropagation()}>+</button>
                  </div>
                  <div className="card-body">
                    <div className="status-box">
                      <span className="status-label">{loading ? 'Loading...' : `${dashboardData.receipts.toReceive} to receive`}</span>
                    </div>
                    <div className="stats">
                      <div className="stat">
                        <span className="stat-number">{dashboardData.receipts.late}</span>
                        <span className="stat-label">Late</span>
                      </div>
                      <div className="stat">
                        <span className="stat-number">{dashboardData.receipts.operations}</span>
                        <span className="stat-label">operations</span>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Delivery Card */}
                <button 
                  className="card delivery-card"
                  onClick={() => setCurrentPage('delivery')}
                >
                  <div className="card-header">
                    <h2>Delivery</h2>
                    <button className="btn-icon" onClick={(e) => e.stopPropagation()}>+</button>
                  </div>
                  <div className="card-body">
                    <div className="status-box">
                      <span className="status-label">{loading ? 'Loading...' : `${dashboardData.deliveries.toDeliver} to Deliver`}</span>
                    </div>
                    <div className="stats">
                      <div className="stat">
                        <span className="stat-number">{dashboardData.deliveries.waiting}</span>
                        <span className="stat-label">waiting</span>
                      </div>
                      <div className="stat">
                        <span className="stat-number">{dashboardData.deliveries.operations}</span>
                        <span className="stat-label">operations</span>
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
              <div className="tab-content">
                <h2>Move History</h2>
                <p>Move history content goes here</p>
              </div>
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
        <ReceiptList onBack={() => setCurrentPage('dashboard')} />
      )}

      {currentPage === 'delivery' && (
        <DeliveryList onBack={() => setCurrentPage('dashboard')} />
      )}
    </div>
  )
}
