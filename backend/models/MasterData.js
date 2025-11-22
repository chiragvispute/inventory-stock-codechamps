import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

// Define ProductCategory model with Sequelize
const ProductCategory = sequelize.define('ProductCategory', {
  category_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'product_categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

/**
 * Product Category model for handling category operations
 */
export class ProductCategoryModel {
  
  /**
   * Get all product categories with product count
   */
  static async getAllCategories() {
    const categories = await sequelize.query(`
      SELECT pc.category_id, pc.name, pc.description, 
             pc.created_at, pc.updated_at,
             COUNT(p.product_id) as product_count
      FROM product_categories pc
      LEFT JOIN products p ON pc.category_id = p.category_id
      GROUP BY pc.category_id, pc.name, pc.description, pc.created_at, pc.updated_at
      ORDER BY pc.name
    `, { type: sequelize.QueryTypes.SELECT });
    return categories;
  }

  /**
   * Get category by ID with products
   */
  static async getCategoryById(categoryId) {
    const category = await sequelize.query(`
      SELECT category_id, name, description, created_at, updated_at
      FROM product_categories
      WHERE category_id = $1
    `, { 
      replacements: [categoryId], 
      type: sequelize.QueryTypes.SELECT 
    });
    
    if (category.length === 0) {
      return null;
    }
    
    const categoryData = category[0];
    
    // Get products in this category
    const products = await sequelize.query(`
      SELECT product_id, name, sku_code, unit_of_measure, per_unit_cost, initial_stock
      FROM products 
      WHERE category_id = $1
      ORDER BY name
    `, { 
      replacements: [categoryId], 
      type: sequelize.QueryTypes.SELECT 
    });
    categoryData.products = products;
    
    return categoryData;
  }

  /**
   * Create new category
   */
  static async createCategory(categoryData) {
    const { name, description } = categoryData;
    
    const category = await ProductCategory.create({
      name,
      description
    });
    
    return category.dataValues;
  }

  /**
   * Update category
   */
  static async updateCategory(categoryId, categoryData) {
    const updateFields = {};
    
    if (categoryData.name !== undefined) updateFields.name = categoryData.name;
    if (categoryData.description !== undefined) updateFields.description = categoryData.description;

    if (Object.keys(updateFields).length === 0) {
      throw new Error('No fields to update');
    }

    const [affectedRows] = await ProductCategory.update(updateFields, {
      where: { category_id: categoryId }
    });

    if (affectedRows === 0) {
      return null;
    }

    // Return updated category
    return await this.getCategoryById(categoryId);
  }

  /**
   * Delete category
   */
  static async deleteCategory(categoryId) {
    const category = await ProductCategory.findOne({ where: { category_id: categoryId } });
    if (!category) return null;
    
    await ProductCategory.destroy({ where: { category_id: categoryId } });
    return category.dataValues;
  }
}

// Define Supplier model with Sequelize
const Supplier = sequelize.define('Supplier', {
  supplier_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  contact_person: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'suppliers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

/**
 * Supplier model for handling supplier operations
 */
export class SupplierModel {
  
  /**
   * Get all suppliers
   */
  static async getAllSuppliers() {
    const suppliers = await Supplier.findAll({
      order: [['name', 'ASC']]
    });
    return suppliers.map(supplier => supplier.dataValues);
  }

  /**
   * Get supplier by ID
   */
  static async getSupplierById(supplierId) {
    const supplier = await Supplier.findOne({ where: { supplier_id: supplierId } });
    return supplier ? supplier.dataValues : null;
  }

  /**
   * Create new supplier
   */
  static async createSupplier(supplierData) {
    const { name, contactPerson, email, phone, address } = supplierData;
    
    const supplier = await Supplier.create({
      name,
      contact_person: contactPerson,
      email,
      phone,
      address
    });
    
    return supplier.dataValues;
  }

  /**
   * Update supplier
   */
  static async updateSupplier(supplierId, supplierData) {
    const updateFields = {};
    
    // Map camelCase to snake_case for database fields
    if (supplierData.name !== undefined) updateFields.name = supplierData.name;
    if (supplierData.contactPerson !== undefined) updateFields.contact_person = supplierData.contactPerson;
    if (supplierData.email !== undefined) updateFields.email = supplierData.email;
    if (supplierData.phone !== undefined) updateFields.phone = supplierData.phone;
    if (supplierData.address !== undefined) updateFields.address = supplierData.address;

    if (Object.keys(updateFields).length === 0) {
      throw new Error('No fields to update');
    }

    const [affectedRows] = await Supplier.update(updateFields, {
      where: { supplier_id: supplierId }
    });

    if (affectedRows === 0) {
      return null;
    }

    // Return updated supplier
    return await this.getSupplierById(supplierId);
  }

  /**
   * Delete supplier
   */
  static async deleteSupplier(supplierId) {
    const supplier = await Supplier.findOne({ where: { supplier_id: supplierId } });
    if (!supplier) return null;
    
    await Supplier.destroy({ where: { supplier_id: supplierId } });
    return supplier.dataValues;
  }
}

// Define Customer model with Sequelize
const Customer = sequelize.define('Customer', {
  customer_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  contact_person: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'customers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

/**
 * Customer model for handling customer operations
 */
export class CustomerModel {
  
  /**
   * Get all customers
   */
  static async getAllCustomers() {
    const customers = await Customer.findAll({
      order: [['name', 'ASC']]
    });
    return customers.map(customer => customer.dataValues);
  }

  /**
   * Get customer by ID
   */
  static async getCustomerById(customerId) {
    const customer = await Customer.findOne({ where: { customer_id: customerId } });
    return customer ? customer.dataValues : null;
  }

  /**
   * Create new customer
   */
  static async createCustomer(customerData) {
    const { name, contactPerson, email, phone, address } = customerData;
    
    const customer = await Customer.create({
      name,
      contact_person: contactPerson,
      email,
      phone,
      address
    });
    
    return customer.dataValues;
  }

  /**
   * Update customer
   */
  static async updateCustomer(customerId, customerData) {
    const updateFields = {};
    
    // Map camelCase to snake_case for database fields
    if (customerData.name !== undefined) updateFields.name = customerData.name;
    if (customerData.contactPerson !== undefined) updateFields.contact_person = customerData.contactPerson;
    if (customerData.email !== undefined) updateFields.email = customerData.email;
    if (customerData.phone !== undefined) updateFields.phone = customerData.phone;
    if (customerData.address !== undefined) updateFields.address = customerData.address;

    if (Object.keys(updateFields).length === 0) {
      throw new Error('No fields to update');
    }

    const [affectedRows] = await Customer.update(updateFields, {
      where: { customer_id: customerId }
    });

    if (affectedRows === 0) {
      return null;
    }

    // Return updated customer
    return await this.getCustomerById(customerId);
  }

  /**
   * Delete customer
   */
  static async deleteCustomer(customerId) {
    const customer = await Customer.findOne({ where: { customer_id: customerId } });
    if (!customer) return null;
    
    await Customer.destroy({ where: { customer_id: customerId } });
    return customer.dataValues;
  }
}

// Export the Sequelize models as well for direct use if needed
export { ProductCategory, Supplier, Customer };