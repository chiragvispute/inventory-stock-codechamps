import { useState } from 'react'
import '../styles/Stock.css'
import StockEditModal from '../components/StockEditModal'

export default function Stock() {
  const [searchTerm, setSearchTerm] = useState('')
  const [stocks, setStocks] = useState([
    { id: 1, product: 'Desk', perUnitCost: 3000, onHand: 50, freeToUse: 45, category: 'Furniture', salesPrice: 4000, cost: 3000 },
    { id: 2, product: 'Table', perUnitCost: 3000, onHand: 50, freeToUse: 50, category: 'Furniture', salesPrice: 4000, cost: 3000 },
    { id: 3, product: 'Chair', perUnitCost: 1500, onHand: 100, freeToUse: 95, category: 'Furniture', salesPrice: 2000, cost: 1500 },
  ])

  const [selectedStock, setSelectedStock] = useState(null)

  const handleSearch = () => {
    // Filter logic can be added here
    console.log('Search:', searchTerm)
  }

  const handleEditStart = (stock) => {
    setSelectedStock(stock)
  }

  const handleEditClose = () => {
    setSelectedStock(null)
  }

  const handleEditSave = (updatedData) => {
    setStocks(stocks.map(s => s.id === updatedData.id ? updatedData : s))
    setSelectedStock(null)
    alert('Stock updated successfully!')
  }

  const handleAddStock = () => {
    const newStock = {
      id: stocks.length + 1,
      product: 'New Product',
      perUnitCost: 0,
      onHand: 0,
      freeToUse: 0,
      category: '',
      salesPrice: 0,
      cost: 0
    }
    setStocks([...stocks, newStock])
  }

  const handleDeleteStock = (id) => {
    if (confirm('Are you sure you want to delete this stock item?')) {
      setStocks(stocks.filter(s => s.id !== id))
    }
  }

  return (
    <div className="stock-page">
      <header className="stock-header">
        <h1>Stock</h1>
        <button className="btn-search" onClick={handleSearch}>Search</button>
      </header>

      <div className="stock-toolbar">
        <div className="search-input-wrapper">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button className="btn-add-stock" onClick={handleAddStock}>+ Add Stock</button>
      </div>

      <div className="stock-table-wrapper">
        <table className="stock-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Per Unit Cost</th>
              <th>On Hand</th>
              <th>Free to Use</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map(stock => (
              <tr key={stock.id}>
                <td>{stock.product}</td>
                <td>{stock.perUnitCost} Rs</td>
                <td>{stock.onHand}</td>
                <td>{stock.freeToUse}</td>
                <td>
                  <div className="action-buttons">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEditStart(stock)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDeleteStock(stock.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {stocks.length === 0 && (
          <div className="empty-state">
            <p>No stock items found. Add your first stock item.</p>
          </div>
        )}
      </div>

      <div className="stock-summary">
        <p>User must be able to update the stock from here.</p>
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
