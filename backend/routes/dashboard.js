import express from 'express';
import { pool, sequelize } from '../db.js';
import { QueryTypes } from 'sequelize';

const router = express.Router();

// Get dashboard overview data
router.get('/', async (req, res) => {
  try {
    // Get total products
    const productsQuery = 'SELECT COUNT(*) as total FROM products';
    const productsResult = await sequelize.query(productsQuery, { type: QueryTypes.SELECT });
    const totalProducts = parseInt(productsResult[0].total);

    // Get low stock alerts
    const lowStockQuery = `
      SELECT COUNT(*) as total 
      FROM stock_levels 
      WHERE quantity_on_hand <= min_stock_level AND min_stock_level > 0
    `;
    const lowStockResult = await sequelize.query(lowStockQuery, { type: QueryTypes.SELECT });
    const lowStockAlerts = parseInt(lowStockResult[0].total);

    // Get out of stock items
    const outOfStockResult = await sequelize.query(`
      SELECT COUNT(*) as total 
      FROM stock_levels 
      WHERE quantity_on_hand = 0
    `, { type: QueryTypes.SELECT });
    const outOfStockCount = parseInt(outOfStockResult[0].total);

    // Get receipt statistics
    const receiptsQuery = `
      SELECT 
        COUNT(*) as total_receipts,
        COUNT(CASE WHEN status IN ('draft', 'confirmed') THEN 1 END) as pending_receipts,
        COUNT(CASE WHEN schedule_date < CURRENT_DATE AND status != 'done' THEN 1 END) as late_receipts,
        COUNT(CASE WHEN status = 'done' THEN 1 END) as completed_receipts
      FROM receipts
    `;
    const receiptsResult = await sequelize.query(receiptsQuery, { type: QueryTypes.SELECT });
    const receiptStats = receiptsResult[0];

    // Get delivery statistics  
    const deliveriesQuery = `
      SELECT 
        COUNT(*) as total_deliveries,
        COUNT(CASE WHEN status IN ('draft', 'confirmed') THEN 1 END) as pending_deliveries,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as waiting_deliveries,
        COUNT(CASE WHEN status = 'done' THEN 1 END) as completed_deliveries
      FROM delivery_orders
    `;
    const deliveriesResult = await sequelize.query(deliveriesQuery, { type: QueryTypes.SELECT });
    const deliveryStats = deliveriesResult[0];

    // Get warehouse count
    const warehousesQuery = 'SELECT COUNT(*) as total FROM warehouses';
    const warehousesResult = await sequelize.query(warehousesQuery, { type: QueryTypes.SELECT });
    const totalWarehouses = parseInt(warehousesResult[0].total);

    res.json({
      totalProducts,
      lowStockAlerts,
      outOfStockCount,
      totalWarehouses,
      // Receipt data
      totalReceipts: parseInt(receiptStats.total_receipts || 0),
      pendingReceipts: parseInt(receiptStats.pending_receipts || 0),
      lateReceipts: parseInt(receiptStats.late_receipts || 0),
      completedReceipts: parseInt(receiptStats.completed_receipts || 0),
      // Delivery data
      totalDeliveries: parseInt(deliveryStats.total_deliveries || 0),
      pendingDeliveries: parseInt(deliveryStats.pending_deliveries || 0),
      waitingDeliveries: parseInt(deliveryStats.waiting_deliveries || 0),
      completedDeliveries: parseInt(deliveryStats.completed_deliveries || 0)
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
    const productsResult = await sequelize.query(productsQuery, { type: QueryTypes.SELECT });
    const totalProducts = parseInt(productsResult[0].total);

    // Get low stock alerts
    const lowStockQuery = `
      SELECT COUNT(*) as total 
      FROM stock_levels 
      WHERE quantity_on_hand <= min_stock_level AND min_stock_level > 0
    `;
    const lowStockResult = await sequelize.query(lowStockQuery, { type: QueryTypes.SELECT });
    const lowStockAlerts = parseInt(lowStockResult[0].total);

    // Calculate total inventory value
    const valueResult = await sequelize.query(`
      SELECT COALESCE(SUM(sl.quantity_on_hand * p.per_unit_cost), 0) as total_value
      FROM stock_levels sl
      JOIN products p ON sl.product_id = p.product_id
    `, { type: QueryTypes.SELECT });
    const totalValue = parseFloat(valueResult[0].total_value || 0);

    // Get total locations
    const locationsResult = await sequelize.query(
      'SELECT COUNT(*) as total FROM locations',
      { type: QueryTypes.SELECT }
    );
    const totalLocations = parseInt(locationsResult[0].total);

    // Get recent movements
    const recentMovements = await sequelize.query(`
      SELECT mh.transaction_ref, mh.transaction_type, mh.quantity_change,
             mh.move_timestamp, p.name as product_name, p.sku_code,
             tl.name as location_name, u.first_name || ' ' || u.last_name as user_name
      FROM move_history mh
      JOIN products p ON mh.product_id = p.product_id
      LEFT JOIN locations tl ON mh.to_location_id = tl.location_id
      JOIN users u ON mh.responsible_user_id = u.user_id
      ORDER BY mh.move_timestamp DESC
      LIMIT 10
    `, { type: QueryTypes.SELECT });

    res.json({
      totalProducts,
      lowStockAlerts,
      totalValue: totalValue.toFixed(2),
      totalLocations,
      recentMovements: recentMovements
    });
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get stock summary by warehouse
router.get('/stock-summary', async (req, res) => {
  try {
    const stockSummary = await sequelize.query(`
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
    `, { type: QueryTypes.SELECT });
    
    res.json(stockSummary);
  } catch (error) {
    console.error('Error fetching stock summary:', error);
    res.status(500).json({ error: 'Failed to fetch stock summary' });
  }
});

export default router;