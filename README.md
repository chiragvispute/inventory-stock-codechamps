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

### Core Tables

- **Users**: Authentication and role management
- **Warehouses/Locations**: Physical storage hierarchy
- **Products/Categories**: Product master data
- **Stock Levels**: Current inventory by location
- **Suppliers/Customers**: Business entity management
- **Receipts/Deliveries**: Inbound and outbound transactions
- **Transfers/Adjustments**: Internal movements and corrections
- **Move History**: Complete audit trail

### Data Flow

1. **Inbound**: Receipts → Receipt Items → Stock Level increase
2. **Outbound**: Deliveries → Delivery Items → Stock Level decrease  
3. **Internal**: Transfers → Transfer Items → Cross-location movement
4. **Corrections**: Adjustments → Reason tracking → Move History logging

<img width="2581" height="2181" alt="StockMaster drawio" src="https://github.com/user-attachments/assets/7fe60004-bf5e-4d8b-9b11-9afde86b8303" />

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
- **PostgreSQL** 13+ database server
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
Password: admin123

Username: manager1  
Password: manager123

Username: testuser
Password: testpass
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

### Environment Setup

1. **Database**: Use managed PostgreSQL (AWS RDS, Google Cloud SQL, etc.)
2. **Backend**: Deploy to services like Railway, Heroku, or DigitalOcean
3. **Frontend**: Deploy to Vercel, Netlify, or serve via reverse proxy
4. **AI Service**: Deploy to cloud with GPU support if needed

- [ ] Configure rate limiting

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
<img width="1896" height="991" alt="image" src="https://github.com/user-attachments/assets/7c6aca56-1207-48f4-8b88-04caa3e41764" />

Login Page
<img width="1912" height="982" alt="image" src="https://github.com/user-attachments/assets/7c5d9d6f-41e1-4fcd-8b1e-bd788554d11a" />

Dashboard
<img width="1901" height="991" alt="image" src="https://github.com/user-attachments/assets/79a03a73-fe48-458f-b23f-06b3448cb58d" />

Stocks Tab
<img width="1903" height="985" alt="image" src="https://github.com/user-attachments/assets/4d508f7b-191f-4aaf-9588-7be2b6f0fb98" />

Move History Tab
<img width="1906" height="987" alt="image" src="https://github.com/user-attachments/assets/c6d30bd3-69aa-4c5e-b79d-21fa1e55df5a" />

Kanban View
<img width="1903" height="989" alt="image" src="https://github.com/user-attachments/assets/e2fc59f0-c50f-4274-8d7d-cd53935f70f5" />

Receipts Page
<img width="1903" height="981" alt="image" src="https://github.com/user-attachments/assets/d7b3c335-5253-463b-aef7-205dff9e6afd" />

Delivery Page
<img width="1896" height="985" alt="image" src="https://github.com/user-attachments/assets/2078a7a9-4149-4b35-a796-4cea8e81b2cf" />

AI- Chatbot
<img width="1900" height="977" alt="image" src="https://github.com/user-attachments/assets/83463799-7583-45d3-be1b-557bc5dca6de" />


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
```

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

### Contributors

Thanks to all contributors who have helped build this inventory management system.

---

<div align="center">
  <strong>Built with ❤️ for modern inventory management</strong>
</div>
