import express from 'express';

const router = express.Router();

// Simple dashboard data
router.get('/', (req, res) => {
  res.json({
    receipts: {
      toReceive: 5,
      late: 1,
      operations: 6
    },
    deliveries: {
      toDeliver: 5,
      waiting: 2,
      operations: 6
    },
    stock: {
      totalItems: 150,
      lowStock: 8,
      outOfStock: 2
    }
  });
});

export default router;