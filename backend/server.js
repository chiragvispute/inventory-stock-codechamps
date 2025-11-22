import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool, sequelize } from './db.js';
import { initializeDatabase, checkDatabaseHealth } from './database.js';

// Import routes
import dashboardRoutes from './routes/dashboard.js';
import stockRoutes from './routes/stock.js';
import userRoutes from './routes/users.js';
import productRoutes from './routes/products.js';
import warehouseRoutes from './routes/warehouses.js';
import locationRoutes from './routes/locations.js';
import categoryRoutes from './routes/categories.js';
import supplierRoutes from './routes/suppliers.js';
import customerRoutes from './routes/customers.js';
import receiptRoutes from './routes/receipts.js';
import deliveryRoutes from './routes/deliveries.js';
import transferRoutes from './routes/transfers.js';
import adjustmentRoutes from './routes/adjustments.js';
import moveHistoryRoutes from './routes/moveHistory.js';

dotenv.config();

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

// Initialize database
(async () => {
  try {
    console.log('🔗 Testing database connection...');
    
    // Test Sequelize connection
    await sequelize.authenticate();
    console.log('✅ Sequelize connected successfully');
    
    // Test legacy pool connection for backward compatibility
    await pool.query('SELECT NOW()');
    console.log('✅ Legacy pool connected successfully');
    
    const isHealthy = await checkDatabaseHealth();
    if (!isHealthy) {
      console.log('🔄 Initializing database structure...');
      await initializeDatabase();
    } else {
      console.log('✅ Database structure is healthy');
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    console.log('⚠️  Server will continue but some features may not work properly');
  }
})();

// Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/warehouses', warehouseRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/receipts', receiptRoutes);
app.use('/api/deliveries', deliveryRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/adjustments', adjustmentRoutes);
app.use('/api/move-history', moveHistoryRoutes);

app.get('/api', (req, res) => {
  res.json({ message: 'StockMaster API' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;