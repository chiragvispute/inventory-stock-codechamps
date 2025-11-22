import { pool } from '../db.js';

/**
 * Stock Level model for handling stock operations
 */
export class StockLevelModel {
  
  /**
   * Get all stock levels with product and location details
   */
  static async getAllStockLevels() {
    const query = `
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
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Get stock level by product and location
   */
  static async getStockLevel(productId, locationId) {
    const query = `
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
    `;
    const result = await pool.query(query, [productId, locationId]);
    return result.rows[0];
  }

  /**
   * Get stock levels by product
   */
  static async getStockLevelsByProduct(productId) {
    const query = `
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
    `;
    const result = await pool.query(query, [productId]);
    return result.rows;
  }

  /**
   * Get stock levels by location
   */
  static async getStockLevelsByLocation(locationId) {
    const query = `
      SELECT sl.product_id, sl.location_id, sl.quantity_on_hand, 
             sl.quantity_free_to_use, sl.min_stock_level, sl.max_stock_level, 
             sl.last_updated_at,
             p.name as product_name, p.sku_code, p.unit_of_measure
      FROM stock_levels sl
      JOIN products p ON sl.product_id = p.product_id
      WHERE sl.location_id = $1
      ORDER BY p.name
    `;
    const result = await pool.query(query, [locationId]);
    return result.rows;
  }

  /**
   * Create or update stock level
   */
  static async upsertStockLevel(stockData) {
    const { productId, locationId, quantityOnHand, quantityFreeToUse, minStockLevel, maxStockLevel } = stockData;
    
    const query = `
      INSERT INTO stock_levels (product_id, location_id, quantity_on_hand, quantity_free_to_use, min_stock_level, max_stock_level)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (product_id, location_id)
      DO UPDATE SET 
        quantity_on_hand = EXCLUDED.quantity_on_hand,
        quantity_free_to_use = EXCLUDED.quantity_free_to_use,
        min_stock_level = EXCLUDED.min_stock_level,
        max_stock_level = EXCLUDED.max_stock_level,
        last_updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;
    
    const result = await pool.query(query, [productId, locationId, quantityOnHand || 0, quantityFreeToUse || 0, minStockLevel || 0, maxStockLevel]);
    return result.rows[0];
  }

  /**
   * Update stock quantity (for movements)
   */
  static async updateStockQuantity(productId, locationId, quantityChange) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Check current stock level
      const checkQuery = `
        SELECT quantity_on_hand, quantity_free_to_use 
        FROM stock_levels 
        WHERE product_id = $1 AND location_id = $2
      `;
      const currentStock = await client.query(checkQuery, [productId, locationId]);
      
      if (currentStock.rows.length === 0) {
        // Create new stock level if it doesn't exist
        const createQuery = `
          INSERT INTO stock_levels (product_id, location_id, quantity_on_hand, quantity_free_to_use)
          VALUES ($1, $2, $3, $3)
          RETURNING *
        `;
        const result = await client.query(createQuery, [productId, locationId, Math.max(0, quantityChange)]);
        await client.query('COMMIT');
        return result.rows[0];
      } else {
        // Update existing stock level
        const newQuantityOnHand = Math.max(0, currentStock.rows[0].quantity_on_hand + quantityChange);
        const newQuantityFreeToUse = Math.max(0, currentStock.rows[0].quantity_free_to_use + quantityChange);
        
        const updateQuery = `
          UPDATE stock_levels 
          SET quantity_on_hand = $1, 
              quantity_free_to_use = $2, 
              last_updated_at = CURRENT_TIMESTAMP
          WHERE product_id = $3 AND location_id = $4
          RETURNING *
        `;
        
        const result = await client.query(updateQuery, [newQuantityOnHand, newQuantityFreeToUse, productId, locationId]);
        await client.query('COMMIT');
        return result.rows[0];
      }
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Get low stock alerts
   */
  static async getLowStockAlerts() {
    const query = `
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
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Get stock summary by warehouse
   */
  static async getStockSummaryByWarehouse() {
    const query = `
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
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Delete stock level
   */
  static async deleteStockLevel(productId, locationId) {
    const query = 'DELETE FROM stock_levels WHERE product_id = $1 AND location_id = $2 RETURNING *';
    const result = await pool.query(query, [productId, locationId]);
    return result.rows[0];
  }
}