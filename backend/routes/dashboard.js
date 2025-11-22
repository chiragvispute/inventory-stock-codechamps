import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// Get dashboard overview data
router.get('/', async (req, res) => {
  try {
    // Get total products
    const productsQuery = 'SELECT COUNT(*) as total FROM products';
    const productsResult = await pool.query(productsQuery);
    const totalProducts = parseInt(productsResult.rows[0].total);

    // Get low stock alerts
    const lowStockQuery = `
      SELECT COUNT(*) as total 
      FROM stock_levels 
      WHERE quantity_on_hand <= min_stock_level AND min_stock_level > 0
    `;
    const lowStockResult = await pool.query(lowStockQuery);
    const lowStockAlerts = parseInt(lowStockResult.rows[0].total);

    // Get out of stock items
    const outOfStockQuery = `
      SELECT COUNT(*) as total 
      FROM stock_levels 
      WHERE quantity_on_hand = 0
    `;
    const outOfStockResult = await pool.query(outOfStockQuery);
    const outOfStock = parseInt(outOfStockResult.rows[0].total);

    // Get pending receipts
    const receiptsQuery = `
      SELECT 
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as to_receive,
        COUNT(CASE WHEN status = 'confirmed' AND schedule_date < CURRENT_DATE THEN 1 END) as late,
        COUNT(*) as operations
      FROM receipts
      WHERE status IN ('draft', 'confirmed')
    `;
    const receiptsResult = await pool.query(receiptsQuery);
    const receipts = receiptsResult.rows[0];

    // Get pending deliveries
    const deliveriesQuery = `
      SELECT 
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as to_deliver,
        COUNT(CASE WHEN status = 'draft' THEN 1 END) as waiting,
        COUNT(*) as operations
      FROM delivery_orders
      WHERE status IN ('draft', 'confirmed')
    `;
    const deliveriesResult = await pool.query(deliveriesQuery);
    const deliveries = deliveriesResult.rows[0];

    res.json({
      receipts: {
        toReceive: parseInt(receipts.to_receive || 0),
        late: parseInt(receipts.late || 0),
        operations: parseInt(receipts.operations || 0)
      },
      deliveries: {
        toDeliver: parseInt(deliveries.to_deliver || 0),
        waiting: parseInt(deliveries.waiting || 0),
        operations: parseInt(deliveries.operations || 0)
      },
      stock: {
        totalItems: totalProducts,
        lowStock: lowStockAlerts,
        outOfStock: outOfStock
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get dashboard overview data with more details
router.get('/overview', async (req, res) => {
  try {
    // Get total products
    const productsQuery = 'SELECT COUNT(*) as total FROM products';
    const productsResult = await pool.query(productsQuery);
    const totalProducts = parseInt(productsResult.rows[0].total);

    // Get low stock alerts
    const lowStockQuery = `
      SELECT COUNT(*) as total 
      FROM stock_levels 
      WHERE quantity_on_hand <= min_stock_level AND min_stock_level > 0
    `;
    const lowStockResult = await pool.query(lowStockQuery);
    const lowStockAlerts = parseInt(lowStockResult.rows[0].total);

    // Calculate total inventory value
    const valueQuery = `
      SELECT COALESCE(SUM(sl.quantity_on_hand * p.per_unit_cost), 0) as total_value
      FROM stock_levels sl
      JOIN products p ON sl.product_id = p.product_id
    `;
    const valueResult = await pool.query(valueQuery);
    const totalValue = parseFloat(valueResult.rows[0].total_value || 0);

    // Get total locations
    const locationsQuery = 'SELECT COUNT(*) as total FROM locations';
    const locationsResult = await pool.query(locationsQuery);
    const totalLocations = parseInt(locationsResult.rows[0].total);

    // Get recent movements
    const movementsQuery = `
      SELECT mh.transaction_ref, mh.transaction_type, mh.quantity_change,
             mh.move_timestamp, p.name as product_name, p.sku_code,
             tl.name as location_name, u.first_name || ' ' || u.last_name as user_name
      FROM move_history mh
      JOIN products p ON mh.product_id = p.product_id
      LEFT JOIN locations tl ON mh.to_location_id = tl.location_id
      JOIN users u ON mh.responsible_user_id = u.user_id
      ORDER BY mh.move_timestamp DESC
      LIMIT 10
    `;
    const movementsResult = await pool.query(movementsQuery);

    res.json({
      totalProducts,
      lowStockAlerts,
      totalValue: totalValue.toFixed(2),
      totalLocations,
      recentMovements: movementsResult.rows
    });
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get stock summary by warehouse
router.get('/stock-summary', async (req, res) => {
  try {
    const query = `
      SELECT w.warehouse_id, w.name as warehouse_name, w.short_code,
             COUNT(DISTINCT sl.product_id) as unique_products,
             COUNT(*) as total_stock_entries,
             COALESCE(SUM(sl.quantity_on_hand), 0) as total_quantity,
             COALESCE(SUM(sl.quantity_on_hand * p.per_unit_cost), 0) as total_value,
             SUM(CASE WHEN sl.quantity_on_hand <= sl.min_stock_level AND sl.min_stock_level > 0 THEN 1 ELSE 0 END) as low_stock_items
      FROM warehouses w
      LEFT JOIN locations l ON w.warehouse_id = l.warehouse_id
      LEFT JOIN stock_levels sl ON l.location_id = sl.location_id
      LEFT JOIN products p ON sl.product_id = p.product_id
      GROUP BY w.warehouse_id, w.name, w.short_code
      ORDER BY w.name
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching stock summary:', error);
    res.status(500).json({ error: 'Failed to fetch stock summary' });
  }
});

export default router;