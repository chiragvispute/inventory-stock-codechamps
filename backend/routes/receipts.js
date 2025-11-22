import express from 'express';
import { pool, sequelize } from '../db.js';

const router = express.Router();

// Get all receipts
router.get('/', async (req, res) => {
  try {
    const receipts = await sequelize.query(`
      SELECT r.receipt_id, r.reference, r.schedule_date, r.operation_type, 
             r.status, r.from_location, r.created_at, r.validated_at,
             s.name as supplier_name,
             u.first_name || ' ' || u.last_name as responsible_user,
             l.name as to_location_name, w.name as warehouse_name
      FROM receipts r
      LEFT JOIN suppliers s ON r.supplier_id = s.supplier_id
      LEFT JOIN users u ON r.responsible_user_id = u.user_id
      LEFT JOIN locations l ON r.to_location_id = l.location_id
      LEFT JOIN warehouses w ON l.warehouse_id = w.warehouse_id
      ORDER BY r.created_at DESC
    `, { type: sequelize.QueryTypes.SELECT });
    res.json(receipts);
  } catch (error) {
    console.error('Error fetching receipts:', error);
    res.status(500).json({ error: 'Failed to fetch receipts' });
  }
});

// Get receipt by ID with items
router.get('/:id', async (req, res) => {
  try {
    const receiptId = parseInt(req.params.id);
    
    // Get receipt header
    const receiptQuery = `
      SELECT r.receipt_id, r.reference, r.schedule_date, r.operation_type, 
             r.status, r.from_location, r.created_at, r.validated_at,
             s.name as supplier_name, s.contact_person as supplier_contact,
             u.first_name || ' ' || u.last_name as responsible_user,
             l.name as to_location_name, w.name as warehouse_name
      FROM receipts r
      LEFT JOIN suppliers s ON r.supplier_id = s.supplier_id
      LEFT JOIN users u ON r.responsible_user_id = u.user_id
      LEFT JOIN locations l ON r.to_location_id = l.location_id
      LEFT JOIN warehouses w ON l.warehouse_id = w.warehouse_id
      WHERE r.receipt_id = $1
    `;
    
    const receiptResult = await sequelize.query(receiptQuery, { replacements: [receiptId], type: QueryTypes.SELECT });
    
    if (receiptResult.length === 0) {
      return res.status(404).json({ error: 'Receipt not found' });
    }
    
    const receipt = receiptResult[0];
    
    // Get receipt items
    const itemsQuery = `
      SELECT ri.receipt_item_id, ri.quantity_expected, ri.quantity_received,
             ri.unit_cost_at_receipt,
             p.product_id, p.name as product_name, p.sku_code, p.unit_of_measure
      FROM receipt_items ri
      JOIN products p ON ri.product_id = p.product_id
      WHERE ri.receipt_id = $1
      ORDER BY p.name
    `;
    
    const itemsResult = await sequelize.query(itemsQuery, { replacements: [receiptId], type: QueryTypes.SELECT });
    receipt.items = itemsResult;
    
    res.json(receipt);
  } catch (error) {
    console.error('Error fetching receipt:', error);
    res.status(500).json({ error: 'Failed to fetch receipt' });
  }
});

// Create new receipt
router.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      reference,
      scheduleDate,
      operationType,
      supplierId,
      responsibleUserId,
      fromLocation,
      toLocationId,
      items
    } = req.body;
    
    // Validate required fields
    if (!reference || !scheduleDate || !responsibleUserId || !toLocationId) {
      return res.status(400).json({ 
        error: 'Missing required fields: reference, scheduleDate, responsibleUserId, toLocationId' 
      });
    }
    
    // Create receipt header
    const receiptQuery = `
      INSERT INTO receipts (reference, schedule_date, operation_type, supplier_id, 
                           responsible_user_id, from_location, to_location_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING receipt_id, reference, created_at
    `;
    
    const receiptResult = await client.query(receiptQuery, [
      reference, scheduleDate, operationType || 'purchase', supplierId,
      responsibleUserId, fromLocation, toLocationId
    ]);
    
    const newReceipt = receiptResult[0];
    
    // Create receipt items if provided
    if (items && items.length > 0) {
      for (const item of items) {
        const itemQuery = `
          INSERT INTO receipt_items (receipt_id, product_id, quantity_expected, 
                                   quantity_received, unit_cost_at_receipt)
          VALUES ($1, $2, $3, $4, $5)
        `;
        
        await client.query(itemQuery, [
          newReceipt.receipt_id,
          item.productId,
          item.quantityExpected,
          item.quantityReceived || 0,
          item.unitCost || 0
        ]);
      }
    }
    
    await client.query('COMMIT');
    res.status(201).json(newReceipt);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating receipt:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Receipt with this reference already exists' });
    } else if (error.code === '23503') {
      res.status(400).json({ error: 'Invalid supplier, user, or location ID' });
    } else {
      res.status(500).json({ error: 'Failed to create receipt' });
    }
  } finally {
    client.release();
  }
});

// Update receipt status
router.patch('/:id/status', async (req, res) => {
  try {
    const receiptId = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const query = `
      UPDATE receipts 
      SET status = $1, 
          validated_at = CASE WHEN $1 = 'validated' THEN CURRENT_TIMESTAMP ELSE validated_at END
      WHERE receipt_id = $2
      RETURNING receipt_id, reference, status, validated_at
    `;
    
    const result = await sequelize.query(query, { replacements: [status, receiptId], type: QueryTypes.SELECT });
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Receipt not found' });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating receipt status:', error);
    res.status(500).json({ error: 'Failed to update receipt status' });
  }
});

// Delete receipt
router.delete('/:id', async (req, res) => {
  try {
    const receiptId = parseInt(req.params.id);
    
    const query = `
      DELETE FROM receipts 
      WHERE receipt_id = $1 
      RETURNING receipt_id, reference
    `;
    
    const result = await sequelize.query(query, { replacements: [receiptId], type: QueryTypes.SELECT });
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Receipt not found' });
    }
    
    res.json({ message: 'Receipt deleted successfully', receipt: result[0] });
  } catch (error) {
    console.error('Error deleting receipt:', error);
    res.status(500).json({ error: 'Failed to delete receipt' });
  }
});

export default router;