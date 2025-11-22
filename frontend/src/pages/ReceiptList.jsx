import { useState } from 'react'
import '../styles/ReceiptList.css'
import ReceiptDetail from './ReceiptDetail'

export default function ReceiptList({ onBack }) {
  const [currentPage, setCurrentPage] = useState('list')
  const [selectedReceiptId, setSelectedReceiptId] = useState(null)
  const [receipts, setReceipts] = useState([
    { id: 'WH/07/0001', receiveFrom: 'Vendor A', status: 'draft', date: '22 Nov' },
    { id: 'WH/07/0002', receiveFrom: 'Vendor B', status: 'draft', date: '22 Nov' },
  ])

  const handleNewReceipt = () => {
    setSelectedReceiptId(null)
    setCurrentPage('detail')
  }

  const handleSelectReceipt = (receiptId) => {
    setSelectedReceiptId(receiptId)
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
            />
            <button className="btn-icon-search" title="Search">Search</button>
          </div>
          <div className="toolbar-right">
            <button className="btn-icon" title="List view">List</button>
            <button className="btn-icon" title="Print">Print</button>
          </div>
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
              </tr>
            </thead>
            <tbody>
              {receipts.map(receipt => (
                <tr
                  key={receipt.id}
                  className="receipt-row"
                  onClick={() => handleSelectReceipt(receipt.id)}
                >
                  <td>
                    <span className="receipt-id-cell">{receipt.id}</span>
                  </td>
                  <td>
                    <span className="receipt-to">Vendor</span>
                  </td>
                  <td>
                    <span className="receipt-contact">{receipt.receiveFrom}</span>
                  </td>
                  <td>
                    <span className="receipt-date">{receipt.date}</span>
                  </td>
                  <td>
                    <span className={getStatusBadge(receipt.status)}>
                      {getStatusText(receipt.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {receipts.length === 0 && (
          <div className="empty-state">
            <p>No receipts found. Click "New" to create one.</p>
          </div>
        )}
      </main>
    </div>
  )
}
