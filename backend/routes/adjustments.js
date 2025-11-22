import express from 'express';
import { pool, sequelize } from '../db.js';
import { QueryTypes } from 'sequelize';

const router = express.Router();

// Get all stock adjustments
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT sa.adjustment_id, sa.adjustment_date, sa.old_quantity, 
             sa.new_quantity, sa.difference, sa.reason, sa.created_at,
             p.name as product_name, p.sku_code, p.unit_of_measure,
             l.name as location_name, w.name as warehouse_name,
             u.first_name || ' ' || u.last_name as responsible_user
      FROM stock_adjustments sa
      JOIN products p ON sa.product_id = p.product_id
      JOIN locations l ON sa.location_id = l.location_id
      JOIN warehouses w ON l.warehouse_id = w.warehouse_id
      JOIN users u ON sa.responsible_user_id = u.user_id
      ORDER BY sa.created_at DESC
    `;
    const result = await sequelize.query(query, { type: QueryTypes.SELECT });
    res.json(result);
  } catch (error) {
    console.error('Error fetching adjustments:', error);
    res.status(500).json({ error: 'Failed to fetch adjustments' });
  }
});

// Get adjustment by ID
router.get('/:id', async (req, res) => {
  try {
    const adjustmentId = parseInt(req.params.id);
    
    const query = `
      SELECT sa.adjustment_id, sa.adjustment_date, sa.old_quantity, 
             sa.new_quantity, sa.difference, sa.reason, sa.created_at,
             p.product_id, p.name as product_name, p.sku_code, p.unit_of_measure,
             l.location_id, l.name as location_name, w.name as warehouse_name,
             u.user_id, u.first_name || ' ' || u.last_name as responsible_user
      FROM stock_adjustments sa
      JOIN products p ON sa.product_id = p.product_id
      JOIN locations l ON sa.location_id = l.location_id
      JOIN warehouses w ON l.warehouse_id = w.warehouse_id
      JOIN users u ON sa.responsible_user_id = u.user_id
      WHERE sa.adjustment_id = $1
    `;
    
    const result = await sequelize.query(query, { replacements: [adjustmentId], type: QueryTypes.SELECT });
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Adjustment not found' });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error('Error fetching adjustment:', error);
    res.status(500).json({ error: 'Failed to fetch adjustment' });
  }
});

// Create new adjustment
router.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      adjustmentDate,
      productId,
      locationId,
      oldQuantity,
      newQuantity,
      reason
    } = req.body;
    
    // Get responsible user ID from authenticated user
    const responsibleUserId = req.user?.userId;
    if (!productId || !locationId || oldQuantity === undefined || 
        newQuantity === undefined || !reason || !responsibleUserId) {
      return res.status(400).json({ 
        error: 'Missing required fields: productId, locationId, oldQuantity, newQuantity, reason. User must be authenticated.' 
      });
    }
    
    // Create the adjustment record
    const adjustmentQuery = `
      INSERT INTO stock_adjustments (adjustment_date, product_id, location_id, 
                                   old_quantity, new_quantity, reason, responsible_user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING adjustment_id, adjustment_date, difference, created_at
    `;
    
    const adjustmentResult = await client.query(adjustmentQuery, [
      adjustmentDate || new Date().toISOString().split('T')[0],
      productId, locationId, oldQuantity, newQuantity, reason, responsibleUserId
    ]);
    
    const newAdjustment = adjustmentResult.rows[0];
    
    // Update the actual stock level
    const quantityChange = newQuantity - oldQuantity;
    
    const stockUpdateQuery = `
      INSERT INTO stock_levels (product_id, location_id, quantity_on_hand, quantity_free_to_use)
      VALUES ($1, $2, $3, $3)
      ON CONFLICT (product_id, location_id)
      DO UPDATE SET 
        quantity_on_hand = stock_levels.quantity_on_hand + $4,
        quantity_free_to_use = stock_levels.quantity_free_to_use + $4,
        last_updated_at = CURRENT_TIMESTAMP
    `;
    
    await client.query(stockUpdateQuery, [productId, locationId, newQuantity, quantityChange]);
    
    // Create move history record
    const moveHistoryQuery = `
      INSERT INTO move_history (transaction_ref, transaction_type, product_id, 
                               to_location_id, quantity_change, unit_of_measure, 
                               responsible_user_id, description)
      SELECT $1, 'adjustment', $2, $3, $4, p.unit_of_measure, $5, $6
      FROM products p
      WHERE p.product_id = $2
    `;
    
    await client.query(moveHistoryQuery, [
      `ADJ-${newAdjustment.adjustment_id}`,
      productId,
      locationId,
      quantityChange,
      responsibleUserId,
      `Stock adjustment: ${reason}`
    ]);
    
    await client.query('COMMIT');
    res.status(201).json(newAdjustment);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating adjustment:', error);
    if (error.code === '23503') {
      res.status(400).json({ error: 'Invalid product, location, or user ID' });
    } else {
      res.status(500).json({ error: 'Failed to create adjustment' });
    }
  } finally {
    client.release();
  }
});

// Delete adjustment
router.delete('/:id', async (req, res) => {
  try {
    const adjustmentId = parseInt(req.params.id);
    
    const query = `
      DELETE FROM stock_adjustments 
      WHERE adjustment_id = $1 
      RETURNING adjustment_id, reason
    `;
    
    const result = await sequelize.query(query, { replacements: [adjustmentId], type: QueryTypes.SELECT });
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Adjustment not found' });
    }
    
    res.json({ message: 'Adjustment deleted successfully', adjustment: result[0] });
  } catch (error) {
    console.error('Error deleting adjustment:', error);
    res.status(500).json({ error: 'Failed to delete adjustment' });
  }
});

export default router;