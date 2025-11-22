import express from 'express';
import { SupplierModel } from '../models/MasterData.js';

const router = express.Router();

// Get all suppliers
router.get('/', async (req, res) => {
  try {
    const suppliers = await SupplierModel.getAllSuppliers();
    res.json(suppliers);
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    res.status(500).json({ error: 'Failed to fetch suppliers' });
  }
});

// Get supplier by ID
router.get('/:id', async (req, res) => {
  try {
    const supplierId = parseInt(req.params.id);
    const supplier = await SupplierModel.getSupplierById(supplierId);
    
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    
    res.json(supplier);
  } catch (error) {
    console.error('Error fetching supplier:', error);
    res.status(500).json({ error: 'Failed to fetch supplier' });
  }
});

// Create new supplier
router.post('/', async (req, res) => {
  try {
    const supplierData = req.body;
    
    // Validate required fields
    if (!supplierData.name) {
      return res.status(400).json({ error: 'Missing required field: name' });
    }
    
    const newSupplier = await SupplierModel.createSupplier(supplierData);
    res.status(201).json(newSupplier);
  } catch (error) {
    console.error('Error creating supplier:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'Supplier with this name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create supplier' });
    }
  }
});

// Update supplier
router.put('/:id', async (req, res) => {
  try {
    const supplierId = parseInt(req.params.id);
    const supplierData = req.body;
    const updatedSupplier = await SupplierModel.updateSupplier(supplierId, supplierData);
    
    if (!updatedSupplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    
    res.json(updatedSupplier);
  } catch (error) {
    console.error('Error updating supplier:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Supplier with this name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update supplier' });
    }
  }
});

// Delete supplier
router.delete('/:id', async (req, res) => {
  try {
    const supplierId = parseInt(req.params.id);
    const deletedSupplier = await SupplierModel.deleteSupplier(supplierId);
    
    if (!deletedSupplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    
    res.json({ message: 'Supplier deleted successfully', supplier: deletedSupplier });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    if (error.code === '23503') { // Foreign key violation
      res.status(400).json({ error: 'Cannot delete supplier: it is referenced by receipts or other records' });
    } else {
      res.status(500).json({ error: 'Failed to delete supplier' });
    }
  }
});

export default router;