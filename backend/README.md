# StockMaster Backend

This is the backend API for the StockMaster Inventory Management System.

## Database Structure

The system implements a comprehensive inventory management database with the following main entities:

### Core Entities
- **Users**: System users with different roles (admin, manager, operator, viewer)
- **Warehouses**: Physical storage facilities
- **Locations**: Specific storage areas within warehouses
- **Products**: Items managed in the inventory
- **Product Categories**: Product classification
- **Suppliers**: Vendors providing products
- **Customers**: Recipients of delivered products

### Stock Management
- **Stock Levels**: Current inventory quantities by product and location
- **Stock Adjustments**: Manual inventory corrections
- **Move History**: Complete audit trail of all stock movements

### Operations
- **Receipts**: Incoming goods (purchases, returns)
- **Delivery Orders**: Outgoing goods (sales, transfers)
- **Internal Transfers**: Movement between locations

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Database Setup**
   - Create a PostgreSQL database named `stockmaster`
   - Copy `.env.example` to `.env` and update database credentials:
   ```bash
   cp .env.example .env
   ```

3. **Configure Environment**
   Edit `.env` file with your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=stockmaster
   DB_USER=postgres
   DB_PASSWORD=your_password
   ```

4. **Start the Server**
   ```bash
   npm start
   ```
   
   For development with auto-reload:
   ```bash
   npm run dev
   ```

### Database Initialization

The system will automatically:
- Create all required tables on first run
- Insert sample data for testing
- Set up proper indexes and constraints

## API Endpoints

### Dashboard
- `GET /api/dashboard/` - Main dashboard data
- `GET /api/dashboard/overview` - Detailed overview
- `GET /api/dashboard/stock-summary` - Warehouse stock summary

### Master Data
- `GET|POST|PUT|DELETE /api/users` - User management
- `GET|POST|PUT|DELETE /api/warehouses` - Warehouse management
- `GET|POST|PUT|DELETE /api/locations` - Location management
- `GET|POST|PUT|DELETE /api/products` - Product management
- `GET|POST|PUT|DELETE /api/categories` - Category management
- `GET|POST|PUT|DELETE /api/suppliers` - Supplier management
- `GET|POST|PUT|DELETE /api/customers` - Customer management

### Stock Management
- `GET|POST|DELETE /api/stock` - Stock level management
- `GET /api/stock/alerts/low-stock` - Low stock alerts
- `GET /api/stock/summary/warehouse` - Stock summary by warehouse
- `PATCH /api/stock/move` - Stock movement

### Operations
- `GET|POST|DELETE /api/receipts` - Receipt management
- `GET|POST|DELETE /api/deliveries` - Delivery order management
- `GET|POST|DELETE /api/transfers` - Internal transfer management
- `GET|POST|DELETE /api/adjustments` - Stock adjustment management
- `GET|POST /api/move-history` - Movement history and audit trail

## Sample Data

The system includes sample data with:
- 3 users (admin, manager, operator)
- 3 warehouses with 8 locations
- 5 product categories with 7 products
- 4 suppliers and 4 customers
- Initial stock levels across multiple locations

Server runs on http://localhost:5001