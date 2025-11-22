import { pool } from '../db.js';

/**
 * Product model for handling product operations
 */
export class ProductModel {
  
  /**
   * Get all products with category information
   */
  static async getAllProducts() {
    const query = `
      SELECT p.product_id, p.name, p.sku_code, p.unit_of_measure, 
             p.per_unit_cost, p.initial_stock, p.created_at, p.updated_at,
             pc.name as category_name, pc.category_id
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.category_id
      ORDER BY p.created_at DESC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Get product by ID
   */
  static async getProductById(productId) {
    const query = `
      SELECT p.product_id, p.name, p.sku_code, p.unit_of_measure, 
             p.per_unit_cost, p.initial_stock, p.created_at, p.updated_at,
             pc.name as category_name, pc.category_id
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.category_id
      WHERE p.product_id = $1
    `;
    const result = await pool.query(query, [productId]);
    return result.rows[0];
  }

  /**
   * Get product by SKU
   */
  static async getProductBySku(skuCode) {
    const query = `
      SELECT p.product_id, p.name, p.sku_code, p.unit_of_measure, 
             p.per_unit_cost, p.initial_stock, p.created_at, p.updated_at,
             pc.name as category_name, pc.category_id
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.category_id
      WHERE p.sku_code = $1
    `;
    const result = await pool.query(query, [skuCode]);
    return result.rows[0];
  }

  /**
   * Create new product
   */
  static async createProduct(productData) {
    const { name, skuCode, categoryId, unitOfMeasure, perUnitCost, initialStock } = productData;
    
    const query = `
      INSERT INTO products (name, sku_code, category_id, unit_of_measure, per_unit_cost, initial_stock)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING product_id, name, sku_code, category_id, unit_of_measure, per_unit_cost, initial_stock, created_at
    `;
    
    const result = await pool.query(query, [name, skuCode, categoryId, unitOfMeasure, perUnitCost || 0, initialStock || 0]);
    return result.rows[0];
  }

  /**
   * Update product
   */
  static async updateProduct(productId, productData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(productData).forEach(key => {
      if (productData[key] !== undefined) {
        const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        fields.push(`${dbField} = $${paramCount}`);
        values.push(productData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    const query = `
      UPDATE products 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE product_id = $${paramCount}
      RETURNING product_id, name, sku_code, category_id, unit_of_measure, per_unit_cost, initial_stock, updated_at
    `;
    
    values.push(productId);
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Delete product
   */
  static async deleteProduct(productId) {
    const query = 'DELETE FROM products WHERE product_id = $1 RETURNING *';
    const result = await pool.query(query, [productId]);
    return result.rows[0];
  }

  /**
   * Search products
   */
  static async searchProducts(searchTerm, categoryId = null) {
    let query = `
      SELECT p.product_id, p.name, p.sku_code, p.unit_of_measure, 
             p.per_unit_cost, p.initial_stock, p.created_at, p.updated_at,
             pc.name as category_name, pc.category_id
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.category_id
      WHERE (p.name ILIKE $1 OR p.sku_code ILIKE $1)
    `;
    
    const values = [`%${searchTerm}%`];
    
    if (categoryId) {
      query += ' AND p.category_id = $2';
      values.push(categoryId);
    }
    
    query += ' ORDER BY p.name';
    
    const result = await pool.query(query, values);
    return result.rows;
  }
}