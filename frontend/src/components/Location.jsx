import React, { useState, useEffect } from 'react';
import './Location.css';

const Location = ({ onBack }) => {
  const [locationData, setLocationData] = useState({
    name: '',
    shortCode: '',
    warehouse: 'WH'
  });
  const [locations, setLocations] = useState([]);
  const [editingId, setEditingId] = useState(null);

  // Mock data - replace with API call later
  useEffect(() => {
    const mockLocations = [
      {
        id: 1,
        name: 'Aisle A1',
        shortCode: 'A1-001',
        warehouse: 'WH'
      },
      {
        id: 2,
        name: 'Rack B2',
        shortCode: 'B2-005',
        warehouse: 'WH1'
      },
      {
        id: 3,
        name: 'Storage Room C',
        shortCode: 'C-010',
        warehouse: 'WH2'
      },
      {
        id: 4,
        name: 'Loading Dock',
        shortCode: 'LD-001',
        warehouse: 'WH'
      }
    ];
    setLocations(mockLocations);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Location data:', locationData);
  };

  const handleEdit = (location) => {
    setLocationData({
      name: location.name,
      shortCode: location.shortCode,
      warehouse: location.warehouse
    });
    setEditingId(location.id);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this location?')) {
      setLocations(locations.filter(l => l.id !== id));
    }
  };

  const resetForm = () => {
    setLocationData({
      name: '',
      shortCode: '',
      warehouse: 'WH'
    });
    setEditingId(null);
  };

  return (
    <div className="location-container">
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

      <div className="location-content">
        <div className="location-form-container">
          <h2 className="form-title">Location</h2>
          
          <form onSubmit={handleSubmit} className="location-form">
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={locationData.name}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter location name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="shortCode">Short Code:</label>
              <input
                type="text"
                id="shortCode"
                name="shortCode"
                value={locationData.shortCode}
                onChange={handleInputChange}
                className="form-input"
                placeholder="Enter short code"
              />
            </div>

            <div className="form-group">
              <label htmlFor="warehouse">Warehouse:</label>
              <select
                id="warehouse"
                name="warehouse"
                value={locationData.warehouse}
                onChange={handleInputChange}
                className="form-select"
              >
                <option value="WH">WH</option>
                <option value="WH1">WH1</option>
                <option value="WH2">WH2</option>
              </select>
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
            <p>This holds the multiple locations of warehouse, rooms etc.</p>
          </div>
        </div>

        {/* Location List Section */}
        <div className="location-list-container">
          <h3 className="list-title">Existing Locations</h3>
          
          {locations.length === 0 ? (
            <div className="empty-state">
              <p>No locations found. Add your first location using the form above.</p>
            </div>
          ) : (
            <div className="location-list">
              {locations.map(location => (
                <div key={location.id} className="location-item">
                  <div className="location-info">
                    <div className="location-header">
                      <h4 className="location-name">{location.name}</h4>
                      <span className="location-code">{location.shortCode}</span>
                    </div>
                    <p className="location-warehouse">Warehouse: {location.warehouse}</p>
                  </div>
                  <div className="location-actions">
                    <button 
                      className="edit-btn"
                      onClick={() => handleEdit(location)}
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(location.id)}
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

export default Location;
