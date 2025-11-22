# StockMaster Backend

Simple Express.js API for inventory management.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm run dev
```

Server runs on http://localhost:5000

## Endpoints

### Dashboard
- `GET /api/dashboard` - Get dashboard stats

### Stock
- `GET /api/stock` - Get all items
- `GET /api/stock/:id` - Get single item
- `POST /api/stock` - Add new item
- `PUT /api/stock/:id` - Update item
- `DELETE /api/stock/:id` - Delete item

## Example Usage

```bash
# Get all items
curl http://localhost:5000/api/stock

# Add new item
curl -X POST http://localhost:5000/api/stock \
  -H "Content-Type: application/json" \
  -d '{"name":"Speaker","quantity":30,"price":199}'
```