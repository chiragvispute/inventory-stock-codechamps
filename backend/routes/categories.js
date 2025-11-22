import express from 'express';
import { ProductCategoryModel } from '../models/MasterData.js';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await ProductCategoryModel.getAllCategories();
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Get category by ID with products
router.get('/:id', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    const category = await ProductCategoryModel.getCategoryById(categoryId);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

// Create new category
router.post('/', async (req, res) => {
  try {
    const categoryData = req.body;
    
    // Validate required fields
    if (!categoryData.name) {
      return res.status(400).json({ error: 'Missing required field: name' });
    }
    
    const newCategory = await ProductCategoryModel.createCategory(categoryData);
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'Category with this name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create category' });
    }
  }
});

// Update category
router.put('/:id', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    const categoryData = req.body;
    const updatedCategory = await ProductCategoryModel.updateCategory(categoryId, categoryData);
    
    if (!updatedCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Category with this name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update category' });
    }
  }
});

// Delete category
router.delete('/:id', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    const deletedCategory = await ProductCategoryModel.deleteCategory(categoryId);
    
    if (!deletedCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }
    
    res.json({ message: 'Category deleted successfully', category: deletedCategory });
  } catch (error) {
    console.error('Error deleting category:', error);
    if (error.code === '23503') { // Foreign key violation
      res.status(400).json({ error: 'Cannot delete category: it is referenced by products' });
    } else {
      res.status(500).json({ error: 'Failed to delete category' });
    }
  }
});

export default router;