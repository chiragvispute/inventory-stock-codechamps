import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Dashboard.css'
import ReceiptList from './ReceiptList'
import DeliveryList from './DeliveryList'
import Stock from './Stock'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [currentPage, setCurrentPage] = useState('dashboard')
  const navigate = useNavigate()

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
              <button className="btn-logout" onClick={handleLogout}>Logout</button>
            </div>
          </header>

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
                      <span className="status-label">5 to receive</span>
                    </div>
                    <div className="stats">
                      <div className="stat">
                        <span className="stat-number">1</span>
                        <span className="stat-label">Late</span>
                      </div>
                      <div className="stat">
                        <span className="stat-number">6</span>
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
                      <span className="status-label">5 to Deliver</span>
                    </div>
                    <div className="stats">
                      <div className="stat">
                        <span className="stat-number">2</span>
                        <span className="stat-label">waiting</span>
                      </div>
                      <div className="stat">
                        <span className="stat-number">6</span>
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
