import { useState, useEffect } from 'react'
import '../styles/ReceiptList.css'
import ReceiptDetail from './ReceiptDetail'

export default function ReceiptList({ onBack }) {
  const [currentPage, setCurrentPage] = useState('list')
  const [selectedReceiptId, setSelectedReceiptId] = useState(null)
  const [receipts, setReceipts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchReceipts()
  }, [])

  // Auto-refresh data every 60 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return
    
    const interval = setInterval(() => {
      if (!loading) {
        fetchReceipts()
      }
    }, 60000) // Refresh every 60 seconds
    
    return () => clearInterval(interval)
  }, [autoRefresh, loading])

  const fetchReceipts = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5001/api/receipts', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch receipts')
      }

      const data = await response.json()
      const formattedReceipts = data.map(receipt => ({
        // Database field names
        receipt_id: receipt.receipt_id,
        reference: receipt.reference,
        schedule_date: receipt.schedule_date,
        operation_type: receipt.operation_type,
        status: receipt.status,
        supplier_id: receipt.supplier_id,
        supplier_name: receipt.supplier_name,
        responsible_user_id: receipt.responsible_user_id,
        responsible_user: receipt.responsible_user,
        from_location: receipt.from_location,
        to_location_id: receipt.to_location_id,
        to_location_name: receipt.to_location_name,
        warehouse_name: receipt.warehouse_name,
        created_at: receipt.created_at,
        validated_at: receipt.validated_at,
        printed_at: receipt.printed_at,
        // Legacy field names for backward compatibility
        id: receipt.reference,
        receiptId: receipt.receipt_id,
        receiveFrom: receipt.supplier_name || 'Unknown Supplier',
        date: new Date(receipt.schedule_date).toLocaleDateString(),
        responsible: receipt.responsible_user,
        location: receipt.to_location_name,
        warehouse: receipt.warehouse_name
      }))
      setReceipts(formattedReceipts)
      setError('')
      setLastUpdate(Date.now())
    } catch (err) {
      console.error('Error fetching receipts:', err)
      setError('Failed to load receipts. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleNewReceipt = () => {
    // Create a new receipt reference
    const newReference = `REC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
    // Set new receipt ID and switch to detail view
    setSelectedReceiptId(newReference)
    setCurrentPage('detail')
  }

  const handleSelectReceipt = (receiptId) => {
    setSelectedReceiptId(receiptId)
    setCurrentPage('detail')
  }

  const handleBackToList = () => {
    setCurrentPage('list')
    // Refresh data when returning to list
    fetchReceipts()
  }

  // Update receipt status
  const handleStatusUpdate = async (receiptId, newStatus) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5001/api/receipts/${receiptId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (!response.ok) {
        throw new Error('Failed to update receipt status')
      }

      // Optimistically update the local state
      setReceipts(receipts.map(receipt => 
        receipt.receipt_id === receiptId 
          ? { ...receipt, status: newStatus }
          : receipt
      ))
      
      // Refresh data to ensure consistency
      await fetchReceipts()
      setLastUpdate(Date.now())
    } catch (error) {
      console.error('Error updating receipt status:', error)
      // Revert optimistic update by refreshing
      fetchReceipts()
    }
  }

  // Delete receipt
  const handleDeleteReceipt = async (receiptId) => {
    if (!confirm('Are you sure you want to delete this receipt?')) return
    
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5001/api/receipts/${receiptId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete receipt')
      }

      // Remove from local state
      setReceipts(receipts.filter(receipt => receipt.receipt_id !== receiptId))
      setLastUpdate(Date.now())
    } catch (error) {
      console.error('Error deleting receipt:', error)
      // Refresh data on error
      fetchReceipts()
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
    return <ReceiptDetail onBack={handleBackToList} receiptId={selectedReceiptId} />
  }

  return (
    <div className="receipt-list">
      <header className="receipt-list-header">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <h1>Receipt</h1>
        <button className="btn-new" onClick={handleNewReceipt}>+ New</button>
      </header>

      <main className="receipt-list-content">
        <div className="list-toolbar">
          <div className="toolbar-left">
            <input
              type="text"
              className="search-input"
              placeholder="Search receipts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn-icon-search" title="Search" onClick={() => fetchReceipts()}>Search</button>
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
              onClick={fetchReceipts} 
              disabled={loading}
              style={{marginRight: '0.5rem'}}
            >
              {loading ? '...' : '↻'}
            </button>
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
            Showing {receipts.filter(receipt => 
              !searchTerm || 
              (receipt.reference || receipt.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
              (receipt.supplier_name || receipt.receiveFrom || '').toLowerCase().includes(searchTerm.toLowerCase())
            ).length} of {receipts.length} receipts
          </span>
        </div>

        <div className="receipt-list-table-wrapper">
          <table className="receipt-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>To</th>
                <th>Contact</th>
                <th>Schedule date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{textAlign: 'center', padding: '2rem'}}>Loading receipts...</td></tr>
              ) : error ? (
                <tr><td colSpan="5" style={{textAlign: 'center', padding: '2rem', color: 'red'}}>{error}</td></tr>
              ) : receipts.filter(receipt => 
                !searchTerm || 
                (receipt.reference || receipt.id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (receipt.supplier_name || receipt.receiveFrom || '').toLowerCase().includes(searchTerm.toLowerCase())
              ).map(receipt => (
                <tr
                  key={receipt.receipt_id}
                  className="receipt-row"
                >
                  <td>
                    <span 
                      className="receipt-id-cell" 
                      style={{cursor: 'pointer', color: '#007bff'}} 
                      onClick={() => handleSelectReceipt(receipt.receipt_id)}
                    >
                      {receipt.reference || receipt.id}
                    </span>
                  </td>
                  <td>
                    <span className="receipt-to">{receipt.to_location_name || receipt.location || 'Warehouse'}</span>
                  </td>
                  <td>
                    <span className="receipt-contact">{receipt.supplier_name || receipt.receiveFrom}</span>
                  </td>
                  <td>
                    <span className="receipt-date">{new Date(receipt.schedule_date || receipt.date).toLocaleDateString()}</span>
                  </td>
                  <td>
                    <select 
                      className={`status-select ${getStatusBadge(receipt.status)}`}
                      value={receipt.status}
                      onChange={(e) => handleStatusUpdate(receipt.receipt_id, e.target.value)}
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
                        onClick={() => handleSelectReceipt(receipt.receipt_id)}
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
                          handleDeleteReceipt(receipt.receipt_id)
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

        {!loading && !error && receipts.length === 0 && (
          <div className="empty-state">
            <p>No receipts found. Click "New" to create one.</p>
          </div>
        )}
      </main>
    </div>
  )
}
