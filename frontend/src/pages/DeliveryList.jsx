import { useState } from 'react'
import '../styles/DeliveryList.css'
import DeliveryDetail from './DeliveryDetail'

export default function DeliveryList({ onBack }) {
  const [currentPage, setCurrentPage] = useState('list')
  const [selectedDeliveryId, setSelectedDeliveryId] = useState(null)
  const [deliveries, setDeliveries] = useState([
    { id: 'WH/OUT/0001', deliverTo: 'Vendor A', status: 'draft', date: '22 Nov' },
    { id: 'WH/OUT/0002', deliverTo: 'Vendor B', status: 'draft', date: '22 Nov' },
  ])

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
            />
          </div>
          <div className="toolbar-right">
            <button className="btn-icon" title="Search">Search</button>
            <button className="btn-icon" title="List view">List</button>
            <button className="btn-icon" title="Print">Print</button>
          </div>
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
              </tr>
            </thead>
            <tbody>
              {deliveries.map(delivery => (
                <tr
                  key={delivery.id}
                  className="delivery-row"
                  onClick={() => handleSelectDelivery(delivery.id)}
                >
                  <td>
                    <span className="delivery-id-cell">{delivery.id}</span>
                  </td>
                  <td>
                    <span className="delivery-from">Warehouse</span>
                  </td>
                  <td>
                    <span className="delivery-to">{delivery.deliverTo}</span>
                  </td>
                  <td>
                    <span className="delivery-contact">Alert Contact</span>
                  </td>
                  <td>
                    <span className="delivery-date">{delivery.date}</span>
                  </td>
                  <td>
                    <span className={getStatusBadge(delivery.status)}>
                      {getStatusText(delivery.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {deliveries.length === 0 && (
          <div className="empty-state">
            <p>No deliveries found. Click "New" to create one.</p>
          </div>
        )}
      </main>
    </div>
  )
}
