import { useState, useEffect } from 'react'
import '../styles/DeliveryDetail.css'
import ContactDetail from '../components/ContactDetail'

export default function DeliveryDetail({ onBack, deliveryId = null }) {
  const [delivery, setDelivery] = useState({
    id: '',
    deliverTo: '',
    responsible: '',
    scheduledDate: '',
    status: 'draft',
    products: []
  })

  const [products, setProducts] = useState([])
  const [selectedContact, setSelectedContact] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    jobPosition: '',
    gstin: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    website: '',
    tags: ''
  })

  useEffect(() => {
    if (deliveryId) {
      fetchDeliveryDetail()
    } else {
      // Initialize new delivery
      setDelivery({
        id: 'WH/OUT/NEW',
        deliverTo: '',
        responsible: '',
        scheduledDate: new Date().toISOString().split('T')[0],
        status: 'draft',
        products: []
      })
      setProducts([{ id: 1, name: '', quantity: '', orderedQuantity: '' }])
    }
  }, [deliveryId])

  const fetchDeliveryDetail = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5001/api/deliveries/${deliveryId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch delivery details')
      }

      const data = await response.json()
      setDelivery({
        id: data.reference,
        deliverTo: data.customer_name || data.to_location || 'Unknown Customer',
        responsible: data.responsible_user,
        scheduledDate: data.schedule_date,
        status: data.status,
        products: data.items || []
      })

      if (data.items && data.items.length > 0) {
        setProducts(data.items.map((item, index) => ({
          id: index + 1,
          name: item.product_name,
          quantity: item.quantity_delivered || '',
          orderedQuantity: item.quantity_ordered,
          productId: item.product_id,
          sku: item.sku_code
        })))
      } else {
        setProducts([{ id: 1, name: '', quantity: '', orderedQuantity: '' }])
      }

      setError('')
    } catch (err) {
      console.error('Error fetching delivery details:', err)
      setError('Failed to load delivery details. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setDelivery(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleProductChange = (index, field, value) => {
    const newProducts = [...products]
    newProducts[index][field] = value
    setProducts(newProducts)
  }

  const handleAddProduct = () => {
    setProducts(prev => [...prev, { id: prev.length + 1, name: '', quantity: '' }])
  }

  const handleRemoveProduct = (index) => {
    setProducts(prev => prev.filter((_, i) => i !== index))
  }

  const handleMarkAsReady = () => {
    setDelivery(prev => ({
      ...prev,
      status: 'ready'
    }))
  }

  const handleValidate = () => {
    setDelivery(prev => ({
      ...prev,
      status: 'done'
    }))
  }

  const getStatusClass = (status) => {
    switch(status) {
      case 'draft': return 'status-draft'
      case 'ready': return 'status-ready'
      case 'done': return 'status-done'
      default: return ''
    }
  }

  const getStatusLabel = (status) => {
    switch(status) {
      case 'draft': return 'Draft'
      case 'ready': return 'Ready'
      case 'done': return 'Done'
      default: return ''
    }
  }

  const handleContactSave = (updatedContact) => {
    // Update the contact data with changes
    setContactData(updatedContact)
    // In future, this will call API to update the database
    console.log('Contact updated:', updatedContact)
    alert('Contact details updated successfully!')
  }

  return (
    <div className="delivery-detail">
      <header className="delivery-header">
        <button className="btn-back" onClick={onBack}>← Back</button>
        <h1>Delivery</h1>
        <div className="header-actions">
          <button className="btn-icon-action" title="Search">Search</button>
          <button className="btn-icon-action" title="List view">List</button>
          <button className="btn-icon-action" title="Print">Print</button>
        </div>
      </header>

      <main className="delivery-content">
        <div className="delivery-card">
          <div className="delivery-header-section">
            <div className="delivery-id">{delivery.id}</div>
            <div className="delivery-buttons">
              {delivery.status === 'draft' && (
                <>
                  <button className="btn btn-secondary">Print</button>
                  <button className="btn btn-secondary">Cancel</button>
                  <button className="btn btn-primary" onClick={handleMarkAsReady}>Mark as Todo</button>
                </>
              )}
              {delivery.status === 'ready' && (
                <>
                  <button className="btn btn-secondary">Print</button>
                  <button className="btn btn-secondary">Return</button>
                  <button className="btn btn-primary" onClick={handleValidate}>Validate</button>
                </>
              )}
              {delivery.status === 'done' && (
                <>
                  <button className="btn btn-secondary">Print</button>
                  <button className="btn btn-secondary">Return</button>
                  <button className="btn btn-success" disabled>Done</button>
                </>
              )}
            </div>
          </div>

          <div className="delivery-status-path">
            <span className={`status-step ${delivery.status === 'draft' || delivery.status === 'ready' || delivery.status === 'done' ? 'active' : ''}`}>Draft</span>
            <span className="status-arrow">›</span>
            <span className={`status-step ${delivery.status === 'ready' || delivery.status === 'done' ? 'active' : ''}`}>Ready</span>
            <span className="status-arrow">›</span>
            <span className={`status-step ${delivery.status === 'done' ? 'active' : ''}`}>Done</span>
          </div>

          <div className="delivery-body">
            <div className="form-section">
              <div className="form-group">
                <label>Deliver To</label>
                <button
                  type="button"
                  className="contact-button"
                  onClick={() => setSelectedContact(contactData)}
                >
                  {delivery.deliverTo}
                </button>
              </div>

              <div className="form-group">
                <label>Scheduled Date</label>
                <input
                  type="date"
                  value={delivery.scheduledDate}
                  onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Responsible</label>
                <input
                  type="text"
                  placeholder="Enter responsible person"
                  value={delivery.responsible}
                  onChange={(e) => handleInputChange('responsible', e.target.value)}
                />
              </div>
            </div>

            <div className="products-section">
              <div className="section-header">
                <h3>Products</h3>
              </div>

              <table className="products-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="text"
                          placeholder="[DESC001] Desk"
                          value={product.name}
                          onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          placeholder="0"
                          value={product.quantity}
                          onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                        />
                      </td>
                      <td>
                        {products.length > 1 && (
                          <button 
                            className="btn-delete"
                            onClick={() => handleRemoveProduct(index)}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button className="btn-add-product" onClick={handleAddProduct}>
                + New Product
              </button>
            </div>
          </div>
        </div>
      </main>

      <ContactDetail 
        contact={selectedContact} 
        onClose={() => setSelectedContact(null)}
        onSave={handleContactSave}
      />
    </div>
  )
}
