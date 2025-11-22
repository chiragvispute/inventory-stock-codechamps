import express from 'express';
import { pool, sequelize } from '../db.js';
import { QueryTypes } from 'sequelize';

const router = express.Router();

// Get all delivery orders
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT do.delivery_order_id, do.reference, do.schedule_date, 
             do.operation_type, do.status, do.to_location, do.created_at,
             c.name as customer_name,
             u.first_name || ' ' || u.last_name as responsible_user,
             l.name as from_location_name, w.name as warehouse_name
      FROM delivery_orders do
      LEFT JOIN customers c ON do.customer_id = c.customer_id
      LEFT JOIN users u ON do.responsible_user_id = u.user_id
      LEFT JOIN locations l ON do.from_location_id = l.location_id
      LEFT JOIN warehouses w ON l.warehouse_id = w.warehouse_id
      ORDER BY do.created_at DESC
    `;
    const result = await sequelize.query(query, { type: QueryTypes.SELECT });
    res.json(result);
  } catch (error) {
    console.error('Error fetching delivery orders:', error);
    res.status(500).json({ error: 'Failed to fetch delivery orders' });
  }
});

// Get delivery order by ID with items
router.get('/:id', async (req, res) => {
  try {
    const deliveryOrderId = parseInt(req.params.id);
    
    // Get delivery order header
    const orderQuery = `
      SELECT do.delivery_order_id, do.reference, do.schedule_date, 
             do.operation_type, do.status, do.to_location, do.created_at,
             c.name as customer_name, c.contact_person as customer_contact,
             u.first_name || ' ' || u.last_name as responsible_user,
             l.name as from_location_name, w.name as warehouse_name
      FROM delivery_orders do
      LEFT JOIN customers c ON do.customer_id = c.customer_id
      LEFT JOIN users u ON do.responsible_user_id = u.user_id
      LEFT JOIN locations l ON do.from_location_id = l.location_id
      LEFT JOIN warehouses w ON l.warehouse_id = w.warehouse_id
      WHERE do.delivery_order_id = $1
    `;
    
    const orderResult = await sequelize.query(orderQuery, { replacements: [deliveryOrderId], type: QueryTypes.SELECT });
    
    if (orderResult.length === 0) {
      return res.status(404).json({ error: 'Delivery order not found' });
    }
    
    const deliveryOrder = orderResult[0];
    
    // Get delivery order items
    const itemsQuery = `
      SELECT doi.delivery_order_item_id, doi.quantity_ordered, doi.quantity_delivered,
             p.product_id, p.name as product_name, p.sku_code, p.unit_of_measure
      FROM delivery_order_items doi
      JOIN products p ON doi.product_id = p.product_id
      WHERE doi.delivery_order_id = $1
      ORDER BY p.name
    `;
    
    const itemsResult = await sequelize.query(itemsQuery, { replacements: [deliveryOrderId], type: QueryTypes.SELECT });
    deliveryOrder.items = itemsResult;
    
    res.json(deliveryOrder);
  } catch (error) {
    console.error('Error fetching delivery order:', error);
    res.status(500).json({ error: 'Failed to fetch delivery order' });
  }
});

// Create new delivery order
router.post('/', async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      reference,
      scheduleDate,
      operationType,
      customerId,
      responsibleUserId,
      fromLocationId,
      toLocation,
      items
    } = req.body;
    
    // Validate required fields
    if (!reference || !scheduleDate || !responsibleUserId || !fromLocationId) {
      return res.status(400).json({ 
        error: 'Missing required fields: reference, scheduleDate, responsibleUserId, fromLocationId' 
      });
    }
    
    // Create delivery order header
    const orderQuery = `
      INSERT INTO delivery_orders (reference, schedule_date, operation_type, customer_id, 
                                  responsible_user_id, from_location_id, to_location)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING delivery_order_id, reference, created_at
    `;
    
    const orderResult = await client.query(orderQuery, [
      reference, scheduleDate, operationType || 'sale', customerId,
      responsibleUserId, fromLocationId, toLocation
    ]);
    
    const newOrder = orderResult[0];
    
    // Create delivery order items if provided
    if (items && items.length > 0) {
      for (const item of items) {
        const itemQuery = `
          INSERT INTO delivery_order_items (delivery_order_id, product_id, quantity_ordered, quantity_delivered)
          VALUES ($1, $2, $3, $4)
        `;
        
        await client.query(itemQuery, [
          newOrder.delivery_order_id,
          item.productId,
          item.quantityOrdered,
          item.quantityDelivered || 0
        ]);
      }
    }
    
    await client.query('COMMIT');
    res.status(201).json(newOrder);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating delivery order:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Delivery order with this reference already exists' });
    } else if (error.code === '23503') {
      res.status(400).json({ error: 'Invalid customer, user, or location ID' });
    } else {
      res.status(500).json({ error: 'Failed to create delivery order' });
    }
  } finally {
    client.release();
  }
});

// Update delivery order status
router.patch('/:id/status', async (req, res) => {
  try {
    const deliveryOrderId = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const query = `
      UPDATE delivery_orders 
      SET status = $1, 
          validated_at = CASE WHEN $1 = 'validated' THEN CURRENT_TIMESTAMP ELSE validated_at END
      WHERE delivery_order_id = $2
      RETURNING delivery_order_id, reference, status, validated_at
    `;
    
    const result = await sequelize.query(query, { replacements: [status, deliveryOrderId], type: QueryTypes.SELECT });
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Delivery order not found' });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error('Error updating delivery order status:', error);
    res.status(500).json({ error: 'Failed to update delivery order status' });
  }
});

// Delete delivery order
router.delete('/:id', async (req, res) => {
  try {
    const deliveryOrderId = parseInt(req.params.id);
    
    const query = `
      DELETE FROM delivery_orders 
      WHERE delivery_order_id = $1 
      RETURNING delivery_order_id, reference
    `;
    
    const result = await sequelize.query(query, { replacements: [deliveryOrderId], type: QueryTypes.SELECT });
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Delivery order not found' });
    }
    
    res.json({ message: 'Delivery order deleted successfully', deliveryOrder: result[0] });
  } catch (error) {
    console.error('Error deleting delivery order:', error);
    res.status(500).json({ error: 'Failed to delete delivery order' });
  }
});

export default router;