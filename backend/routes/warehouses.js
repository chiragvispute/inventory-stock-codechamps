import express from 'express';
import { WarehouseModel, LocationModel } from '../models/Warehouse.js';

const router = express.Router();

// Get all warehouses
router.get('/', async (req, res) => {
  try {
    const warehouses = await WarehouseModel.getAllWarehouses();
    res.json(warehouses);
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    res.status(500).json({ error: 'Failed to fetch warehouses' });
  }
});

// Get warehouse by ID with locations
router.get('/:id', async (req, res) => {
  try {
    const warehouseId = parseInt(req.params.id);
    const warehouse = await WarehouseModel.getWarehouseById(warehouseId);
    
    if (!warehouse) {
      return res.status(404).json({ error: 'Warehouse not found' });
    }
    
    res.json(warehouse);
  } catch (error) {
    console.error('Error fetching warehouse:', error);
    res.status(500).json({ error: 'Failed to fetch warehouse' });
  }
});

// Create new warehouse
router.post('/', async (req, res) => {
  try {
    const warehouseData = req.body;
    
    // Validate required fields
    if (!warehouseData.name || !warehouseData.shortCode) {
      return res.status(400).json({ error: 'Missing required fields: name, shortCode' });
    }
    
    const newWarehouse = await WarehouseModel.createWarehouse(warehouseData);
    res.status(201).json(newWarehouse);
  } catch (error) {
    console.error('Error creating warehouse:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'Warehouse with this name or short code already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create warehouse' });
    }
  }
});

// Update warehouse
router.put('/:id', async (req, res) => {
  try {
    const warehouseId = parseInt(req.params.id);
    const warehouseData = req.body;
    const updatedWarehouse = await WarehouseModel.updateWarehouse(warehouseId, warehouseData);
    
    if (!updatedWarehouse) {
      return res.status(404).json({ error: 'Warehouse not found' });
    }
    
    res.json(updatedWarehouse);
  } catch (error) {
    console.error('Error updating warehouse:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Warehouse with this name or short code already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update warehouse' });
    }
  }
});

// Delete warehouse
router.delete('/:id', async (req, res) => {
  try {
    const warehouseId = parseInt(req.params.id);
    const deletedWarehouse = await WarehouseModel.deleteWarehouse(warehouseId);
    
    if (!deletedWarehouse) {
      return res.status(404).json({ error: 'Warehouse not found' });
    }
    
    res.json({ message: 'Warehouse deleted successfully', warehouse: deletedWarehouse });
  } catch (error) {
    console.error('Error deleting warehouse:', error);
    if (error.code === '23503') { // Foreign key violation
      res.status(400).json({ error: 'Cannot delete warehouse: it contains locations or other references' });
    } else {
      res.status(500).json({ error: 'Failed to delete warehouse' });
    }
  }
});

export default router;