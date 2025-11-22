import fs from 'fs';
import path from 'path';
import { pool } from './db.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Initialize database with tables and sample data
 */
export async function initializeDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting database initialization...');
    
    // Read and execute table creation script
    const createTablesPath = path.join(__dirname, 'migrations', '001_create_tables.sql');
    const createTablesSQL = fs.readFileSync(createTablesPath, 'utf8');
    
    console.log('📋 Creating database tables...');
    await client.query(createTablesSQL);
    console.log('✅ Database tables created successfully');
    
    // Check if sample data already exists
    const result = await client.query('SELECT COUNT(*) FROM users');
    const userCount = parseInt(result.rows[0].count);
    
    if (userCount === 0) {
      // Read and execute sample data script
      const sampleDataPath = path.join(__dirname, 'migrations', '002_sample_data.sql');
      const sampleDataSQL = fs.readFileSync(sampleDataPath, 'utf8');
      
      console.log('📊 Inserting sample data...');
      await client.query(sampleDataSQL);
      console.log('✅ Sample data inserted successfully');
      
      // Update user passwords with proper hashes
      console.log('🔑 Updating user passwords...');
      await updateSamplePasswords(client);
    } else {
      console.log('ℹ️  Sample data already exists, skipping...');
    }
    
    console.log('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Update sample user passwords with proper bcrypt hashes
 */
async function updateSamplePasswords(client) {
  // Import bcrypt dynamically to avoid import issues
  const bcrypt = (await import('bcryptjs')).default;
  
  const userUpdates = [
    { loginId: 'admin', password: 'admin123' },
    { loginId: 'manager1', password: 'manager123' },
    { loginId: 'operator1', password: 'operator123' }
  ];
  
  for (const user of userUpdates) {
    try {
      const hashedPassword = await bcrypt.hash(user.password, 12);
      await client.query(
        'UPDATE users SET password = $1 WHERE login_id = $2',
        [hashedPassword, user.loginId]
      );
      console.log(`✅ Updated password for: ${user.loginId}`);
    } catch (err) {
      console.error(`❌ Failed to update password for ${user.loginId}:`, err.message);
    }
  }
  
  // Add our test users if they don't exist
  const testUsers = [
    {
      loginId: 'testuser',
      email: 'test@example.com',
      password: 'testpass',
      firstName: 'Test',
      lastName: 'User',
      role: 'admin'
    },
    {
      loginId: 'manager',
      email: 'manager@example.com',
      password: 'manager123',
      firstName: 'Manager',
      lastName: 'User',
      role: 'manager'
    }
  ];
  
  for (const user of testUsers) {
    try {
      // Check if user exists
      const existing = await client.query('SELECT user_id FROM users WHERE login_id = $1', [user.loginId]);
      
      if (existing.rows.length === 0) {
        // Create user
        const hashedPassword = await bcrypt.hash(user.password, 12);
        await client.query(`
          INSERT INTO users (login_id, email, password, user_role, first_name, last_name)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [user.loginId, user.email, hashedPassword, user.role, user.firstName, user.lastName]);
        console.log(`✅ Created test user: ${user.loginId}`);
      }
    } catch (err) {
      console.error(`❌ Failed to create test user ${user.loginId}:`, err.message);
    }
  }
}

/**
 * Reset database (drop all tables and recreate)
 */
export async function resetDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🧹 Resetting database...');
    
    // Drop all tables in reverse order to avoid foreign key constraints
    const dropTablesSQL = `
      DROP TABLE IF EXISTS move_history CASCADE;
      DROP TABLE IF EXISTS stock_adjustments CASCADE;
      DROP TABLE IF EXISTS internal_transfers CASCADE;
      DROP TABLE IF EXISTS delivery_order_items CASCADE;
      DROP TABLE IF EXISTS delivery_orders CASCADE;
      DROP TABLE IF EXISTS receipt_items CASCADE;
      DROP TABLE IF EXISTS receipts CASCADE;
      DROP TABLE IF EXISTS customers CASCADE;
      DROP TABLE IF EXISTS suppliers CASCADE;
      DROP TABLE IF EXISTS stock_levels CASCADE;
      DROP TABLE IF EXISTS products CASCADE;
      DROP TABLE IF EXISTS product_categories CASCADE;
      DROP TABLE IF EXISTS locations CASCADE;
      DROP TABLE IF EXISTS warehouses CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      
      -- Drop functions and triggers
      DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
      DROP FUNCTION IF EXISTS update_stock_level_timestamp() CASCADE;
    `;
    
    await client.query(dropTablesSQL);
    console.log('✅ All tables dropped');
    
    // Reinitialize
    await initializeDatabase();
    
  } catch (error) {
    console.error('❌ Database reset failed:', error.message);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Check database connection and structure
 */
export async function checkDatabaseHealth() {
  const client = await pool.connect();
  
  try {
    // Test connection
    await client.query('SELECT NOW()');
    
    // Check if main tables exist
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    const result = await client.query(tablesQuery);
    const tables = result.rows.map(row => row.table_name);
    
    const expectedTables = [
      'users', 'warehouses', 'locations', 'product_categories', 'products',
      'stock_levels', 'suppliers', 'customers', 'receipts', 'receipt_items',
      'delivery_orders', 'delivery_order_items', 'internal_transfers',
      'stock_adjustments', 'move_history'
    ];
    
    const missingTables = expectedTables.filter(table => !tables.includes(table));
    
    if (missingTables.length > 0) {
      console.log(`⚠️  Missing tables: ${missingTables.join(', ')}`);
      return false;
    }
    
    console.log('✅ Database health check passed');
    console.log(`📊 Found ${tables.length} tables:`, tables.join(', '));
    
    return true;
    
  } catch (error) {
    console.error('❌ Database health check failed:', error.message);
    return false;
  } finally {
    client.release();
  }
}