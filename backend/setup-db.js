import { pool } from './db.js';
import { initializeDatabase, resetDatabase, checkDatabaseHealth } from './database.js';

const command = process.argv[2];

async function main() {
  try {
    switch (command) {
      case 'test':
        console.log('🧪 Testing database connection...');
        await pool.query('SELECT NOW() as current_time, version() as pg_version');
        console.log('✅ Database connection successful!');
        break;
        
      case 'init':
        console.log('🚀 Initializing database...');
        await initializeDatabase();
        break;
        
      case 'reset':
        console.log('🔄 Resetting database...');
        await resetDatabase();
        break;
        
      case 'health':
        console.log('🏥 Checking database health...');
        const isHealthy = await checkDatabaseHealth();
        console.log(isHealthy ? '✅ Database is healthy' : '❌ Database needs setup');
        break;
        
      case 'create-db':
        console.log('🗄️  Creating database...');
        // Connect to postgres database to create stockmaster
        const { Pool } = await import('pg');
        const adminPool = new Pool({
          host: process.env.DB_HOST || 'localhost',
          port: process.env.DB_PORT || 5432,
          database: 'postgres', // Connect to default postgres database
          user: process.env.DB_USER || 'postgres',
          password: process.env.DB_PASSWORD || 'password',
        });
        
        try {
          await adminPool.query('CREATE DATABASE stockmaster');
          console.log('✅ Database "stockmaster" created successfully');
        } catch (error) {
          if (error.code === '42P04') {
            console.log('ℹ️  Database "stockmaster" already exists');
          } else {
            throw error;
          }
        } finally {
          await adminPool.end();
        }
        break;
        
      default:
        console.log('📖 Database Setup Tool');
        console.log('');
        console.log('Available commands:');
        console.log('  test      - Test database connection');
        console.log('  create-db - Create the stockmaster database');
        console.log('  init      - Initialize database with tables and sample data');
        console.log('  reset     - Reset database (drop and recreate all tables)');
        console.log('  health    - Check database health');
        console.log('');
        console.log('Usage: node setup-db.js <command>');
        console.log('');
        console.log('Example setup process:');
        console.log('1. node setup-db.js create-db');
        console.log('2. node setup-db.js init');
        console.log('3. node setup-db.js health');
        break;
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('');
    console.log('💡 Common issues:');
    console.log('- Make sure PostgreSQL is installed and running');
    console.log('- Check your .env file has correct database credentials');
    console.log('- Ensure the database user has proper permissions');
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();