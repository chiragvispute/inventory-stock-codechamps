import express from 'express';
import { LocationModel } from '../models/Warehouse.js';

const router = express.Router();

// Get all locations
router.get('/', async (req, res) => {
  try {
    const locations = await LocationModel.getAllLocations();
    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// Get locations by warehouse
router.get('/warehouse/:warehouseId', async (req, res) => {
  try {
    const warehouseId = parseInt(req.params.warehouseId);
    const locations = await LocationModel.getLocationsByWarehouse(warehouseId);
    res.json(locations);
  } catch (error) {
    console.error('Error fetching locations by warehouse:', error);
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// Get location by ID
router.get('/:id', async (req, res) => {
  try {
    const locationId = parseInt(req.params.id);
    const location = await LocationModel.getLocationById(locationId);
    
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    res.json(location);
  } catch (error) {
    console.error('Error fetching location:', error);
    res.status(500).json({ error: 'Failed to fetch location' });
  }
});

// Create new location
router.post('/', async (req, res) => {
  try {
    const locationData = req.body;
    
    // Validate required fields
    if (!locationData.name || !locationData.shortCode || !locationData.warehouseId) {
      return res.status(400).json({ error: 'Missing required fields: name, shortCode, warehouseId' });
    }
    
    const newLocation = await LocationModel.createLocation(locationData);
    res.status(201).json(newLocation);
  } catch (error) {
    console.error('Error creating location:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'Location with this short code already exists in this warehouse' });
    } else if (error.code === '23503') { // Foreign key violation
      res.status(400).json({ error: 'Invalid warehouse ID' });
    } else {
      res.status(500).json({ error: 'Failed to create location' });
    }
  }
});

// Update location
router.put('/:id', async (req, res) => {
  try {
    const locationId = parseInt(req.params.id);
    const locationData = req.body;
    const updatedLocation = await LocationModel.updateLocation(locationId, locationData);
    
    if (!updatedLocation) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    res.json(updatedLocation);
  } catch (error) {
    console.error('Error updating location:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Location with this short code already exists in this warehouse' });
    } else if (error.code === '23503') {
      res.status(400).json({ error: 'Invalid warehouse ID' });
    } else {
      res.status(500).json({ error: 'Failed to update location' });
    }
  }
});

// Delete location
router.delete('/:id', async (req, res) => {
  try {
    const locationId = parseInt(req.params.id);
    const deletedLocation = await LocationModel.deleteLocation(locationId);
    
    if (!deletedLocation) {
      return res.status(404).json({ error: 'Location not found' });
    }
    
    res.json({ message: 'Location deleted successfully', location: deletedLocation });
  } catch (error) {
    console.error('Error deleting location:', error);
    if (error.code === '23503') { // Foreign key violation
      res.status(400).json({ error: 'Cannot delete location: it is referenced by stock levels or other records' });
    } else {
      res.status(500).json({ error: 'Failed to delete location' });
    }
  }
});

export default router;