# Inventory Stock Management System

## 📋 Project Overview

### Problem Statement

Traditional inventory management suffers from:

- **Fragmented Data**: Scattered across spreadsheets and manual processes
- **Lack of Traceability**: Stock adjustments without proper audit trails
- **Delayed Visibility**: Slow insights into inbound/outbound flows
- **Reactive Decisions**: Manual analysis leads to delayed reorder and allocation decisions

### Solution

A unified, intelligent inventory management platform featuring:

- **Real-time Monitoring**: Live stock levels, receipts, deliveries, transfers, and adjustments
- **Master Data Management**: Centralized products, warehouses, suppliers, customers, and categories
- **AI-Powered Insights**: Natural language queries like "Which SKUs are running low?" or "What changed this week?"
- **Audit Trail**: Complete movement history with controlled stock edits

### Business Value

- **Faster Decision Cycles**: Conversational querying and real-time dashboards
- **Optimized Inventory**: Reduced stockouts and overstocks through better visibility
- **Compliance Ready**: Centralized audit history for regulatory requirements
- **Scalable Foundation**: Built for forecasting and automated alerting

## 🎯 Core Capabilities
- Auth & user management.
- Product / warehouse / location / supplier / customer data.
- Receipts (inbound) and deliveries (outbound).
- Transfers + adjustments with logged history.
- Movement timeline.
- KPI dashboard.
- Stock edit modal with validation.
- AI chatbot integration.

### Inventory Operations

- User authentication and role-based access control
- Multi-warehouse and location management
- Product catalog with categories and pricing
- Inbound receipts and outbound deliveries
- Internal transfers between locations
- Stock adjustments with reason tracking

### Analytics & Insights

- Real-time KPI dashboard
- Movement history timeline
- Low stock alerts and analytics
- AI-powered query interface
- Custom reporting capabilities

### Technical Differentiators

- **Dedicated AI microservice** separate from transactional API
- **Extensible SQL schema** optimized for analytics
- **Clean Architecture**: React frontend, Node.js API, Python AI agent
- **Real-time Updates**: Event-driven inventory tracking

## 🗄️ Database Architecture
<img width="2581" height="2181" alt="StockMaster drawio" src="https://github.com/user-attachments/assets/7fe60004-bf5e-4d8b-9b11-9afde86b8303" />

**Core tables**: User, Product, Category, Supplier, Customer, Warehouse, Location, StockLevel, Receipt, ReceiptItem, Delivery, DeliveryItem, Transfer, TransferItem, Adjustment, MoveHistory.

**Key relationships:**
- Product -> Category, Supplier
- StockLevel -> Product + Location; Location -> Warehouse
- Receipt / Delivery / Transfer each have line items referencing Product
- Adjustment references Product + Location + User
- MoveHistory logs all quantity-changing events (receipt, delivery, transfer, adjustment)

**Indexes :**
- products(sku), stock_levels(product_id, location_id), move_history(product_id, moved_at)

### Data Flow

1. **Inbound**: Receipts → Receipt Items → Stock Level increase
2. **Outbound**: Deliveries → Delivery Items → Stock Level decrease  
3. **Internal**: Transfers → Transfer Items → Cross-location movement
4. **Corrections**: Adjustments → Reason tracking → Move History logging
5. 
## Folder Structure
```
frontend/      React + Vite client
backend/       Express API, migrations, models, routes
ai-backend/    Python AI agent (tools + DB connector)
```
**Key files:**
- Frontend entry: [frontend/src/main.jsx](frontend/src/main.jsx), app: [frontend/src/App.jsx](frontend/src/App.jsx)
- Backend server: [backend/server.js](backend/server.js)
- Backend models: [backend/models](backend/models)
- Backend routes: [backend/routes](backend/routes)
- DB setup: [backend/setup-db.js](backend/setup-db.js), migrations: [backend/migrations](backend/migrations)
- AI agent: [ai-backend/ai_agent.py](ai-backend/ai_agent.py), tools: [ai-backend/tools.py](ai-backend/tools.py)

## 🛠️ Tech Stack

