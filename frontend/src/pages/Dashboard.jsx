import { useState } from 'react'
import '../styles/Dashboard.css'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')

  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'operations', label: 'Operations' },
    { id: 'stock', label: 'Stock' },
    { id: 'history', label: 'Move History' },
    { id: 'settings', label: 'Settings' },
  ]

  return (
    <div className="dashboard">
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
        </div>
      </header>

      <main className="dashboard-content">
        {activeTab === 'dashboard' && (
          <div className="dashboard-grid">
            {/* Receipt Card */}
            <div className="card receipt-card">
              <div className="card-header">
                <h2>Receipt</h2>
                <button className="btn-icon">⊕</button>
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
            </div>

            {/* Delivery Card */}
            <div className="card delivery-card">
              <div className="card-header">
                <h2>Delivery</h2>
                <button className="btn-icon">⊕</button>
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
            </div>
          </div>
        )}

        {activeTab === 'operations' && (
          <div className="tab-content">
            <h2>Operations</h2>
            <p>Operations content goes here</p>
          </div>
        )}

        {activeTab === 'stock' && (
          <div className="tab-content">
            <h2>Stock</h2>
            <p>Stock content goes here</p>
          </div>
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
    </div>
  )
}
