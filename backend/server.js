import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool } from './db.js';

// Import routes
import dashboardRoutes from './routes/dashboard.js';
import stockRoutes from './routes/stock.js';

dotenv.config();

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.log('Database connection failed:', err.message);
  } else {
    console.log('Database connected successfully');
  }
});

// Routes
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/stock', stockRoutes);

app.get('/api', (req, res) => {
  res.json({ message: 'StockMaster API' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;