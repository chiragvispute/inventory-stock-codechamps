import express from 'express';
import { ProductModel } from '../models/Product.js';

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const products = await ProductModel.getAllProducts();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Search products
router.get('/search', async (req, res) => {
  try {
    const { q: searchTerm, category } = req.query;
    
    if (!searchTerm) {
      return res.status(400).json({ error: 'Search term is required' });
    }
    
    const categoryId = category ? parseInt(category) : null;
    const products = await ProductModel.searchProducts(searchTerm, categoryId);
    res.json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ error: 'Failed to search products' });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const product = await ProductModel.getProductById(productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Get product by SKU
router.get('/sku/:sku', async (req, res) => {
  try {
    const skuCode = req.params.sku;
    const product = await ProductModel.getProductBySku(skuCode);
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product by SKU:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create new product
router.post('/', async (req, res) => {
  try {
    const productData = req.body;
    
    // Validate required fields
    if (!productData.name || !productData.skuCode || !productData.categoryId || !productData.unitOfMeasure) {
      return res.status(400).json({ error: 'Missing required fields: name, skuCode, categoryId, unitOfMeasure' });
    }
    
    const newProduct = await ProductModel.createProduct(productData);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error creating product:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'Product with this SKU code already exists' });
    } else if (error.code === '23503') { // Foreign key violation
      res.status(400).json({ error: 'Invalid category ID' });
    } else {
      res.status(500).json({ error: 'Failed to create product' });
    }
  }
});

// Update product
router.put('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const productData = req.body;
    const updatedProduct = await ProductModel.updateProduct(productId, productData);
    
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'Product with this SKU code already exists' });
    } else if (error.code === '23503') {
      res.status(400).json({ error: 'Invalid category ID' });
    } else {
      res.status(500).json({ error: 'Failed to update product' });
    }
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const deletedProduct = await ProductModel.deleteProduct(productId);
    
    if (!deletedProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully', product: deletedProduct });
  } catch (error) {
    console.error('Error deleting product:', error);
    if (error.code === '23503') { // Foreign key violation
      res.status(400).json({ error: 'Cannot delete product: it is referenced by other records' });
    } else {
      res.status(500).json({ error: 'Failed to delete product' });
    }
  }
});

export default router;