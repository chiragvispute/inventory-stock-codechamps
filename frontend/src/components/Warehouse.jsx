import React, { useState, useEffect } from 'react';
import './Warehouse.css';

const Warehouse = ({ onBack }) => {
  const [warehouseData, setWarehouseData] = useState({
    name: '',
    shortCode: '',
    address: ''
  });
  const [warehouses, setWarehouses] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Mock data - replace with API call later
  useEffect(() => {
    const mockWarehouses = [
      {
        id: 1,
        name: 'Main Warehouse',
        shortCode: 'MW001',
        address: '123 Industrial St, Business District, City 12345'
      },
      {
        id: 2,
        name: 'Secondary Storage',
        shortCode: 'SS002',
        address: '456 Storage Ave, Warehouse District, City 67890'
      },
      {
        id: 3,
        name: 'Distribution Center',
        shortCode: 'DC003',
        address: '789 Distribution Blvd, Logistics Park, City 54321'
      }
    ];
    setWarehouses(mockWarehouses);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWarehouseData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Warehouse data:', warehouseData);
  };

  const handleEdit = (warehouse) => {
    setWarehouseData({
      name: warehouse.name,
      shortCode: warehouse.shortCode,
      address: warehouse.address
    });
    setEditingId(warehouse.id);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this warehouse?')) {
      setWarehouses(warehouses.filter(w => w.id !== id));
    }
  };

  const resetForm = () => {
    setWarehouseData({
      name: '',
      shortCode: '',
      address: ''
    });
    setEditingId(null);
  };

  return (
    <div className="warehouse-container">
      <header className="page-header">
        <div className="header-content">
          <button className="back-btn" onClick={onBack}>← Back</button>
          <nav className="breadcrumb">
            <span>Dashboard</span>
            <span>Operations</span>
            <span>Products</span>
            <span>Move History</span>
            <span className="active">Settings</span>
          </nav>
          <button className="close-btn">✕</button>
        </div>
      </header>

      <div className="warehouse-content">
        <div className="warehouse-form-container">
          <h2 className="form-title">Warehouse</h2>
          
          <form onSubmit={handleSubmit} className="warehouse-form">
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={warehouseData.name}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter warehouse name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="shortCode">Short Code:</label>
              <input
                type="text"
                id="shortCode"
                name="shortCode"
                value={warehouseData.shortCode}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter short code"
              />
            </div>

            <div className="form-group">
              <label htmlFor="address">Address:</label>
              <textarea
                id="address"
                name="address"
                value={warehouseData.address}
                onChange={handleInputChange}
                className="form-textarea"
                placeholder="Enter warehouse address"
                rows={4}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="save-btn">
                {editingId ? 'Update' : 'Save'}
              </button>
              <button type="button" className="cancel-btn" onClick={resetForm}>
                {editingId ? 'Cancel Edit' : 'Cancel'}
              </button>
            </div>
          </form>

          <div className="form-note">
            <p>This page contains the warehouse details & location.</p>
          </div>
        </div>

        {/* Warehouse List Section */}
        <div className="warehouse-list-container">
          <h3 className="list-title">Existing Warehouses</h3>
          
          {warehouses.length === 0 ? (
            <div className="empty-state">
              <p>No warehouses found. Add your first warehouse using the form above.</p>
            </div>
          ) : (
            <div className="warehouse-list">
              {warehouses.map(warehouse => (
                <div key={warehouse.id} className="warehouse-item">
                  <div className="warehouse-info">
                    <div className="warehouse-header">
                      <h4 className="warehouse-name">{warehouse.name}</h4>
                      <span className="warehouse-code">{warehouse.shortCode}</span>
                    </div>
                    <p className="warehouse-address">{warehouse.address}</p>
                  </div>
                  <div className="warehouse-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => handleEdit(warehouse)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(warehouse.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Warehouse;
