import { useState, useEffect } from 'react'
import '../styles/Stock.css'
import StockEditModal from '../components/StockEditModal'

export default function Stock() {
  const [searchTerm, setSearchTerm] = useState('')
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedStock, setSelectedStock] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(Date.now())
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Fetch stock data from backend
  useEffect(() => {
    fetchStockData()
  }, [])

  // Auto-refresh data every 30 seconds if enabled
  useEffect(() => {
    if (!autoRefresh) return
    
    const interval = setInterval(() => {
      if (!loading && !selectedStock) {
        fetchStockData()
      }
    }, 30000) // Refresh every 30 seconds
    
    return () => clearInterval(interval)
  }, [autoRefresh, loading, selectedStock])

  const fetchStockData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5001/api/stock', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch stock data')
      }

      const data = await response.json()
      // Transform backend data to match exact database schema
      const transformedData = data.map(item => ({
        id: `${item.product_id}-${item.location_id}`,
        product_id: item.product_id,
        location_id: item.location_id,
        product_name: item.product_name,
        per_unit_cost: parseFloat(item.per_unit_cost || 0),
        quantity_on_hand: item.quantity_on_hand,
        quantity_free_to_use: item.quantity_free_to_use,
        category_name: item.category_name || 'Uncategorized',
        sku_code: item.sku_code,
        unit_of_measure: item.unit_of_measure,
        location_name: item.location_name,
        warehouse_name: item.warehouse_name,
        min_stock_level: item.min_stock_level,
        max_stock_level: item.max_stock_level,
        last_updated_at: item.last_updated_at,
        // Legacy names for backward compatibility
        productId: item.product_id,
        locationId: item.location_id,
        product: item.product_name,
        perUnitCost: parseFloat(item.per_unit_cost || 0),
        onHand: item.quantity_on_hand,
        freeToUse: item.quantity_free_to_use,
        category: item.category_name || 'Uncategorized',
        sku: item.sku_code,
        unitOfMeasure: item.unit_of_measure,
        location: item.location_name,
        warehouse: item.warehouse_name,
        minStock: item.min_stock_level,
        maxStock: item.max_stock_level
      }))
      setStocks(transformedData)
      setError('')
      setLastUpdate(Date.now())
    } catch (err) {
      console.error('Error fetching stock data:', err)
      setError('Failed to load stock data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchStockData()
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5001/api/products?search=${encodeURIComponent(searchTerm)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to search products')
      }

      const data = await response.json()
      // Filter current stocks based on search results
      const productIds = data.map(p => p.product_id)
      const filteredStocks = stocks.filter(stock => 
        productIds.includes(stock.productId) ||
        stock.product.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setStocks(filteredStocks)
      setError('')
    } catch (err) {
      console.error('Error searching stock:', err)
      setError('Search failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEditStart = (stock) => {
    setSelectedStock(stock)
  }

  const handleEditClose = () => {
    setSelectedStock(null)
  }

  const handleEditSave = async (updatedData) => {
    const originalStocks = [...stocks]
    
    try {
      // Optimistic update - update UI immediately
      setStocks(stocks.map(s => s.id === updatedData.id ? updatedData : s))
      setSelectedStock(null)
      
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5001/api/stock', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productId: updatedData.product_id || updatedData.productId,
          locationId: updatedData.location_id || updatedData.locationId,
          quantityOnHand: updatedData.quantity_on_hand || updatedData.onHand,
          quantityFreeToUse: updatedData.quantity_free_to_use || updatedData.freeToUse,
          minStockLevel: updatedData.min_stock_level || updatedData.minStock,
          maxStockLevel: updatedData.max_stock_level || updatedData.maxStock
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to update stock: ${response.statusText}`)
      }

      const result = await response.json()
      // Refresh data from server to ensure consistency
      await fetchStockData()
      setError('')
    } catch (err) {
      console.error('Error updating stock:', err)
      // Rollback optimistic update
      setStocks(originalStocks)
      setError(`Failed to update stock: ${err.message}`)
      // Re-open modal with error
      setSelectedStock(updatedData)
    }
  }

  const handleAddStock = () => {
    // Navigate to add new product form or open modal
    alert('Add stock functionality would open a form to create new products and set initial stock levels. This requires product and location data from the backend.')
  }

  const handleDeleteStock = async (stockId, productId, locationId) => {
    if (!confirm('Are you sure you want to delete this stock item?')) return
    
    const originalStocks = [...stocks]
    
    try {
      // Optimistic update - remove from UI immediately
      setStocks(stocks.filter(s => s.id !== stockId))
      
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5001/api/stock/${productId}/${locationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to delete stock: ${response.statusText}`)
      }

      setError('')
      setLastUpdate(Date.now())
    } catch (err) {
      console.error('Error deleting stock:', err)
      // Rollback optimistic update
      setStocks(originalStocks)
      setError(`Failed to delete stock: ${err.message}`)
    }
  }

  return (
    <div className="stock-page">
      <header className="stock-header">
        <h1>Stock</h1>
        <button className="btn-search" onClick={handleSearch} disabled={loading}>
          {loading ? 'Loading...' : 'Search'}
        </button>
      </header>

      {error && (
        <div className="error-message" style={{
          backgroundColor: '#fee', 
          color: '#c33', 
          padding: '1rem', 
          margin: '1rem 0', 
          borderRadius: '4px',
          border: '1px solid #fcc'
        }}>
          {error}
          <button 
            onClick={fetchStockData} 
            style={{marginLeft: '1rem', padding: '0.5rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px'}}
          >
            Retry
          </button>
        </div>
      )}

      <div className="stock-toolbar">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="search-input"
            disabled={loading}
          />
        </div>
        <div className="toolbar-controls">
          <label style={{display: 'flex', alignItems: 'center', marginRight: '1rem'}}>
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
            onClick={fetchStockData} 
            disabled={loading}
            style={{marginRight: '1rem'}}
          >
            {loading ? 'Loading...' : '↻ Refresh'}
          </button>
          <button className="btn-add-stock" onClick={handleAddStock}>+ Add Stock</button>
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
          Showing {stocks.length} items
        </span>
      </div>

      {loading ? (
        <div style={{textAlign: 'center', padding: '2rem'}}>Loading stock data...</div>
      ) : (
        <div className="stock-table-wrapper">
          <table className="stock-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Location</th>
                <th>Per Unit Cost</th>
                <th>On Hand</th>
                <th>Free to Use</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map(stock => (
                <tr key={stock.id}>
                  <td>
                    <div>
                      <strong>{stock.product_name || stock.product}</strong>
                      <br />
                      <small style={{color: '#666'}}>{stock.category_name || stock.category}</small>
                    </div>
                  </td>
                  <td>{stock.sku_code || stock.sku}</td>
                  <td>
                    <div>
                      <strong>{stock.location_name || stock.location}</strong>
                      <br />
                      <small style={{color: '#666'}}>{stock.warehouse_name || stock.warehouse}</small>
                    </div>
                  </td>
                  <td>{stock.per_unit_cost || stock.perUnitCost} Rs</td>
                  <td>
                    <span className={(stock.quantity_on_hand || stock.onHand) <= (stock.min_stock_level || stock.minStock || 0) ? 'low-stock' : ''}>
                      {stock.quantity_on_hand || stock.onHand} {stock.unit_of_measure || stock.unitOfMeasure}
                    </span>
                  </td>
                  <td>{stock.quantity_free_to_use || stock.freeToUse} {stock.unit_of_measure || stock.unitOfMeasure}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-edit"
                        onClick={() => handleEditStart(stock)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          marginRight: '0.5rem',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        Edit Stock
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDeleteStock(stock.id, stock.product_id || stock.productId, stock.location_id || stock.locationId)}
                        style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
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

          {stocks.length === 0 && !loading && (
            <div className="empty-state">
              <p>No stock items found. {searchTerm ? 'Try a different search term.' : 'Add your first stock item.'}</p>
            </div>
          )}
        </div>
      )}

      <div className="stock-summary">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>
            <p>Total stock items: {stocks.length}</p>
            <p>Low stock items: {stocks.filter(s => (s.quantity_on_hand || s.onHand) <= (s.min_stock_level || s.minStock || 0)).length}</p>
          </div>
          <div style={{textAlign: 'right', fontSize: '0.75rem', color: '#6c757d'}}>
            <p>Real-time inventory tracking</p>
            <p>Updates synchronized with database</p>
          </div>
        </div>
      </div>

      {selectedStock && (
        <StockEditModal 
          stock={selectedStock}
          onClose={handleEditClose}
          onSave={handleEditSave}
        />
      )}
    </div>
  )
}
