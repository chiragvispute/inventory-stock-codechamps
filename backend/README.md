# Backend - Inventory Stock Management System

## Overview

Node.js/Express REST API backend for the Inventory Stock Management System. Provides comprehensive inventory operations, user authentication, and real-time analytics with PostgreSQL database integration.

## Tech Stack

- **Node.js** with Express.js - REST API server
- **Sequelize ORM** 6.37.7 - Database modeling and migrations
- **PostgreSQL** - Primary database with full ACID compliance
- **JWT** - Secure authentication and authorization
- **bcryptjs** - Password hashing and security
- **Nodemailer** - Email services and notifications

## Features

### Core Functionality

- User authentication with role-based access control
- Multi-warehouse and location inventory management
- Product catalog with categories and supplier information
- Real-time stock level tracking and alerts
- Comprehensive audit trail for all operations

### API Endpoints

#### Authentication
- `POST /api/auth/login` - User login with JWT token
- `POST /api/auth/register` - User registration
- `POST /api/auth/forgot-password` - Password reset
- `POST /api/auth/reset-password` - Password reset confirmation

#### Dashboard & Analytics
- `GET /api/dashboard` - Main dashboard data
- `GET /api/dashboard/overview` - Detailed KPI overview
- `GET /api/dashboard/stock-summary` - Warehouse stock summary
- `GET /api/dashboard/low-stock` - Low stock alerts

#### Master Data Management
- `GET|POST|PUT|DELETE /api/users` - User management
- `GET|POST|PUT|DELETE /api/warehouses` - Warehouse management
- `GET|POST|PUT|DELETE /api/locations` - Location management
- `GET|POST|PUT|DELETE /api/products` - Product catalog
- `GET|POST|PUT|DELETE /api/categories` - Category management
- `GET|POST|PUT|DELETE /api/suppliers` - Supplier management
- `GET|POST|PUT|DELETE /api/customers` - Customer management

#### Inventory Operations
- `GET|POST|PATCH|DELETE /api/stock` - Stock level management
- `GET /api/stock/alerts/low-stock` - Low stock notifications
- `GET /api/stock/summary/warehouse` - Inventory by warehouse
- `POST /api/stock/move` - Inter-location stock transfers

#### Transaction Processing
- `GET|POST|DELETE /api/receipts` - Inbound receipts
- `GET|POST|DELETE /api/deliveries` - Outbound deliveries
- `GET|POST|DELETE /api/transfers` - Internal transfers
- `GET|POST|DELETE /api/adjustments` - Stock adjustments
- `GET /api/move-history` - Complete audit trail

## Database Architecture

### Core Tables

- **users** - System users with role-based permissions
- **warehouses** - Physical storage facilities
- **locations** - Specific storage areas within warehouses
- **products** - Item catalog with SKU codes
- **product_categories** - Product classification system
- **suppliers** - Vendor and supplier information
- **customers** - Customer and recipient data

### Inventory Tables

- **stock_levels** - Current inventory quantities by location
- **receipts** / **receipt_items** - Inbound inventory transactions
- **delivery_orders** / **delivery_order_items** - Outbound transactions
- **internal_transfers** - Inter-location movements
- **stock_adjustments** - Manual inventory corrections
- **move_history** - Complete audit trail of all movements

## Quick Start

### Prerequisites

- Node.js 18+ (LTS recommended)
- PostgreSQL 13+ database server
- npm or yarn package manager

### Installation

```bash
# Install dependencies
npm install

# Start development server with auto-reload
npm run dev

# Start production server
npm start
```

### Environment Configuration

Create a `.env` file in the backend directory:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=stockmaster
DB_USER=postgres
DB_PASSWORD=your_password

# Authentication
JWT_SECRET=your_super_secure_jwt_secret_key
JWT_EXPIRES_IN=24h

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Server Configuration
PORT=5001
NODE_ENV=development
```

### Database Setup

#### 1. Create Database

```sql
-- Connect to PostgreSQL as superuser
CREATE DATABASE stockmaster;
CREATE USER stockuser WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE stockmaster TO stockuser;
```

#### 2. Initialize Schema and Sample Data

```bash
# Run database initialization
node setup-db.js init

# Check database health
node setup-db.js health

# Reset database (WARNING: Deletes all data)
node setup-db.js reset
```

The initialization process will:
- Create all required tables with proper relationships
- Set up indexes for optimal performance
- Insert sample data for testing
- Configure triggers for automated timestamps
- Hash default user passwords securely

### Default Users

After initialization, the following test users are available:

```
Admin User:
- Login: admin
- Password: admin123
- Role: admin

