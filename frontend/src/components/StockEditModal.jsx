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

  const handleSave = () => {
    if (onSave) {
      onSave(formData)
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
              <h1 className="product-name">{formData.product}</h1>
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
                      value={formData.product || ''}
                      onChange={(e) => handleInputChange('product', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <input
                      type="text"
                      placeholder="Select or create category"
                      value={formData.category || ''}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>SKU Code</label>
                    <input
                      type="text"
                      value={formData.skuCode || ''}
                      onChange={(e) => handleInputChange('skuCode', e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label>Unit of Measure</label>
                    <input
                      type="text"
                      placeholder="Units, boxes, kg, etc."
                      value={formData.unitOfMeasure || ''}
                      onChange={(e) => handleInputChange('unitOfMeasure', e.target.value)}
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
                      value={formData.perUnitCost || 0}
                      onChange={(e) => handleInputChange('perUnitCost', parseFloat(e.target.value))}
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
                    value={formData.onHand || 0}
                    onChange={(e) => handleInputChange('onHand', parseInt(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label>Free to Use</label>
                  <input
                    type="number"
                    value={formData.freeToUse || 0}
                    onChange={(e) => handleInputChange('freeToUse', parseInt(e.target.value))}
                  />
                </div>

                <div className="form-group">
                  <label>Initial Stock</label>
                  <input
                    type="number"
                    value={formData.initialStock || 0}
                    onChange={(e) => handleInputChange('initialStock', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </div>
  )
}
