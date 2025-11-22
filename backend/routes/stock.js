import express from 'express';
import { StockLevelModel } from '../models/StockLevel.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all stock levels
router.get('/', async (req, res) => {
  try {
    const stockLevels = await StockLevelModel.getAllStockLevels();
    res.json(stockLevels);
  } catch (error) {
    console.error('Error fetching stock levels:', error);
    res.status(500).json({ error: 'Failed to fetch stock levels' });
  }
});

// Get all stock levels with detailed information
router.get('/detailed', async (req, res) => {
  try {
    const stockLevels = await StockLevelModel.getAllStockLevels();
    
    // Add calculated fields and enhanced formatting
    const enhancedStock = stockLevels.map(stock => ({
      ...stock,
      is_low_stock: stock.quantity_on_hand <= (stock.min_stock_level || 0) && stock.min_stock_level > 0,
      utilization_rate: stock.max_stock_level ? 
        Math.round((stock.quantity_on_hand / stock.max_stock_level) * 100) : null,
      available_capacity: stock.max_stock_level ? 
        stock.max_stock_level - stock.quantity_on_hand : null
    }));
    
    res.json(enhancedStock);
  } catch (error) {
    console.error('Error fetching detailed stock levels:', error);
    res.status(500).json({ error: 'Failed to fetch detailed stock levels' });
  }
});

// Get stock levels by product
router.get('/product/:productId', async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const stockLevels = await StockLevelModel.getStockLevelsByProduct(productId);
    res.json(stockLevels);
  } catch (error) {
    console.error('Error fetching stock levels by product:', error);
    res.status(500).json({ error: 'Failed to fetch stock levels' });
  }
});

// Get stock levels by location
router.get('/location/:locationId', async (req, res) => {
  try {
    const locationId = parseInt(req.params.locationId);
    const stockLevels = await StockLevelModel.getStockLevelsByLocation(locationId);
    res.json(stockLevels);
  } catch (error) {
    console.error('Error fetching stock levels by location:', error);
    res.status(500).json({ error: 'Failed to fetch stock levels' });
  }
});

// Get specific stock level
router.get('/:productId/:locationId', async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const locationId = parseInt(req.params.locationId);
    const stockLevel = await StockLevelModel.getStockLevel(productId, locationId);
    
    if (!stockLevel) {
      return res.status(404).json({ error: 'Stock level not found' });
    }
    
    res.json(stockLevel);
  } catch (error) {
    console.error('Error fetching stock level:', error);
    res.status(500).json({ error: 'Failed to fetch stock level' });
  }
});

// Create or update stock level
router.post('/', async (req, res) => {
  try {
    const stockData = req.body;
    
    // Validate required fields
    if (!stockData.productId || !stockData.locationId) {
      return res.status(400).json({ error: 'Missing required fields: productId, locationId' });
    }
    
    const stockLevel = await StockLevelModel.upsertStockLevel(stockData);
    res.status(201).json(stockLevel);
  } catch (error) {
    console.error('Error creating/updating stock level:', error);
    if (error.code === '23503') { // Foreign key violation
      res.status(400).json({ error: 'Invalid product ID or location ID' });
    } else {
      res.status(500).json({ error: 'Failed to create/update stock level' });
    }
  }
});

// Update stock quantity (for stock movements)
router.patch('/move', async (req, res) => {
  try {
    const { productId, locationId, quantityChange } = req.body;
    
    // Validate required fields
    if (!productId || !locationId || quantityChange === undefined) {
      return res.status(400).json({ error: 'Missing required fields: productId, locationId, quantityChange' });
    }
    
    const updatedStock = await StockLevelModel.updateStockQuantity(productId, locationId, quantityChange);
    res.json(updatedStock);
  } catch (error) {
    console.error('Error updating stock quantity:', error);
    res.status(500).json({ error: 'Failed to update stock quantity' });
  }
});

// Get low stock alerts
router.get('/alerts/low-stock', async (req, res) => {
  try {
    const lowStockItems = await StockLevelModel.getLowStockAlerts();
    res.json(lowStockItems);
  } catch (error) {
    console.error('Error fetching low stock alerts:', error);
    res.status(500).json({ error: 'Failed to fetch low stock alerts' });
  }
});

// Get stock summary by warehouse
router.get('/summary/warehouse', async (req, res) => {
  try {
    const summary = await StockLevelModel.getStockSummaryByWarehouse();
    res.json(summary);
  } catch (error) {
    console.error('Error fetching stock summary:', error);
    res.status(500).json({ error: 'Failed to fetch stock summary' });
  }
});

// Delete stock level
router.delete('/:productId/:locationId', async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const locationId = parseInt(req.params.locationId);
    const deletedStock = await StockLevelModel.deleteStockLevel(productId, locationId);
    
    if (!deletedStock) {
      return res.status(404).json({ error: 'Stock level not found' });
    }
    
    res.json({ message: 'Stock level deleted successfully', stockLevel: deletedStock });
  } catch (error) {
    console.error('Error deleting stock level:', error);
    res.status(500).json({ error: 'Failed to delete stock level' });
  }
});

export default router;