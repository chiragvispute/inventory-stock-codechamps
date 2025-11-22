import express from 'express';
import { CustomerModel } from '../models/MasterData.js';

const router = express.Router();

// Get all customers
router.get('/', async (req, res) => {
  try {
    const customers = await CustomerModel.getAllCustomers();
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Get customer by ID
router.get('/:id', async (req, res) => {
  try {
    const customerId = parseInt(req.params.id);
    const customer = await CustomerModel.getCustomerById(customerId);
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ error: 'Failed to fetch customer' });
  }
});

// Create new customer
router.post('/', async (req, res) => {
  try {
    const customerData = req.body;
    
    // Validate required fields
    if (!customerData.name) {
      return res.status(400).json({ error: 'Missing required field: name' });
    }
    
    const newCustomer = await CustomerModel.createCustomer(customerData);
    res.status(201).json(newCustomer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const customerId = parseInt(req.params.id);
    const customerData = req.body;
    const updatedCustomer = await CustomerModel.updateCustomer(customerId, customerData);
    
    if (!updatedCustomer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json(updatedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    const customerId = parseInt(req.params.id);
    const deletedCustomer = await CustomerModel.deleteCustomer(customerId);
    
    if (!deletedCustomer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    res.json({ message: 'Customer deleted successfully', customer: deletedCustomer });
  } catch (error) {
    console.error('Error deleting customer:', error);
    if (error.code === '23503') { // Foreign key violation
      res.status(400).json({ error: 'Cannot delete customer: it is referenced by delivery orders or other records' });
    } else {
      res.status(500).json({ error: 'Failed to delete customer' });
    }
  }
});

export default router;