### Frontend

- **React** 19.2.0 - Modern UI framework
- **Vite** 7.2.5 (rolldown) - Ultra-fast build tool
- **React Router DOM** 7.9.6 - Client-side routing
- **CSS Modules** - Scoped styling

### Backend

- **Node.js** with Express.js - REST API server
- **Sequelize ORM** 6.37.7 - Database modeling
- **PostgreSQL** - Primary database
- **JWT** - Authentication & authorization
- **bcryptjs** - Password hashing
- **Nodemailer** - Email services

### AI Service

- **FastAPI** - High-performance API framework
- **LangChain** - LLM framework
- **Google Gemini** 2.5-flash - Large language model
- **psycopg2** - PostgreSQL adapter

### DevOps & Tools

- **ESLint** - Code linting
- **dotenv** - Environment configuration
- **CORS** - Cross-origin resource sharing

## 🔧 Prerequisites

- **Node.js** 18+ (LTS recommended)
- **Python** 3.10 or higher
- **PostgreSQL** 13+ database server. A SQL database matching migrations in [backend/migrations](backend/migrations)
- Environment variables (.env files)
- **Google Cloud Account** (for Gemini API access)
- **Git** (for cloning the repository)

### System Requirements

- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **Network**: Internet connection for AI API calls

## 🚀 Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd inventory-stock-codechamps
```

### 2. Backend Setup

```bash
cd backend
npm install

# Configure environment
cp .env  # Create if doesn't exist
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

### 4. AI Service Setup

```bash
cd ai-backend
pip install -r requirements.txt

# Configure environment
cp .env
# Edit .env with your database and Gemini API credentials
```

## ⚙️ Environment Configuration

### Backend Environment (`backend/.env`)

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=stockmaster
DB_USER=postgres
DB_PASSWORD=your_password

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# Server Configuration
PORT=5001
NODE_ENV=development
```

### AI Service Environment (`ai-backend/.env`)

```env
# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=stockmaster
DB_USER=postgres
DB_PASSWORD=your_password

# Google Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration
AI_PORT=8000
```

### Getting API Keys

1. **Gemini API**: Visit [Google AI Studio](https://makersuite.google.com/app/apikey) to get your API key
2. **Database**: Set up PostgreSQL locally or use a cloud provider

> ⚠️ **Security Note**: Never commit `.env` files to version control

## 🗃️ Database Setup

### 1. Create Database

```sql
-- Connect to PostgreSQL as superuser
CREATE DATABASE stockmaster;
CREATE USER stockuser WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE stockmaster TO stockuser;
```
### 2. Initialize Schema

```bash
cd backend
node setup-db.js init
```
### 3. Verify Setup

```bash
node setup-db.js health
```
### Database Schema

The system uses a comprehensive schema with the following core entities:

- **Users** - Authentication and roles
- **Warehouses/Locations** - Storage hierarchy  
- **Products/Categories** - Item catalog
- **Stock Levels** - Inventory tracking
- **Receipts/Deliveries** - Inbound/outbound transactions
- **Transfers/Adjustments** - Internal movements
- **Move History** - Complete audit trail

📋 Full schema: [`backend/migrations/complete_database.sql`](backend/migrations/complete_database.sql)

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend API**

```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
# Or: npm start (production mode)
```

**Terminal 2 - Frontend**

```bash
cd frontend
npm run dev
```

**Terminal 3 - AI Service**

```bash
cd ai-backend
python ai_agent.py
```

### Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5001
- **AI Service**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (FastAPI auto-docs)

### Default Login Credentials

```
Username: admin
Password: Admin123!

Username: manager1  
Password: Manager123!

Username: testuser
Password: Testpass!
```

## 🧪 Testing

### Automated API Testing

```bash
# Make script executable (Linux/Mac)
chmod +x test-api.sh