Manager User:
- Login: manager1
- Password: manager123
- Role: manager

Operator User:
- Login: operator1
- Password: operator123
- Role: operator

Test User:
- Login: testuser
- Password: testpass
- Role: admin
```

## API Documentation

### Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Error Handling

Standardized error responses:

```json
{
  "error": "Error description",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

### Response Format

Consistent response structure:

```json
{
  "success": true,
  "data": {...},
  "message": "Operation completed successfully"
}
```

## Development

### Code Structure

```
backend/
├── routes/                 # API route handlers
│   ├── auth.js            # Authentication endpoints
│   ├── dashboard.js       # Analytics and KPIs
│   ├── stock.js           # Inventory operations
│   ├── products.js        # Product management
│   └── [entity].js        # Other resource endpoints
├── models/                # Sequelize ORM models
│   ├── User.js           # User model with authentication
│   ├── Product.js        # Product catalog model
│   ├── StockLevel.js     # Inventory tracking model
│   └── [Entity].js       # Other entity models
├── middleware/           # Express middleware
│   ├── auth.js          # JWT authentication middleware
│   └── validation.js    # Input validation middleware
├── migrations/          # Database schema and migrations
│   └── complete_database.sql # Complete schema definition
├── scripts/            # Utility scripts
│   └── update-passwords.js # Password management
├── utils/              # Helper utilities
│   └── otp.js         # OTP generation and validation
├── server.js           # Express server configuration
├── database.js         # Database initialization
├── db.js              # Database connection management
└── package.json       # Dependencies and scripts
```

### Available Scripts

- `npm run dev` - Development server with nodemon auto-reload
- `npm start` - Production server
- `npm run lint` - Code linting (if configured)
- `npm test` - Run test suite (if available)

### Database Operations

```bash
# Update user passwords
node scripts/update-passwords.js

# Check database connection
node -e "import('./db.js').then(db => db.pool.query('SELECT NOW()'))"

# View database health
node -e "import('./database.js').then(db => db.checkDatabaseHealth())"
```

## Security Features

### Authentication & Authorization

- JWT-based stateless authentication
- Role-based access control (Admin, Manager, Operator, Viewer)
- Password hashing with bcrypt (12 rounds)
- Secure session management

### Data Protection

- SQL injection prevention via parameterized queries
- CORS configuration for cross-origin security
- Input validation and sanitization
- Environment-based configuration management

### Audit Trail

- Complete movement history logging
- User action tracking
- Timestamp recording for all operations
- Immutable audit records

## Production Deployment

### Environment Setup

```env
NODE_ENV=production
DB_SSL=true
JWT_SECRET=super_secure_production_secret
CORS_ORIGIN=https://yourdomain.com
```

### Performance Optimization

- Database connection pooling
- Query optimization with indexes
- Caching strategies for frequent queries
- Pagination for large datasets

### Monitoring

- Health check endpoints
- Error logging and monitoring
- Performance metrics collection
- Database query performance tracking

## Testing

### API Testing

Use the provided test script:

```bash
# Run comprehensive API tests
bash ../test-api.sh
```

### Manual Testing

```bash
# Test authentication
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"loginId":"admin","password":"admin123"}'

# Test protected endpoint (use token from login)
curl -H "Authorization: Bearer <token>" \
  http://localhost:5001/api/stock
```

## Troubleshooting

### Common Issues

#### Database Connection Failed

```bash
# Check PostgreSQL status
sudo systemctl status postgresql  # Linux
brew services list postgresql     # macOS

# Test connection manually
psql -h localhost -U postgres -d stockmaster
```

#### Port Already in Use

```bash
# Find process using port 5001
lsof -ti:5001  # Linux/Mac
netstat -ano | findstr :5001  # Windows

# Kill the process
kill -9 <process-id>
```

#### Migration Issues

```bash
# Reset and reinitialize database
node -e "import('./database.js').then(db => db.resetDatabase())"
```

### Logs and Debugging

- Check console output for detailed error messages
- Enable SQL query logging in `db.js` by setting `logging: console.log`
- Use debugging tools like Postman for API testing
- Monitor database logs for query performance

## Contributing

1. Follow Express.js best practices
2. Use async/await for asynchronous operations
3. Implement proper error handling
4. Add JSDoc comments for complex functions
5. Test all endpoints thoroughly
6. Update documentation for new features

For additional help, refer to the main project README or create an issue on GitHub.