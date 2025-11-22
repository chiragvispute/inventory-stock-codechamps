import { useState, useEffect } from 'react'
import '../styles/DeliveryList.css'
import DeliveryDetail from './DeliveryDetail'

export default function DeliveryList({ onBack }) {
  const [currentPage, setCurrentPage] = useState('list')
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(null)
  const [deliveries, setDeliveries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  const [autoRefresh, setAutoRefresh] = useState(true)

  useEffect(() => {
    fetchDeliveries()
  }, [])

  // Auto-refresh data every 60 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return
    
    const interval = setInterval(() => {
      if (!loading) {
        fetchDeliveries()
      }
    }, 60000) // Refresh every 60 seconds
    
    return () => clearInterval(interval)
  }, [autoRefresh, loading])

  const fetchDeliveries = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5001/api/deliveries', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch deliveries')
      }

      const data = await response.json()
      const formattedDeliveries = data.map(delivery => ({
        // Database field names
        delivery_order_id: delivery.delivery_order_id,
        reference: delivery.reference,
        schedule_date: delivery.schedule_date,
        operation_type: delivery.operation_type,
        status: delivery.status,
        customer_id: delivery.customer_id,
        customer_name: delivery.customer_name,
        responsible_user_id: delivery.responsible_user_id,
        responsible_user: delivery.responsible_user,
        from_location_id: delivery.from_location_id,
        from_location_name: delivery.from_location_name,
        to_location: delivery.to_location,
        warehouse_name: delivery.warehouse_name,
        created_at: delivery.created_at,
        validated_at: delivery.validated_at,
        printed_at: delivery.printed_at,
        // Legacy field names for backward compatibility
        id: delivery.reference,
        deliveryId: delivery.delivery_order_id,
        deliverTo: delivery.customer_name || delivery.to_location || 'Unknown Customer',
        date: new Date(delivery.schedule_date).toLocaleDateString(),
        responsible: delivery.responsible_user,
        fromLocation: delivery.from_location_name,
        warehouse: delivery.warehouse_name
      }))
      setDeliveries(formattedDeliveries)
      setError('')
      setLastUpdate(Date.now())
    } catch (err) {
      console.error('Error fetching deliveries:', err)
      setError('Failed to load deliveries. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleNewDelivery = () => {
    setSelectedDeliveryId(null)
    setCurrentPage('detail')
  }

  const handleSelectDelivery = (deliveryId) => {
    setSelectedDeliveryId(deliveryId)
    setCurrentPage('detail')
  }

  const handleBackToList = () => {
    setCurrentPage('list')
    // Refresh data when returning to list
    fetchDeliveries()
  }

  // Update delivery status
  const handleStatusUpdate = async (deliveryId, newStatus) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5001/api/deliveries/${deliveryId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update delivery status')
      }

      // Optimistically update the local state
      setDeliveries(deliveries.map(delivery => 
        delivery.delivery_order_id === deliveryId 
          ? { ...delivery, status: newStatus }
          : delivery
      ))
      
      // Refresh data to ensure consistency
      await fetchDeliveries()
      setLastUpdate(Date.now())
    } catch (error) {
      console.error('Error updating delivery status:', error)
      // Revert optimistic update by refreshing
      fetchDeliveries()
    }
  }

  // Delete delivery
  const handleDeleteDelivery = async (deliveryId) => {
    if (!confirm('Are you sure you want to delete this delivery?')) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5001/api/deliveries/${deliveryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete delivery')
      }

      // Remove from local state
      setDeliveries(deliveries.filter(delivery => delivery.delivery_order_id !== deliveryId))
      setLastUpdate(Date.now())
    } catch (error) {
      console.error('Error deleting delivery:', error)
      // Refresh data on error
      fetchDeliveries()
    }
  }

  const getStatusBadge = (status) => {
    switch(status) {
      case 'draft':
        return 'status-badge status-draft'
      case 'ready':
        return 'status-badge status-ready'
      case 'done':
        return 'status-badge status-done'
      default:
        return 'status-badge'
    }
  }

  const getStatusText = (status) => {
    switch(status) {
      case 'draft':
        return 'Draft'
      case 'ready':
        return 'Ready'
      case 'done':
        return 'Done'
      default:
        return status
    }
  }

  if (currentPage === 'detail') {
    return <DeliveryDetail onBack={handleBackToList} deliveryId={selectedDeliveryId} />
  }

  return (
    <div className="delivery-list">
      <header className="delivery-list-header">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <h1>Delivery</h1>
        <button className="btn-new" onClick={handleNewDelivery}>+ New</button>
      </header>

      <main className="delivery-list-content">
        <div className="list-toolbar">
          <div className="toolbar-left">
            <input
              type="text"
              className="search-input"
              placeholder="Search deliveries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="toolbar-right">
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
              className="btn-icon" 
              title="Refresh" 
              onClick={fetchDeliveries} 
              disabled={loading}
              style={{marginRight: '0.5rem'}}
            >
              {loading ? '...' : '↻'}
            </button>
            <button className="btn-icon" title="Search">Search</button>
            <button className="btn-icon" title="List view">List</button>
            <button className="btn-icon" title="Print">Print</button>
          </div>
        </div>

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
            {autoRefresh && ' • Auto-refresh enabled'}
          </span>
          <span>
            Showing {deliveries.filter(delivery => 
              !searchTerm || 
              (delivery.reference || delivery.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
              (delivery.customer_name || delivery.to_location || delivery.deliverTo || '').toLowerCase().includes(searchTerm.toLowerCase())
            ).length} of {deliveries.length} deliveries
          </span>
        </div>

        <div className="delivery-list-table-wrapper">
          <table className="delivery-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>From</th>
                <th>To</th>
                <th>Contact</th>
                <th>Schedule date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem'}}>Loading deliveries...</td></tr>
              ) : error ? (
                <tr><td colSpan="6" style={{textAlign: 'center', padding: '2rem', color: 'red'}}>{error}</td></tr>
              ) : deliveries.filter(delivery => 
                !searchTerm || 
                (delivery.reference || delivery.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (delivery.customer_name || delivery.to_location || delivery.deliverTo || '').toLowerCase().includes(searchTerm.toLowerCase())
              ).map(delivery => (
                <tr
                  key={delivery.delivery_order_id}
                  className="delivery-row"
                >
                  <td>
                    <span 
                      className="delivery-id-cell" 
                      style={{cursor: 'pointer', color: '#007bff'}} 
                      onClick={() => handleSelectDelivery(delivery.delivery_order_id)}
                    >
                      {delivery.reference || delivery.id}
                    </span>
                  </td>
                  <td>
                    <span className="delivery-from">{delivery.from_location_name || delivery.fromLocation || 'Warehouse'}</span>
                  </td>
                  <td>
                    <span className="delivery-to">{delivery.customer_name || delivery.to_location || delivery.deliverTo}</span>
                  </td>
                  <td>
                    <span className="delivery-contact">{delivery.responsible_user || delivery.responsible || 'Alert Contact'}</span>
                  </td>
                  <td>
                    <span className="delivery-date">{new Date(delivery.schedule_date || delivery.date).toLocaleDateString()}</span>
                  </td>
                  <td>
                    <select 
                      className={`status-select ${getStatusBadge(delivery.status)}`}
                      value={delivery.status}
                      onChange={(e) => handleStatusUpdate(delivery.delivery_order_id, e.target.value)}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      <option value="draft">Draft</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="validated">Validated</option>
                      <option value="done">Done</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>
                    <div className="action-buttons" style={{display: 'flex', gap: '0.5rem'}}>
                      <button 
                        className="btn-action btn-edit"
                        onClick={() => handleSelectDelivery(delivery.delivery_order_id)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem',
                          backgroundColor: '#007bff',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                      >
                        View
                      </button>
                      <button 
                        className="btn-action btn-delete"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteDelivery(delivery.delivery_order_id)
                        }}
                        style={{
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && !error && deliveries.length === 0 && (
          <div className="empty-state">
            <p>No deliveries found. Click "New" to create one.</p>
          </div>
        )}
      </main>
    </div>
  )
}