# Run API tests
bash test-api.sh
```

### Manual Testing

1. **Login**: POST `/api/auth/login`
2. **Get Stock**: GET `/api/stock` (with Bearer token)
3. **Search Products**: GET `/api/products?search=chair`
4. **Update Stock**: POST `/api/stock`

### AI Agent Testing

```bash
cd ai-backend
python test_agent.py
```

### Frontend Testing

1. Navigate to http://localhost:5173
2. Login with credentials above
3. Explore Stock, Products, and Dashboard tabs
4. Test the AI chatbot interface

### Hot Reload

- **Frontend**: Vite provides instant HMR (Hot Module Replacement)
- **Backend**: Nodemon auto-restarts on file changes
- **AI Service**: Manual restart required for Python changes

## Scripts

- Password update: [backend/scripts/update-passwords.js](backend/scripts/update-passwords.js)
- OTP utilities: [backend/utils/otp.js](backend/utils/otp.js)
- Debug DB: [ai-backend/debug_db.py](ai-backend/debug_db.py)
- Agent tests: [ai-backend/test_agent.py](ai-backend/test_agent.py)

## API (Overview)
Routes directory: [backend/routes](backend/routes)
Included resource handlers:
- Auth: [backend/routes/auth.js](backend/routes/auth.js)
- Users: [backend/routes/users.js](backend/routes/users.js)
- Products: [backend/routes/products.js](backend/routes/products.js)
- Stock: [backend/routes/stock.js](backend/routes/stock.js)
- Receipts: [backend/routes/receipts.js](backend/routes/receipts.js)
- Deliveries: [backend/routes/deliveries.js](backend/routes/deliveries.js)
- Move history: [backend/routes/moveHistory.js](backend/routes/moveHistory.js)
- Adjustments: [backend/routes/adjustments.js](backend/routes/adjustments.js)
- Warehouses / locations / suppliers / customers / categories

### Database Operations

```bash
cd backend

# Check database health
node -e "import('./database.js').then(db => db.checkDatabaseHealth())"

# Reset database (WARNING: Deletes all data)
node -e "import('./database.js').then(db => db.resetDatabase())"

# Update user passwords
node scripts/update-passwords.js
```

## 🌟 Features Overview

### 📊 Dashboard & Analytics

- Real-time inventory KPIs
- Low stock alerts and warnings
- Movement history visualization
- Custom widgets and metrics

### 📦 Inventory Management

- Multi-warehouse and location support
- Product catalog with categories
- Stock level tracking with min/max thresholds
- Batch import/export capabilities

### 🔄 Transaction Processing

- **Receipts**: Inbound inventory tracking
- **Deliveries**: Outbound order fulfillment
- **Transfers**: Inter-location movements
- **Adjustments**: Manual stock corrections with reasons

### 🤖 AI-Powered Insights

- Natural language inventory queries
- "Show me low stock items"
- "What changed in warehouse A this week?"
- "Which products need reordering?"

### 🔒 Security & Compliance

- Role-based access control (Admin, Manager, Operator, Viewer)
- JWT-based authentication
- Complete audit trail for all changes
- Password hashing with bcrypt

## 📷 Screenshots
Landing Page
<img width="1900" height="877" alt="Screenshot 2025-11-23 161752" src="https://github.com/user-attachments/assets/cae6a630-f491-45d7-9293-c1dc86e84b12" />

Login Page
<img width="1912" height="982" alt="Screenshot 2025-11-23 161809" src="https://github.com/user-attachments/assets/129a3069-b0a9-4aab-b034-3804f4751628" />

Dashboard
<img width="1901" height="991" alt="Screenshot 2025-11-23 161833" src="https://github.com/user-attachments/assets/44563803-b953-45c8-9874-a01e75b20369" />


Stocks Tab
<img width="1903" height="985" alt="Screenshot 2025-11-23 161848" src="https://github.com/user-attachments/assets/002d3833-0f94-49c6-b13f-d5451ed61704" />


Move History Tab
<img width="1906" height="987" alt="Screenshot 2025-11-23 161908" src="https://github.com/user-attachments/assets/519ccaff-365b-4080-bb1b-0242bc970adc" />


Kanban View
<img width="1903" height="989" alt="Screenshot 2025-11-23 161930" src="https://github.com/user-attachments/assets/edc89bc7-85c1-432a-b11b-9d6c594b70b4" />


Receipts Page
<img width="1903" height="981" alt="Screenshot 2025-11-23 162002" src="https://github.com/user-attachments/assets/ee51535c-0879-4d1f-baff-6f057c1d3a6b" />


Delivery Page
<img width="1896" height="985" alt="Screenshot 2025-11-23 162016" src="https://github.com/user-attachments/assets/ed820c8a-197e-487f-97ac-a40de315d311" />


AI- Chatbot
<img width="1900" height="977" alt="Screenshot 2025-11-23 162158" src="https://github.com/user-attachments/assets/bdb06731-0827-4661-b087-dab2c6609dc7" />



### Code Style

- **Frontend**: Follow ESLint configuration
- **Backend**: Use ES6+ features, async/await
- **AI Service**: Follow PEP 8 Python conventions
- **Commits**: Use conventional commit messages

### Pull Request Guidelines

- Include description of changes
- Update documentation if needed
- Add tests for new features
- Ensure all checks pass

## 🔧 Troubleshooting

### Common Issues

**Database Connection Failed**

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list postgresql     # macOS

# Verify connection settings
psql -h localhost -U postgres -d stockmaster


**Frontend Not Loading**

```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**AI Service Issues**

