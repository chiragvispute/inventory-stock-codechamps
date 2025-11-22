import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

// Define StockLevel model with Sequelize
const StockLevel = sequelize.define('StockLevel', {
  product_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  location_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
  },
  quantity_on_hand: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  quantity_free_to_use: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
  min_stock_level: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  max_stock_level: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  last_updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'stock_levels',
  timestamps: false, // Using custom last_updated_at field
});

/**
 * Stock Level model for handling stock operations
 */
export class StockLevelModel {
  
  /**
   * Get all stock levels with product and location details
   */
  static async getAllStockLevels() {
    const stockLevels = await sequelize.query(`
      SELECT sl.product_id, sl.location_id, sl.quantity_on_hand, 
             sl.quantity_free_to_use, sl.min_stock_level, sl.max_stock_level, 
             sl.last_updated_at,
             p.name as product_name, p.sku_code, p.unit_of_measure,
             l.name as location_name, l.short_code as location_code,
             w.name as warehouse_name, w.short_code as warehouse_code
      FROM stock_levels sl
      JOIN products p ON sl.product_id = p.product_id
      JOIN locations l ON sl.location_id = l.location_id
      JOIN warehouses w ON l.warehouse_id = w.warehouse_id
      ORDER BY p.name, l.name
    `, { type: sequelize.QueryTypes.SELECT });
    return stockLevels;
  }

  /**
   * Get stock level by product and location
   */
  static async getStockLevel(productId, locationId) {
    const stockLevel = await sequelize.query(`
      SELECT sl.product_id, sl.location_id, sl.quantity_on_hand, 
             sl.quantity_free_to_use, sl.min_stock_level, sl.max_stock_level, 
             sl.last_updated_at,
             p.name as product_name, p.sku_code, p.unit_of_measure,
             l.name as location_name, l.short_code as location_code,
             w.name as warehouse_name, w.short_code as warehouse_code
      FROM stock_levels sl
      JOIN products p ON sl.product_id = p.product_id
      JOIN locations l ON sl.location_id = l.location_id
      JOIN warehouses w ON l.warehouse_id = w.warehouse_id
      WHERE sl.product_id = $1 AND sl.location_id = $2
    `, { 
      replacements: [productId, locationId], 
      type: sequelize.QueryTypes.SELECT 
    });
    return stockLevel[0];
  }

  /**
   * Get stock levels by product
   */
  static async getStockLevelsByProduct(productId) {
    const stockLevels = await sequelize.query(`
      SELECT sl.product_id, sl.location_id, sl.quantity_on_hand, 
             sl.quantity_free_to_use, sl.min_stock_level, sl.max_stock_level, 
             sl.last_updated_at,
             l.name as location_name, l.short_code as location_code,
             w.name as warehouse_name, w.short_code as warehouse_code
      FROM stock_levels sl
      JOIN locations l ON sl.location_id = l.location_id
      JOIN warehouses w ON l.warehouse_id = w.warehouse_id
      WHERE sl.product_id = $1
      ORDER BY l.name
    `, { 
      replacements: [productId], 
      type: sequelize.QueryTypes.SELECT 
    });
    return stockLevels;
  }

  /**
   * Get stock levels by location
   */
  static async getStockLevelsByLocation(locationId) {
    const stockLevels = await sequelize.query(`
      SELECT sl.product_id, sl.location_id, sl.quantity_on_hand, 
             sl.quantity_free_to_use, sl.min_stock_level, sl.max_stock_level, 
             sl.last_updated_at,
             p.name as product_name, p.sku_code, p.unit_of_measure
      FROM stock_levels sl
      JOIN products p ON sl.product_id = p.product_id
      WHERE sl.location_id = $1
      ORDER BY p.name
    `, { 
      replacements: [locationId], 
      type: sequelize.QueryTypes.SELECT 
    });
    return stockLevels;
  }

