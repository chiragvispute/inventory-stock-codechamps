import { useState } from 'react'
import '../styles/StockEditModal.css'

export default function StockEditModal({ stock, onClose, onSave }) {
  const [activeTab, setActiveTab] = useState('general')
  const [formData, setFormData] = useState(stock || {})

  const handleInputChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value
    })
  }

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    try {
      setSaving(true)
      setError('')
      
      // Validate data
      if (!formData.product_name && !formData.product) {
        setError('Product name is required')
        return
      }
      
      const onHand = formData.quantity_on_hand !== undefined ? formData.quantity_on_hand : formData.onHand
      const freeToUse = formData.quantity_free_to_use !== undefined ? formData.quantity_free_to_use : formData.freeToUse
      const minStock = formData.min_stock_level !== undefined ? formData.min_stock_level : formData.minStock
      const maxStock = formData.max_stock_level !== undefined ? formData.max_stock_level : formData.maxStock
      
      if (onHand < 0 || freeToUse < 0) {
        setError('Quantities cannot be negative')
        return
      }
      
      if (minStock < 0 || maxStock < 0) {
        setError('Stock levels cannot be negative')
        return
      }
      
      if (maxStock && minStock && maxStock < minStock) {
        setError('Maximum stock level cannot be less than minimum stock level')
        return
      }
      
      // Call parent save handler with validated data
      if (onSave) {
        await onSave(formData)
      }
    } catch (err) {
      console.error('Error saving stock:', err)
      setError(err.message || 'Failed to save stock changes')
    } finally {
      setSaving(false)
    }
  }

  if (!stock) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="header-top">
            <div className="product-name-section">
              <span className="star-icon">☆</span>
              <h1 className="product-name">{formData.product_name || formData.product}</h1>
            </div>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-section">
          <button 
            className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            General Information
          </button>
          <button 
            className={`tab-btn ${activeTab === 'prices' ? 'active' : ''}`}
            onClick={() => setActiveTab('prices')}
          >
            Prices
          </button>
          <button 
            className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            Inventory
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message" style={{
            backgroundColor: '#fee', 
            color: '#c33', 
            padding: '0.75rem', 
            margin: '1rem', 
            borderRadius: '4px',
            border: '1px solid #fcc'
          }}>
            {error}
          </div>
        )}

        {/* Tab Content */}
        <div className="modal-body">
          {activeTab === 'general' && (
            <div className="tab-content">
              <div className="content-main">
                <div className="form-section">
                  <div className="form-group">
                    <label>Product Name</label>
                    <input
                      type="text"
                      value={formData.product_name || formData.product || ''}
                      onChange={(e) => {
                        handleInputChange('product_name', e.target.value)
                        handleInputChange('product', e.target.value) // fallback
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <input
                      type="text"
                      placeholder="Select or create category"
                      value={formData.category_name || formData.category || ''}
                      onChange={(e) => {
                        handleInputChange('category_name', e.target.value)
                        handleInputChange('category', e.target.value) // fallback
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label>SKU Code</label>
                    <input
                      type="text"
                      value={formData.sku_code || formData.skuCode || ''}
                      onChange={(e) => {
                        handleInputChange('sku_code', e.target.value)
                        handleInputChange('skuCode', e.target.value) // fallback
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label>Unit of Measure</label>
                    <input
                      type="text"
                      placeholder="Units, boxes, kg, etc."
                      value={formData.unit_of_measure || formData.unitOfMeasure || ''}
                      onChange={(e) => {
                        handleInputChange('unit_of_measure', e.target.value)
                        handleInputChange('unitOfMeasure', e.target.value) // fallback
                      }}
                    />
                  </div>

                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={formData.location_name || formData.location || ''}
                    readOnly
                    style={{backgroundColor: '#f5f5f5', color: '#666'}}
                  />
                  <small>Location cannot be changed in this view</small>
                </div>

                <div className="form-group">
                  <label>Warehouse</label>
                  <input
                    type="text"
                    value={formData.warehouse_name || formData.warehouse || ''}
                    readOnly
                    style={{backgroundColor: '#f5f5f5', color: '#666'}}
                  />
                </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'prices' && (
            <div className="tab-content">
              <div className="form-section">
                <h3>Price Information</h3>
                <div className="form-group">
                  <label>Per Unit Cost</label>
                  <div className="input-with-currency">
                    <span className="currency">₹</span>
                    <input
                      type="number"
                      value={formData.per_unit_cost !== undefined ? formData.per_unit_cost : (formData.perUnitCost || 0)}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value)
                        handleInputChange('per_unit_cost', value)
                        handleInputChange('perUnitCost', value) // fallback
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div className="tab-content">
              <div className="form-section">
                <h3>Inventory Information</h3>
                <div className="form-group">
                  <label>On Hand</label>
                  <input
                    type="number"
                    value={formData.quantity_on_hand !== undefined ? formData.quantity_on_hand : (formData.onHand || 0)}
                    onChange={(e) => {
                      const value = parseInt(e.target.value)
                      handleInputChange('quantity_on_hand', value)
                      handleInputChange('onHand', value) // fallback
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>Free to Use</label>
                  <input
                    type="number"
                    value={formData.quantity_free_to_use !== undefined ? formData.quantity_free_to_use : (formData.freeToUse || 0)}
                    onChange={(e) => {
                      const value = parseInt(e.target.value)
                      handleInputChange('quantity_free_to_use', value)
                      handleInputChange('freeToUse', value) // fallback
                    }}
                  />
                </div>

                <div className="form-group">
                  <label>Minimum Stock Level</label>
                  <input
                    type="number"
                    value={formData.min_stock_level !== undefined ? formData.min_stock_level : (formData.minStock || 0)}
                    onChange={(e) => {
                      const value = parseInt(e.target.value)
                      handleInputChange('min_stock_level', value)
                      handleInputChange('minStock', value) // fallback
                    }}
                  />
                  <small>Alert when stock falls below this level</small>
                </div>

                <div className="form-group">
                  <label>Maximum Stock Level</label>
                  <input
                    type="number"
                    value={formData.max_stock_level !== undefined ? formData.max_stock_level : (formData.maxStock || 0)}
                    onChange={(e) => {
                      const value = parseInt(e.target.value)
                      handleInputChange('max_stock_level', value)
                      handleInputChange('maxStock', value) // fallback
                    }}
                  />
                  <small>Optional maximum stock level</small>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}
