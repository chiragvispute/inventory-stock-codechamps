import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

// Define Product model with Sequelize
const Product = sequelize.define('Product', {
  product_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  sku_code: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  unit_of_measure: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  per_unit_cost: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  initial_stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'products',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

/**
 * Product model for handling product operations
 */
export class ProductModel {
  
  /**
   * Get all products with category information
   */
  static async getAllProducts() {
    const products = await sequelize.query(`
      SELECT p.product_id, p.name, p.sku_code, p.unit_of_measure, 
             p.per_unit_cost, p.initial_stock, p.created_at, p.updated_at,
             pc.name as category_name, pc.category_id
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.category_id
      ORDER BY p.created_at DESC
    `, { type: sequelize.QueryTypes.SELECT });
    return products;
  }

  /**
   * Get product by ID
   */
  static async getProductById(productId) {
    const product = await sequelize.query(`
      SELECT p.product_id, p.name, p.sku_code, p.unit_of_measure, 
             p.per_unit_cost, p.initial_stock, p.created_at, p.updated_at,
             pc.name as category_name, pc.category_id
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.category_id
      WHERE p.product_id = $1
    `, { 
      replacements: [productId], 
      type: sequelize.QueryTypes.SELECT 
    });
    return product[0];
  }

  /**
   * Get product by SKU
   */
  static async getProductBySku(skuCode) {
    const product = await sequelize.query(`
      SELECT p.product_id, p.name, p.sku_code, p.unit_of_measure, 
             p.per_unit_cost, p.initial_stock, p.created_at, p.updated_at,
             pc.name as category_name, pc.category_id
      FROM products p
      LEFT JOIN product_categories pc ON p.category_id = pc.category_id
      WHERE p.sku_code = $1
    `, { 
      replacements: [skuCode], 
      type: sequelize.QueryTypes.SELECT 
    });
    return product[0];
  }

  /**
   * Create new product
   */
  static async createProduct(productData) {
    const { name, skuCode, categoryId, unitOfMeasure, perUnitCost, initialStock } = productData;
    
    const product = await Product.create({
      name,
      sku_code: skuCode,
      category_id: categoryId,
      unit_of_measure: unitOfMeasure,
      per_unit_cost: perUnitCost || 0,
      initial_stock: initialStock || 0
    });
    
    return product.dataValues;
  }

  /**
   * Update product
   */
  static async updateProduct(productId, productData) {
    const updateFields = {};
    
    // Map camelCase to snake_case for database fields
    if (productData.name !== undefined) updateFields.name = productData.name;
    if (productData.skuCode !== undefined) updateFields.sku_code = productData.skuCode;
    if (productData.categoryId !== undefined) updateFields.category_id = productData.categoryId;
    if (productData.unitOfMeasure !== undefined) updateFields.unit_of_measure = productData.unitOfMeasure;
    if (productData.perUnitCost !== undefined) updateFields.per_unit_cost = productData.perUnitCost;
    if (productData.initialStock !== undefined) updateFields.initial_stock = productData.initialStock;

    if (Object.keys(updateFields).length === 0) {
      throw new Error('No fields to update');
    }

    const [affectedRows] = await Product.update(updateFields, {
      where: { product_id: productId },
      returning: true
    });

    if (affectedRows === 0) {
      return null;
    }

    // Return updated product
    return await this.getProductById(productId);
  }

  /**
   * Delete product
   */
  static async deleteProduct(productId) {
    const product = await Product.findOne({ where: { product_id: productId } });
    if (!product) return null;
    
    await Product.destroy({ where: { product_id: productId } });
    return product.dataValues;
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
    
    const replacements = [`%${searchTerm}%`];
    
    if (categoryId) {
      query += ' AND p.category_id = $2';
      replacements.push(categoryId);
    }
    
    query += ' ORDER BY p.name';
    
    const products = await sequelize.query(query, { 
      replacements, 
      type: sequelize.QueryTypes.SELECT 
    });
    return products;
  }
}

// Export the Sequelize model as well for direct use if needed
export { Product };