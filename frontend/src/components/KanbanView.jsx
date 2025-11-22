import { useState, useEffect } from 'react'
import '../styles/KanbanView.css'

export default function KanbanView({ 
  data = [], 
  columns = [], 
  onItemClick = () => {}, 
  onItemMove = () => {},
  renderItem = null 
}) {
  const [draggedItem, setDraggedItem] = useState(null)
  const [dragOverColumn, setDragOverColumn] = useState(null)

  const handleDragStart = (e, item) => {
    setDraggedItem(item)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e, columnId) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(columnId)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (e, columnId) => {
    e.preventDefault()
    if (draggedItem && draggedItem.status !== columnId) {
      onItemMove(draggedItem, columnId)
    }
    setDraggedItem(null)
    setDragOverColumn(null)
  }

  const getItemsForColumn = (columnId) => {
    return data.filter(item => item.status === columnId || item.category === columnId)
  }

  const defaultRenderItem = (item) => (
    <div className="kanban-item-content">
      <h4>{item.name || item.title}</h4>
      <p>{item.description || item.subtitle}</p>
      {item.quantity && <span className="quantity">Qty: {item.quantity}</span>}
      {item.value && <span className="value">${item.value}</span>}
    </div>
  )

  return (
    <div className="kanban-view">
      <div className="kanban-columns">
        {columns.map(column => (
          <div 
            key={column.id} 
            className={`kanban-column ${dragOverColumn === column.id ? 'drag-over' : ''}`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <div className="kanban-column-header">
              <h3>{column.title}</h3>
              <span className="item-count">{getItemsForColumn(column.id).length}</span>
            </div>
            
            <div className="kanban-column-content">
              {getItemsForColumn(column.id).map(item => (
                <div
                  key={item.id}
                  className={`kanban-item ${draggedItem?.id === item.id ? 'dragging' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                  onClick={() => onItemClick(item)}
                >
                  {renderItem ? renderItem(item) : defaultRenderItem(item)}
                </div>
              ))}
              
              {getItemsForColumn(column.id).length === 0 && (
                <div className="kanban-empty">
                  <p>No items in {column.title}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}