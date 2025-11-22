import React, { useState, useEffect } from 'react';
import './MovesHistory.css';

const MovesHistory = ({ searchTerm = '', searchSettings = {} }) => {
  const [moves, setMoves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, in, out

  // Mock data for testing - replace with actual API call later
  useEffect(() => {
    const mockMoves = [
      {
        id: 1,
        reference: 'REF001',
        productName: 'Laptop Dell XPS',
        productCode: 'LP001',
        fromLocation: 'Warehouse A',
        toLocation: 'Store 1',
        quantity: 5,
        moveType: 'out',
        moveDate: '2024-01-15',
        notes: 'Regular stock transfer'
      },
      {
        id: 2,
        reference: 'REF001',
        productName: 'Wireless Mouse',
        productCode: 'MS002',
        fromLocation: 'Warehouse A',
        toLocation: 'Store 1',
        quantity: 10,
        moveType: 'out',
        moveDate: '2024-01-15',
        notes: 'Regular stock transfer'
      },
      {
        id: 3,
        reference: 'REF002',
        productName: 'iPhone 15',
        productCode: 'IP015',
        fromLocation: 'Supplier',
        toLocation: 'Warehouse A',
        quantity: 20,
        moveType: 'in',
        moveDate: '2024-01-16',
        notes: 'New stock arrival'
      },
      {
        id: 4,
        reference: 'REF003',
        productName: 'Gaming Chair',
        productCode: 'GC001',
        fromLocation: 'Store 2',
        toLocation: 'Customer',
        quantity: 2,
        moveType: 'out',
        moveDate: '2024-01-17',
        notes: 'Customer purchase'
      },
      {
        id: 5,
        reference: 'REF002',
        productName: 'iPad Pro',
        productCode: 'IP020',
        fromLocation: 'Supplier',
        toLocation: 'Warehouse A',
        quantity: 15,
        moveType: 'in',
        moveDate: '2024-01-16',
        notes: 'New stock arrival'
      }
    ];

    // Simulate loading delay
    setTimeout(() => {
      setMoves(mockMoves);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter moves based on search term and settings
  const filterMovesBySearch = (movesArray) => {
    if (!searchTerm) return movesArray;

    const { caseSensitive = false, exactMatch = false, searchFields = ['all'] } = searchSettings;
    
    return movesArray.filter(move => {
      const searchValue = caseSensitive ? searchTerm : searchTerm.toLowerCase();
      
      const searchInFields = (text, field) => {
        if (!searchFields.includes('all') && !searchFields.includes(field)) return false;
        
        const textValue = caseSensitive ? text : text.toLowerCase();
        
        if (exactMatch) {
          return textValue === searchValue;
        } else {
          return textValue.includes(searchValue);
        }
      };

      return (
        searchInFields(move.productName, 'name') ||
        searchInFields(move.productCode, 'code') ||
        searchInFields(move.fromLocation, 'location') ||
        searchInFields(move.toLocation, 'location') ||
        searchInFields(move.reference, 'reference') ||
        searchInFields(move.notes || '', 'name')
      );
    });
  };

  // Apply search filter to moves
  const filteredMoves = filterMovesBySearch(moves);

  // Group filtered moves by reference
  const groupedMoves = filteredMoves.reduce((groups, move) => {
    if (!groups[move.reference]) {
      groups[move.reference] = [];
    }
    groups[move.reference].push(move);
    return groups;
  }, {});

  // Filter groups based on move type
  const filteredGroups = Object.entries(groupedMoves).filter(([reference, movesGroup]) => {
    if (filter === 'all') return true;
    return movesGroup.some(move => move.moveType === filter);
  });

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  if (loading) {
    return (
      <div className="moves-history-container">
        <div className="loading">Loading moves history...</div>
      </div>
    );
  }

  return (
    <div className="moves-history-container">
      <div className="moves-history-header">
        <h2>Inventory Moves History</h2>
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            All Moves
          </button>
          <button 
            className={`filter-btn in ${filter === 'in' ? 'active' : ''}`}
            onClick={() => handleFilterChange('in')}
          >
            In Moves
          </button>
          <button 
            className={`filter-btn out ${filter === 'out' ? 'active' : ''}`}
            onClick={() => handleFilterChange('out')}
          >
            Out Moves
          </button>
        </div>
      </div>

      {searchTerm && (
        <div className="search-results-summary">
          <p>Found {filteredMoves.length} moves matching "{searchTerm}"</p>
        </div>
      )}

      <div className="moves-table-container">
        <table className="moves-table">
          <thead>
            <tr>
              <th>Reference</th>
              <th>Product</th>
              <th>Product Code</th>
              <th>From Location</th>
              <th>To Location</th>
              <th>Quantity</th>
              <th>Move Type</th>
              <th>Date</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {filteredGroups.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-data">
                  {searchTerm ? `No moves found matching "${searchTerm}"` : 'No moves found'}
                </td>
              </tr>
            ) : (
              filteredGroups.map(([reference, movesGroup]) => 
                movesGroup.map((move, index) => (
                  <tr 
                    key={move.id} 
                    className={`move-row ${move.moveType} ${index === 0 ? 'first-in-group' : ''}`}
                  >
                    <td className="reference-cell">
                      {index === 0 && (
                        <span className="reference-badge">
                          {reference}
                          {movesGroup.length > 1 && (
                            <span className="group-count">({movesGroup.length})</span>
                          )}
                        </span>
                      )}
                    </td>
                    <td>{move.productName}</td>
                    <td>{move.productCode}</td>
                    <td>{move.fromLocation}</td>
                    <td>{move.toLocation}</td>
                    <td className="quantity-cell">{move.quantity}</td>
                    <td>
                      <span className={`move-type-badge ${move.moveType}`}>
                        {move.moveType.toUpperCase()}
                      </span>
                    </td>
                    <td>{new Date(move.moveDate).toLocaleDateString()}</td>
                    <td className="notes-cell">{move.notes}</td>
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MovesHistory;
