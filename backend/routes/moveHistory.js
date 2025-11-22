import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// Get move history with filters
router.get('/', async (req, res) => {
  try {
    const { 
      productId, 
      locationId, 
      transactionType, 
      startDate, 
      endDate, 
      limit = 100, 
      offset = 0 
    } = req.query;
    
    let query = `
      SELECT mh.move_id, mh.transaction_ref, mh.transaction_type, 
             mh.quantity_change, mh.unit_of_measure, mh.move_timestamp, 
             mh.description,
             p.name as product_name, p.sku_code,
             fl.name as from_location_name, fw.name as from_warehouse_name,
             tl.name as to_location_name, tw.name as to_warehouse_name,
             u.first_name || ' ' || u.last_name as responsible_user
      FROM move_history mh
      JOIN products p ON mh.product_id = p.product_id
      LEFT JOIN locations fl ON mh.from_location_id = fl.location_id
      LEFT JOIN warehouses fw ON fl.warehouse_id = fw.warehouse_id
      LEFT JOIN locations tl ON mh.to_location_id = tl.location_id
      LEFT JOIN warehouses tw ON tl.warehouse_id = tw.warehouse_id
      JOIN users u ON mh.responsible_user_id = u.user_id
      WHERE 1=1
    `;
    
    const params = [];
    let paramCount = 1;
    
    if (productId) {
      query += ` AND mh.product_id = $${paramCount}`;
      params.push(parseInt(productId));
      paramCount++;
    }
    
    if (locationId) {
      query += ` AND (mh.from_location_id = $${paramCount} OR mh.to_location_id = $${paramCount})`;
      params.push(parseInt(locationId));
      paramCount++;
    }
    
    if (transactionType) {
      query += ` AND mh.transaction_type = $${paramCount}`;
      params.push(transactionType);
      paramCount++;
    }
    
    if (startDate) {
      query += ` AND mh.move_timestamp >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }
    
    if (endDate) {
      query += ` AND mh.move_timestamp <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }
    
    query += ` ORDER BY mh.move_timestamp DESC`;
    query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await pool.query(query, params);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM move_history mh
      WHERE 1=1
    `;
    
    const countParams = [];
    let countParamCount = 1;
    
    if (productId) {
      countQuery += ` AND mh.product_id = $${countParamCount}`;
      countParams.push(parseInt(productId));
      countParamCount++;
    }
    
    if (locationId) {
      countQuery += ` AND (mh.from_location_id = $${countParamCount} OR mh.to_location_id = $${countParamCount})`;
      countParams.push(parseInt(locationId));
      countParamCount++;
    }
    
    if (transactionType) {
      countQuery += ` AND mh.transaction_type = $${countParamCount}`;
      countParams.push(transactionType);
      countParamCount++;
    }
    
    if (startDate) {
      countQuery += ` AND mh.move_timestamp >= $${countParamCount}`;
      countParams.push(startDate);
      countParamCount++;
    }
    
    if (endDate) {
      countQuery += ` AND mh.move_timestamp <= $${countParamCount}`;
      countParams.push(endDate);
      countParamCount++;
    }
    
    const countResult = await pool.query(countQuery, countParams);
    
    res.json({
      moves: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
    
  } catch (error) {
    console.error('Error fetching move history:', error);
    res.status(500).json({ error: 'Failed to fetch move history' });
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
    
    const result = await pool.query(query, [moveId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Move not found' });
    }
    
    res.json(result.rows[0]);
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
    
    const result = await pool.query(query, params);
    res.json(result.rows);
    
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
    
    const result = await pool.query(query, [
      transactionRef, transactionType, productId, fromLocationId,
      toLocationId, quantityChange, responsibleUserId, description
    ]);
    
    res.status(201).json(result.rows[0]);
    
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