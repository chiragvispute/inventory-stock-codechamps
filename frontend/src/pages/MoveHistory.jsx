import { useState, useEffect } from 'react'
import '../styles/MoveHistory.css'

export default function MoveHistory() {
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('LIST') // LIST or KANBAN
  const [filteredMoves, setFilteredMoves] = useState([])
  const [moves, setMoves] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdate, setLastUpdate] = useState(Date.now())

  // Fetch move history from backend
  useEffect(() => {
    fetchMoveHistory()
  }, [])

  useEffect(() => {
    setFilteredMoves(moves)
  }, [moves])

  const fetchMoveHistory = async () => {
    try {
      setLoading(true)
      setError('')
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5001/api/moveHistory', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch move history')
      }

      const data = await response.json()
      // Map backend data to frontend format
      const formattedMoves = data.moves?.map(move => ({
        id: move.move_id,
        reference: move.transaction_ref,
        date: new Date(move.move_timestamp).toLocaleDateString(),
        contact: move.responsible_user,
        from: move.from_location_name ? `${move.from_warehouse_name}/${move.from_location_name}` : 'External',
        to: move.to_location_name ? `${move.to_warehouse_name}/${move.to_location_name}` : 'External',
        quantity: Math.abs(move.quantity_change),
        status: 'Completed',
        move_type: move.transaction_type,
        product_name: move.product_name,
        description: move.description
      })) || []
      
      setMoves(formattedMoves)
      setLastUpdate(Date.now())
    } catch (err) {
      console.error('Error fetching move history:', err)
      setError('Failed to load move history. Please try again.')
      // Set fallback data for development
      setMoves([
        {
          id: 1,
          reference: 'WH/IN/0001',
          date: '12/1/2001',
          contact: 'Azure Interior',
          from: 'Vendor',
          to: 'WH/Stock1',
          quantity: 50,
          status: 'Ready',
          move_type: 'IN'
        },
        {
          id: 2,
          reference: 'WH/OUT/0002',
          date: '12/1/2001',
          contact: 'Azure Interior',
          from: 'WH/Stock1',
          to: 'Vendor',
          quantity: 25,
          status: 'Ready',
          move_type: 'OUT'
        },
        {
          id: 3,
          reference: 'WH/OUT/0003',
          date: '12/1/2001',
          contact: 'Azure Interior',
          from: 'WH/Stock2',
          to: 'Vendor',
          quantity: 15,
          status: 'Ready',
          move_type: 'OUT'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setFilteredMoves(moves)
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5001/api/moveHistory?search=${encodeURIComponent(searchTerm)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      // Map backend data to frontend format
      const formattedMoves = data.moves?.map(move => ({
        id: move.move_id,
        reference: move.transaction_ref,
        date: new Date(move.move_timestamp).toLocaleDateString(),
        contact: move.responsible_user,
        from: move.from_location_name ? `${move.from_warehouse_name}/${move.from_location_name}` : 'External',
        to: move.to_location_name ? `${move.to_warehouse_name}/${move.to_location_name}` : 'External',
        quantity: Math.abs(move.quantity_change),
        status: 'Completed',
        move_type: move.transaction_type,
        product_name: move.product_name,
        description: move.description
      })) || []
      
      setFilteredMoves(formattedMoves)
    } catch (err) {
      console.error('Error searching move history:', err)
      // Fallback to client-side filtering
      const filtered = moves.filter(move => 
        move.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        move.contact?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        move.from?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        move.to?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        move.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        move.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredMoves(filtered)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchInputChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    
    // Auto-search as user types
    if (!value.trim()) {
      setFilteredMoves(moves)
    } else {
      handleSearch()
    }
  }

  const handleResetFilters = () => {
    setSearchTerm('')
    setFilteredMoves(moves)
  }

  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'ready':
        return 'status-badge status-ready'
      case 'pending':
        return 'status-badge status-pending'
      case 'completed':
        return 'status-badge status-completed'
      case 'cancelled':
        return 'status-badge status-cancelled'
      default:
        return 'status-badge'
    }
  }

  const getMoveTypeClass = (moveType) => {
    switch(moveType?.toUpperCase()) {
      case 'IN':
        return 'move-type-in'
      case 'OUT':
        return 'move-type-out'
      default:
        return ''
    }
  }

  return (
    <div className="move-history-page">
      <header className="move-history-header">
        <div className="breadcrumb">
          <span className="breadcrumb-item">Dashboard</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-item">Operations</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-item">Products</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-item active">Move History</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-item">Settings</span>
        </div>
        
        <div className="view-selector">
          <button 
            className={`view-btn ${viewMode === 'LIST' ? 'active' : ''}`}
            onClick={() => setViewMode('LIST')}
          >
            VIEW
          </button>
        </div>
      </header>

      <div className="move-history-content">
        <h1>Move History</h1>
        
        <div className="move-history-toolbar">
          <div className="search-section">
            <input
              type="text"
              placeholder="Search by reference, contact, or location..."
              value={searchTerm}
              onChange={handleSearchInputChange}
              className="search-input"
            />
            <div className="toolbar-actions">
              <button className="btn-search" onClick={handleSearch}>🔍</button>
              <button className="btn-list-view" onClick={() => setViewMode('LIST')}>📋</button>
              <button className="btn-print">🖨️</button>
            </div>
          </div>
          
          <div className="status-info">
            <span>Search across all inventory moves • Last updated: {new Date(lastUpdate).toLocaleTimeString()}</span>
          </div>
          
          {error && (
            <div className="error-message">
              <span>{error}</span>
              <button onClick={fetchMoveHistory} className="retry-btn">Retry</button>
            </div>
          )}
          
          <div className="view-status">
            <span>Allow user to switch to the kanban view based on status</span>
          </div>
        </div>

        <div className="move-history-table-wrapper">
          {loading ? (
            <div className="loading-state">
              <p>Loading move history...</p>
            </div>
          ) : (
            <table className="move-history-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Date</th>
                  <th>Product</th>
                  <th>Contact</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Quantity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredMoves.map((move, index) => (
                  <tr key={move.id || index} className={`move-row ${getMoveTypeClass(move.move_type)}`}>
                    <td className="reference-cell">{move.reference}</td>
                    <td>{move.date}</td>
                    <td className="product-cell">{move.product_name || 'N/A'}</td>
                    <td>{move.contact}</td>
                    <td>{move.from}</td>
                    <td>{move.to}</td>
                    <td>{move.quantity}</td>
                    <td>
                      <span className={getStatusBadge(move.status)}>
                        {move.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {!loading && filteredMoves.length === 0 && (
            <div className="empty-state">
              <p>No move history found matching your search criteria.</p>
              <button className="btn-reset-empty" onClick={handleResetFilters}>
                Clear Search
              </button>
            </div>
          )}
        </div>

        <div className="move-history-notes">
          <div className="note-section">
            <p><em>Move history data loaded from database • Showing {filteredMoves.length} of {moves.length} records</em></p>
          </div>
        </div>
      </div>
    </div>
  )
}