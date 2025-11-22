import express from 'express';
import { pool } from '../db.js';

const router = express.Router();

// Get all items
router.get('/', async (req, res) => {
});

// Get single item
router.get('/:id', async (req, res) => {
});

// Add new item
router.post('/', async (req, res) => {
  }
);

// Update item
router.put('/:id', async (req, res) => {
});

export default router;