  /**
   * Create or update stock level
   */
  static async upsertStockLevel(stockData) {
    const { productId, locationId, quantityOnHand, quantityFreeToUse, minStockLevel, maxStockLevel } = stockData;
    
    const [stockLevel, created] = await StockLevel.findOrCreate({
      where: { 
        product_id: productId, 
        location_id: locationId 
      },
      defaults: {
        product_id: productId,
        location_id: locationId,
        quantity_on_hand: quantityOnHand || 0,
        quantity_free_to_use: quantityFreeToUse || 0,
        min_stock_level: minStockLevel || 0,
        max_stock_level: maxStockLevel,
        last_updated_at: new Date()
      }
    });

    if (!created) {
      // Update existing record
      await stockLevel.update({
        quantity_on_hand: quantityOnHand || stockLevel.quantity_on_hand,
        quantity_free_to_use: quantityFreeToUse || stockLevel.quantity_free_to_use,
        min_stock_level: minStockLevel !== undefined ? minStockLevel : stockLevel.min_stock_level,
        max_stock_level: maxStockLevel !== undefined ? maxStockLevel : stockLevel.max_stock_level,
        last_updated_at: new Date()
      });
    }

    return stockLevel.dataValues;
  }

  /**
   * Update stock quantity (for movements)
   */
  static async updateStockQuantity(productId, locationId, quantityChange) {
    const transaction = await sequelize.transaction();
    
    try {
      // Check current stock level
      let stockLevel = await StockLevel.findOne({
        where: { product_id: productId, location_id: locationId },
        transaction
      });
      
      if (!stockLevel) {
        // Create new stock level if it doesn't exist
        stockLevel = await StockLevel.create({
          product_id: productId,
          location_id: locationId,
          quantity_on_hand: Math.max(0, quantityChange),
          quantity_free_to_use: Math.max(0, quantityChange),
          min_stock_level: 0,
          last_updated_at: new Date()
        }, { transaction });
      } else {
        // Update existing stock level
        const newQuantityOnHand = Math.max(0, stockLevel.quantity_on_hand + quantityChange);
        const newQuantityFreeToUse = Math.max(0, stockLevel.quantity_free_to_use + quantityChange);
        
        await stockLevel.update({
          quantity_on_hand: newQuantityOnHand,
          quantity_free_to_use: newQuantityFreeToUse,
          last_updated_at: new Date()
        }, { transaction });
      }
      
      await transaction.commit();
      return stockLevel.dataValues;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  /**
   * Get low stock alerts
   */
  static async getLowStockAlerts() {
    const alerts = await sequelize.query(`
      SELECT sl.product_id, sl.location_id, sl.quantity_on_hand, 
             sl.quantity_free_to_use, sl.min_stock_level, sl.max_stock_level,
             p.name as product_name, p.sku_code,
             l.name as location_name, l.short_code as location_code,
             w.name as warehouse_name
      FROM stock_levels sl
      JOIN products p ON sl.product_id = p.product_id
      JOIN locations l ON sl.location_id = l.location_id
      JOIN warehouses w ON l.warehouse_id = w.warehouse_id
      WHERE sl.quantity_on_hand <= sl.min_stock_level AND sl.min_stock_level > 0
      ORDER BY (sl.quantity_on_hand / NULLIF(sl.min_stock_level, 0)), p.name
    `, { type: sequelize.QueryTypes.SELECT });
    return alerts;
  }

  /**
   * Get stock summary by warehouse
   */
  static async getStockSummaryByWarehouse() {
    const summary = await sequelize.query(`
      SELECT w.warehouse_id, w.name as warehouse_name, w.short_code,
             COUNT(DISTINCT sl.product_id) as unique_products,
             COUNT(*) as total_stock_entries,
             SUM(sl.quantity_on_hand) as total_quantity,
             SUM(CASE WHEN sl.quantity_on_hand <= sl.min_stock_level AND sl.min_stock_level > 0 THEN 1 ELSE 0 END) as low_stock_items
      FROM warehouses w
      LEFT JOIN locations l ON w.warehouse_id = l.warehouse_id
      LEFT JOIN stock_levels sl ON l.location_id = sl.location_id
      GROUP BY w.warehouse_id, w.name, w.short_code
      ORDER BY w.name
    `, { type: sequelize.QueryTypes.SELECT });
    return summary;
  }

  /**
   * Delete stock level
   */
  static async deleteStockLevel(productId, locationId) {
    const stockLevel = await StockLevel.findOne({
      where: { product_id: productId, location_id: locationId }
    });
    
    if (!stockLevel) return null;
    
    await StockLevel.destroy({
      where: { product_id: productId, location_id: locationId }
    });
    
    return stockLevel.dataValues;
  }
}

// Export the Sequelize model as well for direct use if needed
export { StockLevel };