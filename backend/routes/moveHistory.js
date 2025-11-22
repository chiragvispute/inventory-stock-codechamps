import express from 'express';
import { pool, sequelize } from '../db.js';
import { QueryTypes } from 'sequelize';

const router = express.Router();

// Get move history with filters
router.get('/', async (req, res) => {
  try {
    console.log('=== Move History API Called ===');
    const { 
      productId, 
      locationId, 
      transactionType, 
      startDate, 
      endDate, 
      limit = 100, 
      offset = 0 
    } = req.query;
    
    console.log('Query params:', { limit, offset });
    
    // Build query with proper JOINs for frontend format
    let query = `
      SELECT mh.move_id, mh.transaction_ref, mh.transaction_type, 
             mh.quantity_change, mh.unit_of_measure, mh.move_timestamp, 
             mh.description,
             COALESCE(p.name, 'Unknown Product') as product_name, 
             COALESCE(p.sku_code, 'N/A') as sku_code,
             COALESCE(fl.name, 'External') as from_location_name, 
             COALESCE(fw.name, 'External') as from_warehouse_name,
             COALESCE(tl.name, 'External') as to_location_name, 
             COALESCE(tw.name, 'External') as to_warehouse_name,
             COALESCE(u.first_name || ' ' || u.last_name, 'System') as responsible_user
      FROM move_history mh
      LEFT JOIN products p ON mh.product_id = p.product_id
      LEFT JOIN locations fl ON mh.from_location_id = fl.location_id
      LEFT JOIN warehouses fw ON fl.warehouse_id = fw.warehouse_id
      LEFT JOIN locations tl ON mh.to_location_id = tl.location_id
      LEFT JOIN warehouses tw ON tl.warehouse_id = tw.warehouse_id
      LEFT JOIN users u ON mh.responsible_user_id = u.user_id
      ORDER BY mh.move_timestamp DESC
      LIMIT ${parseInt(limit)} OFFSET ${parseInt(offset)}
    `;
    
    console.log('Executing query with JOINs...');
    const result = await sequelize.query(query, { type: QueryTypes.SELECT });
    console.log('Query result sample:', result[0]);
    
    // Get total count
    const countResult = await sequelize.query(
      'SELECT COUNT(*) as total FROM move_history', 
      { type: QueryTypes.SELECT }
    );
    
    console.log('Returning response with', result.length, 'records');
    
    res.json({
      moves: result,
      total: parseInt(countResult[0].total),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
  } catch (error) {
    console.error('Error fetching move history:', error);
    res.status(500).json({ 
      error: 'Failed to fetch move history',
      details: error.message 
    });
  }
});

// Get move by ID
router.get('/:id', async (req, res) => {
  try {
    const moveId = parseInt(req.params.id);
    
    const query = `
      SELECT mh.move_id, mh.transaction_ref, mh.transaction_type, 
             mh.quantity_change, mh.unit_of_measure, mh.move_timestamp, 
             mh.description,
             p.product_id, p.name as product_name, p.sku_code,
             fl.location_id as from_location_id, fl.name as from_location_name, 
             fw.name as from_warehouse_name,
             tl.location_id as to_location_id, tl.name as to_location_name, 
             tw.name as to_warehouse_name,
             u.user_id, u.first_name || ' ' || u.last_name as responsible_user
      FROM move_history mh
      JOIN products p ON mh.product_id = p.product_id
      LEFT JOIN locations fl ON mh.from_location_id = fl.location_id
      LEFT JOIN warehouses fw ON fl.warehouse_id = fw.warehouse_id
      LEFT JOIN locations tl ON mh.to_location_id = tl.location_id
      LEFT JOIN warehouses tw ON tl.warehouse_id = tw.warehouse_id
      JOIN users u ON mh.responsible_user_id = u.user_id
      WHERE mh.move_id = $1
    `;
    
    const result = await sequelize.query(query, { replacements: [moveId], type: QueryTypes.SELECT });
    
    if (result.length === 0) {
      return res.status(404).json({ error: 'Move not found' });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error('Error fetching move:', error);
    res.status(500).json({ error: 'Failed to fetch move' });
  }
});

// Get move statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const { startDate, endDate, transactionType } = req.query;
    
    let query = `
      SELECT 
        transaction_type,
        COUNT(*) as move_count,
        SUM(ABS(quantity_change)) as total_quantity,
        COUNT(DISTINCT product_id) as unique_products
      FROM move_history
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;
    
    if (startDate) {
      query += ` AND move_timestamp >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }
    
    if (endDate) {
      query += ` AND move_timestamp <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }
    
    if (transactionType) {
      query += ` AND transaction_type = $${paramCount}`;
      params.push(transactionType);
      paramCount++;
    }
    
    query += ' GROUP BY transaction_type ORDER BY transaction_type';
    
    const result = await sequelize.query(query, { replacements: params, type: QueryTypes.SELECT });
    res.json(result);
    
  } catch (error) {
    console.error('Error fetching move statistics:', error);
    res.status(500).json({ error: 'Failed to fetch move statistics' });
  }
});

// Create move history record (usually done automatically by other operations)
router.post('/', async (req, res) => {
  try {
    const {
      transactionRef,
      transactionType,
      productId,
      fromLocationId,
      toLocationId,
      quantityChange,
      responsibleUserId,
      description
    } = req.body;
    
    // Validate required fields
    if (!transactionRef || !transactionType || !productId || 
        !quantityChange || !responsibleUserId) {
      return res.status(400).json({ 
        error: 'Missing required fields: transactionRef, transactionType, productId, quantityChange, responsibleUserId' 
      });
    }
    
    const query = `
      INSERT INTO move_history (transaction_ref, transaction_type, product_id, 
                               from_location_id, to_location_id, quantity_change, 
                               unit_of_measure, responsible_user_id, description)
      SELECT $1, $2, $3, $4, $5, $6, p.unit_of_measure, $7, $8
      FROM products p
      WHERE p.product_id = $3
      RETURNING move_id, transaction_ref, move_timestamp
    `;
    
    const result = await sequelize.query(query, { 
      replacements: [
        transactionRef, transactionType, productId, fromLocationId,
        toLocationId, quantityChange, responsibleUserId, description
      ], 
      type: QueryTypes.SELECT 
    });
    
    res.status(201).json(result[0]);
    
  } catch (error) {
    console.error('Error creating move history:', error);
    if (error.code === '23503') {
      res.status(400).json({ error: 'Invalid product, location, or user ID' });
    } else {
      res.status(500).json({ error: 'Failed to create move history' });
    }
  }
});

export default router;