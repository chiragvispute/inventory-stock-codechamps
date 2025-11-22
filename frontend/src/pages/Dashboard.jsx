import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/Dashboard.css'
import ReceiptList from './ReceiptList'
import DeliveryList from './DeliveryList'
import Stock from './Stock'
import MovesHistory from '../components/MovesHistory'
import Warehouse from '../components/Warehouse'
import Location from '../components/Location'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [searchTerm, setSearchTerm] = useState('')
  const [showSearchSettings, setShowSearchSettings] = useState(false)
  const [viewMode, setViewMode] = useState('list') // list, kanban
  const [searchSettings, setSearchSettings] = useState({
    caseSensitive: false,
    exactMatch: false,
    searchFields: ['all'] // all, name, code, location, reference, contacts
  })
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false)
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

  const handleSearchSettingsChange = (setting, value) => {
    setSearchSettings(prev => ({
      ...prev,
      [setting]: value
    }))
  }

  const clearSearch = () => {
    setSearchTerm('')
    setShowSearchSettings(false)
  }

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

          {/* Search Section - Show for all tabs except dashboard */}
          {activeTab !== 'dashboard' && (
            <div className="search-section">
              <div className="search-container">
                <div className="search-controls">
                  <div className="search-input-group">
                    <input
                      type="text"
                      placeholder={`Search ${activeTab}...`}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="search-input"
                    />
                    <button 
                      className="search-settings-btn"
                      onClick={() => setShowSearchSettings(!showSearchSettings)}
                      title="Search Settings"
                    >
                      ⚙️
                    </button>
                    {searchTerm && (
                      <button 
                        className="clear-search-btn"
                        onClick={clearSearch}
                        title="Clear Search"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  
                  {/* View Mode Switch - Show only for operations tab */}
                  {activeTab === 'operations' && (
                    <div className="view-mode-switch">
                      <div className="view-toggle">
                        <button
                          className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                          onClick={() => setViewMode('list')}
                          title="List View"
                        >
                          📋
                        </button>
                        <button
                          className={`view-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                          onClick={() => setViewMode('kanban')}
                          title="Kanban View"
                        >
                          📊
                        </button>
                      </div>
                      <span className="view-label">Status</span>
                    </div>
                  )}
                </div>
                
                {showSearchSettings && (
                  <div className="search-settings-dropdown">
                    <div className="search-settings-content">
                      <h4>Search Settings</h4>
                      
                      <div className="setting-group">
                        <label className="setting-item">
                          <input
                            type="checkbox"
                            checked={searchSettings.caseSensitive}
                            onChange={(e) => handleSearchSettingsChange('caseSensitive', e.target.checked)}
                          />
                          Case Sensitive
                        </label>
                        
                        <label className="setting-item">
                          <input
                            type="checkbox"
                            checked={searchSettings.exactMatch}
                            onChange={(e) => handleSearchSettingsChange('exactMatch', e.target.checked)}
                          />
                          Exact Match
                        </label>
                      </div>

                      <div className="setting-group">
                        <label className="setting-label">Search In:</label>
                        <div className="search-fields">
                          {['all', 'name', 'code', 'location', 'reference', 'contacts'].map(field => (
                            <label key={field} className="setting-item">
                              <input
                                type="checkbox"
                                checked={searchSettings.searchFields.includes(field)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    handleSearchSettingsChange('searchFields', [...searchSettings.searchFields, field])
                                  } else {
                                    handleSearchSettingsChange('searchFields', searchSettings.searchFields.filter(f => f !== field))
                                  }
                                }}
                              />
                              {field.charAt(0).toUpperCase() + field.slice(1)}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
                {searchTerm && (
                  <div className="search-results-info">
                    <p>Searching for: "<strong>{searchTerm}</strong>"</p>
                  </div>
                )}
                
                {viewMode === 'list' ? (
                  <div className="operations-list-view">
                    <p>Operations list view content goes here</p>
                    {/* This will show delivery operations in a traditional list/table format */}
                  </div>
                ) : (
                  <div className="operations-kanban-view">
                    <div className="kanban-board">
                      <div className="kanban-column">
                        <h3 className="column-header waiting">Waiting</h3>
                        <div className="kanban-cards">
                          <div className="delivery-card">
                            <h4>DEL-001</h4>
                            <p>Customer: John Doe</p>
                            <p>Items: 3</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="kanban-column">
                        <h3 className="column-header preparing">Preparing</h3>
                        <div className="kanban-cards">
                          <div className="delivery-card">
                            <h4>DEL-002</h4>
                            <p>Customer: Jane Smith</p>
                            <p>Items: 5</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="kanban-column">
                        <h3 className="column-header ready">Ready</h3>
                        <div className="kanban-cards">
                          <div className="delivery-card">
                            <h4>DEL-003</h4>
                            <p>Customer: Bob Wilson</p>
                            <p>Items: 2</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="kanban-column">
                        <h3 className="column-header delivered">Delivered</h3>
                        <div className="kanban-cards">
                          <div className="delivery-card">
                            <h4>DEL-004</h4>
                            <p>Customer: Alice Brown</p>
                            <p>Items: 4</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'stock' && (
              <div className="stock-wrapper">
                {searchTerm && (
                  <div className="search-results-info">
                    <p>Searching for: "<strong>{searchTerm}</strong>"</p>
                  </div>
                )}
                <Stock searchTerm={searchTerm} searchSettings={searchSettings} />
              </div>
            )}

            {activeTab === 'history' && (
              <div className="history-wrapper">
                {searchTerm && (
                  <div className="search-results-info">
                    <p>Searching for: "<strong>{searchTerm}</strong>"</p>
                  </div>
                )}
                <MovesHistory searchTerm={searchTerm} searchSettings={searchSettings} />
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="tab-content">
                <h2>Settings</h2>
                {searchTerm && (
                  <div className="search-results-info">
                    <p>Searching for: "<strong>{searchTerm}</strong>"</p>
                  </div>
                )}
                
                <div className="settings-content">
                  <div className="settings-dropdown-container">
                    <button 
                      className="settings-dropdown-btn"
                      onClick={() => setShowSettingsDropdown(!showSettingsDropdown)}
                    >
                      Select Configuration
                      <span className={`dropdown-arrow ${showSettingsDropdown ? 'open' : ''}`}>▼</span>
                    </button>
                    
                    {showSettingsDropdown && (
                      <div className="settings-dropdown-menu">
                        <button 
                          className="dropdown-item"
                          onClick={() => {
                            setCurrentPage('warehouse')
                            setShowSettingsDropdown(false)
                          }}
                        >
                          <span className="dropdown-icon">🏢</span>
                          Warehouse
                        </button>
                        <button 
                          className="dropdown-item"
                          onClick={() => {
                            setCurrentPage('location')
                            setShowSettingsDropdown(false)
                          }}
                        >
                          <span className="dropdown-icon">📍</span>
                          Location
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="settings-description">
                    <p>Select a configuration type from the dropdown above to manage warehouse or location settings.</p>
                  </div>
                </div>
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

      {currentPage === 'warehouse' && (
        <Warehouse onBack={() => setCurrentPage('dashboard')} />
      )}

      {currentPage === 'location' && (
        <Location onBack={() => setCurrentPage('dashboard')} />
      )}
    </div>
  )
}
