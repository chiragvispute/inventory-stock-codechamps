import { pool } from '../db.js';

/**
 * Product Category model for handling category operations
 */
export class ProductCategoryModel {
  
  /**
   * Get all product categories with product count
   */
  static async getAllCategories() {
    const query = `
      SELECT pc.category_id, pc.name, pc.description, 
             pc.created_at, pc.updated_at,
             COUNT(p.product_id) as product_count
      FROM product_categories pc
      LEFT JOIN products p ON pc.category_id = p.category_id
      GROUP BY pc.category_id, pc.name, pc.description, pc.created_at, pc.updated_at
      ORDER BY pc.name
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Get category by ID with products
   */
  static async getCategoryById(categoryId) {
    const query = `
      SELECT category_id, name, description, created_at, updated_at
      FROM product_categories
      WHERE category_id = $1
    `;
    const result = await pool.query(query, [categoryId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    const category = result.rows[0];
    
    // Get products in this category
    const productsQuery = `
      SELECT product_id, name, sku_code, unit_of_measure, per_unit_cost, initial_stock
      FROM products 
      WHERE category_id = $1
      ORDER BY name
    `;
    const productsResult = await pool.query(productsQuery, [categoryId]);
    category.products = productsResult.rows;
    
    return category;
  }

  /**
   * Create new category
   */
  static async createCategory(categoryData) {
    const { name, description } = categoryData;
    
    const query = `
      INSERT INTO product_categories (name, description)
      VALUES ($1, $2)
      RETURNING category_id, name, description, created_at
    `;
    
    const result = await pool.query(query, [name, description]);
    return result.rows[0];
  }

  /**
   * Update category
   */
  static async updateCategory(categoryId, categoryData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(categoryData).forEach(key => {
      if (categoryData[key] !== undefined) {
        fields.push(`${key} = $${paramCount}`);
        values.push(categoryData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    const query = `
      UPDATE product_categories 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE category_id = $${paramCount}
      RETURNING category_id, name, description, updated_at
    `;
    
    values.push(categoryId);
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Delete category
   */
  static async deleteCategory(categoryId) {
    const query = 'DELETE FROM product_categories WHERE category_id = $1 RETURNING *';
    const result = await pool.query(query, [categoryId]);
    return result.rows[0];
  }
}

/**
 * Supplier model for handling supplier operations
 */
export class SupplierModel {
  
  /**
   * Get all suppliers
   */
  static async getAllSuppliers() {
    const query = `
      SELECT supplier_id, name, contact_person, email, phone, address, 
             created_at, updated_at
      FROM suppliers
      ORDER BY name
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Get supplier by ID
   */
  static async getSupplierById(supplierId) {
    const query = `
      SELECT supplier_id, name, contact_person, email, phone, address, 
             created_at, updated_at
      FROM suppliers
      WHERE supplier_id = $1
    `;
    const result = await pool.query(query, [supplierId]);
    return result.rows[0];
  }

  /**
   * Create new supplier
   */
  static async createSupplier(supplierData) {
    const { name, contactPerson, email, phone, address } = supplierData;
    
    const query = `
      INSERT INTO suppliers (name, contact_person, email, phone, address)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING supplier_id, name, contact_person, email, phone, address, created_at
    `;
    
    const result = await pool.query(query, [name, contactPerson, email, phone, address]);
    return result.rows[0];
  }

  /**
   * Update supplier
   */
  static async updateSupplier(supplierId, supplierData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(supplierData).forEach(key => {
      if (supplierData[key] !== undefined) {
        const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        fields.push(`${dbField} = $${paramCount}`);
        values.push(supplierData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    const query = `
      UPDATE suppliers 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE supplier_id = $${paramCount}
      RETURNING supplier_id, name, contact_person, email, phone, address, updated_at
    `;
    
    values.push(supplierId);
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Delete supplier
   */
  static async deleteSupplier(supplierId) {
    const query = 'DELETE FROM suppliers WHERE supplier_id = $1 RETURNING *';
    const result = await pool.query(query, [supplierId]);
    return result.rows[0];
  }
}

/**
 * Customer model for handling customer operations
 */
export class CustomerModel {
  
  /**
   * Get all customers
   */
  static async getAllCustomers() {
    const query = `
      SELECT customer_id, name, contact_person, email, phone, address, 
             created_at, updated_at
      FROM customers
      ORDER BY name
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Get customer by ID
   */
  static async getCustomerById(customerId) {
    const query = `
      SELECT customer_id, name, contact_person, email, phone, address, 
             created_at, updated_at
      FROM customers
      WHERE customer_id = $1
    `;
    const result = await pool.query(query, [customerId]);
    return result.rows[0];
  }

  /**
   * Create new customer
   */
  static async createCustomer(customerData) {
    const { name, contactPerson, email, phone, address } = customerData;
    
    const query = `
      INSERT INTO customers (name, contact_person, email, phone, address)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING customer_id, name, contact_person, email, phone, address, created_at
    `;
    
    const result = await pool.query(query, [name, contactPerson, email, phone, address]);
    return result.rows[0];
  }

  /**
   * Update customer
   */
  static async updateCustomer(customerId, customerData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(customerData).forEach(key => {
      if (customerData[key] !== undefined) {
        const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        fields.push(`${dbField} = $${paramCount}`);
        values.push(customerData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    const query = `
      UPDATE customers 
      SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE customer_id = $${paramCount}
      RETURNING customer_id, name, contact_person, email, phone, address, updated_at
    `;
    
    values.push(customerId);
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  /**
   * Delete customer
   */
  static async deleteCustomer(customerId) {
    const query = 'DELETE FROM customers WHERE customer_id = $1 RETURNING *';
    const result = await pool.query(query, [customerId]);
    return result.rows[0];
  }
}