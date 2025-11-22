import { pool } from '../db.js';

/**
 * Warehouse model for handling warehouse operations
 */
export class WarehouseModel {
  
  /**
   * Get all warehouses with location count
   */
  static async getAllWarehouses() {
    const query = `
      SELECT w.warehouse_id, w.name, w.short_code, w.address, 
             w.created_at, w.updated_at,
             COUNT(l.location_id) as location_count
      FROM warehouses w
      LEFT JOIN locations l ON w.warehouse_id = l.warehouse_id
      GROUP BY w.warehouse_id, w.name, w.short_code, w.address, w.created_at, w.updated_at
      ORDER BY w.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Get warehouse by ID with locations
   */
  static async getWarehouseById(warehouseId) {
    const query = `
      SELECT w.warehouse_id, w.name, w.short_code, w.address, 
             w.created_at, w.updated_at
      FROM warehouses w
      WHERE w.warehouse_id = $1
    `;
    const result = await pool.query(query, [warehouseId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const warehouse = result.rows[0];
    
    // Get locations for this warehouse
    const locationsQuery = `
      SELECT location_id, name, short_code, description, created_at, updated_at
      FROM locations 
      WHERE warehouse_id = $1
      ORDER BY name
    `;
    const locationsResult = await pool.query(locationsQuery, [warehouseId]);
    warehouse.locations = locationsResult.rows;
    
    return warehouse;
  }

  /**
   * Create new warehouse
   */
  static async createWarehouse(warehouseData) {
    const { name, shortCode, address } = warehouseData;
    
    const query = `
      INSERT INTO warehouses (name, short_code, address)
      VALUES ($1, $2, $3)
      RETURNING warehouse_id, name, short_code, address, created_at
    `;
    
    const result = await pool.query(query, [name, shortCode, address]);
    return result.rows[0];
  }

  /**
   * Update warehouse
   */
  static async updateWarehouse(warehouseId, warehouseData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(warehouseData).forEach(key => {
      if (warehouseData[key] !== undefined) {
        const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        fields.push(`${dbField} = $${paramCount}`);
        values.push(warehouseData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    const query = `
      UPDATE warehouses 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE warehouse_id = $${paramCount}
      RETURNING warehouse_id, name, short_code, address, updated_at
    `;
    
    values.push(warehouseId);
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Delete warehouse
   */
  static async deleteWarehouse(warehouseId) {
    const query = 'DELETE FROM warehouses WHERE warehouse_id = $1 RETURNING *';
    const result = await pool.query(query, [warehouseId]);
    return result.rows[0];
  }
}

/**
 * Location model for handling location operations
 */
export class LocationModel {
  
  /**
   * Get all locations with warehouse details
   */
  static async getAllLocations() {
    const query = `
      SELECT l.location_id, l.name, l.short_code, l.description, 
             l.created_at, l.updated_at,
             w.warehouse_id, w.name as warehouse_name, w.short_code as warehouse_code
      FROM locations l
      JOIN warehouses w ON l.warehouse_id = w.warehouse_id
      ORDER BY w.name, l.name
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Get location by ID
   */
  static async getLocationById(locationId) {
    const query = `
      SELECT l.location_id, l.name, l.short_code, l.description, 
             l.created_at, l.updated_at,
             w.warehouse_id, w.name as warehouse_name, w.short_code as warehouse_code
      FROM locations l
      JOIN warehouses w ON l.warehouse_id = w.warehouse_id
      WHERE l.location_id = $1
    `;
    const result = await pool.query(query, [locationId]);
    return result.rows[0];
  }

  /**
   * Get locations by warehouse
   */
  static async getLocationsByWarehouse(warehouseId) {
    const query = `
      SELECT location_id, name, short_code, description, created_at, updated_at
      FROM locations 
      WHERE warehouse_id = $1
      ORDER BY name
    `;
    const result = await pool.query(query, [warehouseId]);
    return result.rows;
  }

  /**
   * Create new location
   */
  static async createLocation(locationData) {
    const { name, shortCode, warehouseId, description } = locationData;
    
    const query = `
      INSERT INTO locations (name, short_code, warehouse_id, description)
      VALUES ($1, $2, $3, $4)
      RETURNING location_id, name, short_code, warehouse_id, description, created_at
    `;
    
    const result = await pool.query(query, [name, shortCode, warehouseId, description]);
    return result.rows[0];
  }

  /**
   * Update location
   */
  static async updateLocation(locationId, locationData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(locationData).forEach(key => {
      if (locationData[key] !== undefined) {
        const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        fields.push(`${dbField} = $${paramCount}`);
        values.push(locationData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    const query = `
      UPDATE locations 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE location_id = $${paramCount}
      RETURNING location_id, name, short_code, warehouse_id, description, updated_at
    `;
    
    values.push(locationId);
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Delete location
   */
  static async deleteLocation(locationId) {
    const query = 'DELETE FROM locations WHERE location_id = $1 RETURNING *';
    const result = await pool.query(query, [locationId]);
    return result.rows[0];
  }
}