```bash
# Check Python environment
python --version
pip list

# Reinstall dependencies
pip install -r requirements.txt --upgrade
```

**Port Conflicts**

- Frontend: Change port in `vite.config.js`
- Backend: Set `PORT` environment variable
- AI Service: Modify `AI_PORT` in `.env`

### Getting Help

- Check existing [Issues](../../issues) on GitHub
- Review API documentation at http://localhost:8000/docs
- Examine browser console for frontend errors
- Check server logs for backend issues

## Testing API
See root helper: [test-api.sh](test-api.sh)

Example (adjust endpoints):
```sh
bash test-api.sh
```
## Contributing

1. Fork repository
2. Create feature branch
3. Ensure lint passes
4. Submit pull request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

### Technology Stack

- [React](https://reactjs.org/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [Node.js](https://nodejs.org/) - Runtime environment
- [Express.js](https://expressjs.com/) - Web framework
- [PostgreSQL](https://postgresql.org/) - Database
- [FastAPI](https://fastapi.tiangolo.com/) - Python API framework
- [Google Gemini](https://ai.google.com/) - AI language model
- [Sequelize](https://sequelize.org/) - ORM

  ## 📁 Project Structure

```
inventory-stock-codechamps/
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Chatbot.jsx        # AI chat interface
│   │   │   ├── KanbanView.jsx     # Kanban-style layouts
│   │   │   └── StockEditModal.jsx # Stock editing modal
│   │   ├── pages/              # Main application pages
│   │   │   ├── Dashboard.jsx      # Main dashboard
│   │   │   ├── Stock.jsx          # Inventory management
│   │   │   └── Landing.jsx        # Landing page
│   │   └── styles/             # Component-specific CSS
│   ├── package.json           # Frontend dependencies
│   └── vite.config.js         # Vite configuration
│
├── backend/                  # Node.js Express API
│   ├── routes/               # API route handlers
│   │   ├── auth.js            # Authentication
│   │   ├── stock.js           # Inventory operations
│   │   ├── products.js        # Product management
│   │   └── dashboard.js       # Analytics endpoints
│   ├── models/               # Sequelize ORM models
│   ├── migrations/           # Database schema
│   │   └── complete_database.sql
│   ├── middleware/           # Express middleware
│   ├── server.js             # Express server entry
│   └── package.json          # Backend dependencies
│
├── ai-backend/              # Python FastAPI AI service
│   ├── ai_agent.py           # Main AI service
│   ├── tools.py              # AI tool functions
│   ├── db_connector.py       # Database connector
│   └── requirements.txt      # Python dependencies
│
└── test-api.sh              # API testing script



### Contributors

Thanks to all contributors who have helped build this inventory management system.

---

<div align="center">
  <strong>Built with ❤️ for modern inventory management</strong>
</div>
