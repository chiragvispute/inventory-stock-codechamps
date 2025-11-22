import express from 'express';
import { pool, sequelize } from '../db.js';

const router = express.Router();

// Get all internal transfers
router.get('/', async (req, res) => {
  try {
    const transfers = await sequelize.query(`
      SELECT it.transfer_id, it.reference, it.quantity, it.status, 
             it.transfer_date, it.created_at,
             p.name as product_name, p.sku_code,
             fl.name as from_location_name, fw.name as from_warehouse_name,
             tl.name as to_location_name, tw.name as to_warehouse_name,
             u.first_name || ' ' || u.last_name as responsible_user
      FROM internal_transfers it
      JOIN products p ON it.product_id = p.product_id
      JOIN locations fl ON it.from_location_id = fl.location_id
      JOIN warehouses fw ON fl.warehouse_id = fw.warehouse_id
      JOIN locations tl ON it.to_location_id = tl.location_id
      JOIN warehouses tw ON tl.warehouse_id = tw.warehouse_id
      JOIN users u ON it.responsible_user_id = u.user_id
      ORDER BY it.created_at DESC
    `, { type: sequelize.QueryTypes.SELECT });
    res.json(transfers);
  } catch (error) {
    console.error('Error fetching transfers:', error);
    res.status(500).json({ error: 'Failed to fetch transfers' });
  }
});

// Get transfer by ID
router.get('/:id', async (req, res) => {
  try {
    const transferId = parseInt(req.params.id);
    
    const query = `
      SELECT it.transfer_id, it.reference, it.quantity, it.status, 
             it.transfer_date, it.created_at, it.updated_at,
             p.product_id, p.name as product_name, p.sku_code, p.unit_of_measure,
             fl.location_id as from_location_id, fl.name as from_location_name, 
             fw.name as from_warehouse_name,
             tl.location_id as to_location_id, tl.name as to_location_name, 
             tw.name as to_warehouse_name,
             u.user_id, u.first_name || ' ' || u.last_name as responsible_user
      FROM internal_transfers it
      JOIN products p ON it.product_id = p.product_id
      JOIN locations fl ON it.from_location_id = fl.location_id
      JOIN warehouses fw ON fl.warehouse_id = fw.warehouse_id
      JOIN locations tl ON it.to_location_id = tl.location_id
      JOIN warehouses tw ON tl.warehouse_id = tw.warehouse_id
      JOIN users u ON it.responsible_user_id = u.user_id
      WHERE it.transfer_id = $1
    `;
    
    const result = await sequelize.query(query, { replacements: [transferId], type: QueryTypes.SELECT });
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Transfer not found' });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error('Error fetching transfer:', error);
    res.status(500).json({ error: 'Failed to fetch transfer' });
  }
});

// Create new transfer
router.post('/', async (req, res) => {
  try {
    const {
      reference,
      fromLocationId,
      toLocationId,
      productId,
      quantity,
      responsibleUserId,
      transferDate
    } = req.body;
    
    // Validate required fields
    if (!reference || !fromLocationId || !toLocationId || !productId || !quantity || !responsibleUserId) {
      return res.status(400).json({ 
        error: 'Missing required fields: reference, fromLocationId, toLocationId, productId, quantity, responsibleUserId' 
      });
    }
    
    const query = `
      INSERT INTO internal_transfers (reference, from_location_id, to_location_id, 
                                    product_id, quantity, responsible_user_id, transfer_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING transfer_id, reference, status, created_at
    `;
    
    const result = await sequelize.query(query, { 
      replacements: [
        reference, fromLocationId, toLocationId, productId, quantity,
        responsibleUserId, transferDate || new Date().toISOString().split('T')[0]
      ], 
      type: QueryTypes.SELECT 
    });
    
    res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating transfer:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Transfer with this reference already exists' });
    } else if (error.code === '23503') {
      res.status(400).json({ error: 'Invalid location, product, or user ID' });
    } else {
      res.status(500).json({ error: 'Failed to create transfer' });
    }
  }
});

// Update transfer status
router.patch('/:id/status', async (req, res) => {
  try {
    const transferId = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const query = `
      UPDATE internal_transfers 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE transfer_id = $2
      RETURNING transfer_id, reference, status, updated_at
    `;
    
    const result = await sequelize.query(query, { replacements: [status, transferId], type: QueryTypes.SELECT });
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Transfer not found' });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating transfer status:', error);
    res.status(500).json({ error: 'Failed to update transfer status' });
  }
});

// Delete transfer
router.delete('/:id', async (req, res) => {
  try {
    const transferId = parseInt(req.params.id);
    
    const query = `
      DELETE FROM internal_transfers 
      WHERE transfer_id = $1 
      RETURNING transfer_id, reference
    `;
    
    const result = await sequelize.query(query, { replacements: [transferId], type: QueryTypes.SELECT });
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Transfer not found' });
    }
    
    res.json({ message: 'Transfer deleted successfully', transfer: result[0] });
  } catch (error) {
    console.error('Error deleting transfer:', error);
    res.status(500).json({ error: 'Failed to delete transfer' });
  }
});

export default router;