import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

// Define Warehouse model with Sequelize
const Warehouse = sequelize.define('Warehouse', {
  warehouse_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  short_code: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'warehouses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

/**
 * Warehouse model for handling warehouse operations
 */
export class WarehouseModel {
  
  /**
   * Get all warehouses with location count
   */
  static async getAllWarehouses() {
    const warehouses = await sequelize.query(`
      SELECT w.warehouse_id, w.name, w.short_code, w.address, 
             w.created_at, w.updated_at,
             COUNT(l.location_id) as location_count
      FROM warehouses w
      LEFT JOIN locations l ON w.warehouse_id = l.warehouse_id
      GROUP BY w.warehouse_id, w.name, w.short_code, w.address, w.created_at, w.updated_at
      ORDER BY w.created_at DESC
    `, { type: sequelize.QueryTypes.SELECT });
    return warehouses;
  }

  /**
   * Get warehouse by ID with locations
   */
  static async getWarehouseById(warehouseId) {
    const warehouse = await sequelize.query(`
      SELECT w.warehouse_id, w.name, w.short_code, w.address, 
             w.created_at, w.updated_at
      FROM warehouses w
      WHERE w.warehouse_id = $1
    `, { 
      replacements: [warehouseId], 
      type: sequelize.QueryTypes.SELECT 
    });
    
    if (warehouse.length === 0) {
      return null;
    }
    
    const warehouseData = warehouse[0];
    
    // Get locations for this warehouse
    const locations = await sequelize.query(`
      SELECT location_id, name, short_code, description, created_at, updated_at
      FROM locations 
      WHERE warehouse_id = $1
      ORDER BY name
    `, { 
      replacements: [warehouseId], 
      type: sequelize.QueryTypes.SELECT 
    });
    
    warehouseData.locations = locations;
    
    return warehouseData;
  }

  /**
   * Create new warehouse
   */
  static async createWarehouse(warehouseData) {
    const { name, shortCode, address } = warehouseData;
    
    const warehouse = await Warehouse.create({
      name,
      short_code: shortCode,
      address
    });
    
    return warehouse.dataValues;
  }

  /**
   * Update warehouse
   */
  static async updateWarehouse(warehouseId, warehouseData) {
    const updateFields = {};
    
    // Map camelCase to snake_case for database fields
    if (warehouseData.name !== undefined) updateFields.name = warehouseData.name;
    if (warehouseData.shortCode !== undefined) updateFields.short_code = warehouseData.shortCode;
    if (warehouseData.address !== undefined) updateFields.address = warehouseData.address;

    if (Object.keys(updateFields).length === 0) {
      throw new Error('No fields to update');
    }

    const [affectedRows] = await Warehouse.update(updateFields, {
      where: { warehouse_id: warehouseId }
    });

    if (affectedRows === 0) {
      return null;
    }

    // Return updated warehouse
    return await this.getWarehouseById(warehouseId);
  }

  /**
   * Delete warehouse
   */
  static async deleteWarehouse(warehouseId) {
    const warehouse = await Warehouse.findOne({ where: { warehouse_id: warehouseId } });
    if (!warehouse) return null;
    
    await Warehouse.destroy({ where: { warehouse_id: warehouseId } });
    return warehouse.dataValues;
  }
}

// Define Location model with Sequelize
const Location = sequelize.define('Location', {
  location_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  short_code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  warehouse_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'locations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

/**
 * Location model for handling location operations
 */
export class LocationModel {
  
  /**
   * Get all locations with warehouse details
   */
  static async getAllLocations() {
    const locations = await sequelize.query(`
      SELECT l.location_id, l.name, l.short_code, l.description, 
             l.created_at, l.updated_at,
             w.warehouse_id, w.name as warehouse_name, w.short_code as warehouse_code
      FROM locations l
      JOIN warehouses w ON l.warehouse_id = w.warehouse_id
      ORDER BY w.name, l.name
    `, { type: sequelize.QueryTypes.SELECT });
    return locations;
  }

  /**
   * Get location by ID
   */
  static async getLocationById(locationId) {
    const location = await sequelize.query(`
      SELECT l.location_id, l.name, l.short_code, l.description, 
             l.created_at, l.updated_at,
             w.warehouse_id, w.name as warehouse_name, w.short_code as warehouse_code
      FROM locations l
      JOIN warehouses w ON l.warehouse_id = w.warehouse_id
      WHERE l.location_id = $1
    `, { 
      replacements: [locationId], 
      type: sequelize.QueryTypes.SELECT 
    });
    return location[0];
  }

  /**
   * Get locations by warehouse
   */
  static async getLocationsByWarehouse(warehouseId) {
    const locations = await sequelize.query(`
      SELECT location_id, name, short_code, description, created_at, updated_at
      FROM locations 
      WHERE warehouse_id = $1
      ORDER BY name
    `, { 
      replacements: [warehouseId], 
      type: sequelize.QueryTypes.SELECT 
    });
    return locations;
  }

  /**
   * Create new location
   */
  static async createLocation(locationData) {
    const { name, shortCode, warehouseId, description } = locationData;
    
    const location = await Location.create({
      name,
      short_code: shortCode,
      warehouse_id: warehouseId,
      description
    });
    
    return location.dataValues;
  }

  /**
   * Update location
   */
  static async updateLocation(locationId, locationData) {
    const updateFields = {};
    
    // Map camelCase to snake_case for database fields
    if (locationData.name !== undefined) updateFields.name = locationData.name;
    if (locationData.shortCode !== undefined) updateFields.short_code = locationData.shortCode;
    if (locationData.warehouseId !== undefined) updateFields.warehouse_id = locationData.warehouseId;
    if (locationData.description !== undefined) updateFields.description = locationData.description;

    if (Object.keys(updateFields).length === 0) {
      throw new Error('No fields to update');
    }

    const [affectedRows] = await Location.update(updateFields, {
      where: { location_id: locationId }
    });

    if (affectedRows === 0) {
      return null;
    }

    // Return updated location
    return await this.getLocationById(locationId);
  }

  /**
   * Delete location
   */
  static async deleteLocation(locationId) {
    const location = await Location.findOne({ where: { location_id: locationId } });
    if (!location) return null;
    
    await Location.destroy({ where: { location_id: locationId } });
    return location.dataValues;
  }
}

// Export the Sequelize models as well for direct use if needed
export { Warehouse, Location };