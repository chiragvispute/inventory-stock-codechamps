# Inventory-stock-codechamps
# Project Overview

## Problem
Inventory data is fragmented across spreadsheets and manual processes. Stock adjustments lack traceability. Visibility into inbound (receipts) and outbound (deliveries) flows is delayed. Movement history analysis and anomaly detection are slow, making decisions (reorder, allocation) reactive.

## Solution
Unified platform providing:
- Real-time stock levels, receipts, deliveries, transfers, adjustments, movement history.
- Structured master data (products, warehouses, suppliers, customers, categories).
- AI assistant for natural language queries (e.g., “Which SKUs are low?”, “What changed this week?”).
- Controlled stock edits with audit trail.

## Value
- Faster decision cycles via conversational querying and dashboards.
- Fewer stockouts / overstocks through improved visibility.
- Centralized audit history for compliance.
- Foundation for forecasting and automated alerting.

## Core Capabilities
- Auth & user management.
- Product / warehouse / location / supplier / customer data.
- Receipts (inbound) and deliveries (outbound).
- Transfers + adjustments with logged history.
- Movement timeline.
- KPI dashboard.
- Stock edit modal with validation.
- AI chatbot integration.

## Differentiators
- Dedicated AI microservice separate from transactional API.
- Extensible SQL schema for analytics.
- Clear separation: React frontend / Node.js API / Python AI agent.

## Future Enhancements
- Predictive reorder recommendations.
- Automated anomaly detection.
- Granular role-based access.
- Multi-channel order ingestion.
- Containerization + CI/CD.
- Threshold alerting (email / chat).

## Impact
Reduces manual reconciliation time, increases operational clarity, improves responsiveness to supply changes, and enables data-driven optimization of inventory flows.

## Database Design (Short)
Core tables: User, Product, Category, Supplier, Customer, Warehouse, Location, StockLevel, Receipt, ReceiptItem, Delivery, DeliveryItem, Transfer, TransferItem, Adjustment, MoveHistory.
Key relationships:
- Product -> Category, Supplier
- StockLevel -> Product + Location; Location -> Warehouse
- Receipt / Delivery / Transfer each have line items referencing Product
- Adjustment references Product + Location + User
- MoveHistory logs all quantity-changing events (receipt, delivery, transfer, adjustment)

Primary flows:
1. Inbound: Receipt + ReceiptItems increase StockLevel.
2. Outbound: Delivery + DeliveryItems decrease StockLevel.
3. Internal: Transfer + TransferItems move quantity between locations.
4. Corrections: Adjustment applies delta with reason; all movements captured in MoveHistory.

<img width="2581" height="2181" alt="StockMaster drawio" src="https://github.com/user-attachments/assets/7fe60004-bf5e-4d8b-9b11-9afde86b8303" />

# Inventory Stock Management & AI Assistant

Monorepo containing:
- React/Vite frontend (inventory UI, dashboards, stock movements)
- Node.js/Express backend (REST API, authentication, inventory operations)
- Python AI agent service (assist with queries / insights over inventory data)

## Folder Structure

```
frontend/      React + Vite client
backend/       Express API, migrations, models, routes
ai-backend/    Python AI agent (tools + DB connector)
```

Key files:
- Frontend entry: [frontend/src/main.jsx](frontend/src/main.jsx), app: [frontend/src/App.jsx](frontend/src/App.jsx)
- Backend server: [backend/server.js](backend/server.js)
- Backend models: [backend/models](backend/models)
- Backend routes: [backend/routes](backend/routes)
- DB setup: [backend/setup-db.js](backend/setup-db.js), migrations: [backend/migrations](backend/migrations)
- AI agent: [ai-backend/ai_agent.py](ai-backend/ai_agent.py), tools: [ai-backend/tools.py](ai-backend/tools.py)

## Tech Stack

- Frontend: React, Vite, CSS modules
- Backend: Node.js, Express, (SQL via migration scripts)
- AI: Python (likely OpenAI / embeddings; see requirements)
- Auth: Middleware in [backend/middleware/auth.js](backend/middleware/auth.js)

## Prerequisites

- Node.js (LTS)
- Python 3.10+
- A SQL database matching migrations in [backend/migrations](backend/migrations)
- Environment variables (.env files) based on [ai-backend/.env.example](ai-backend/.env.example)

## Installation

Backend:
```sh
cd backend
npm install
```

Frontend:
```sh
cd frontend
npm install
```

AI backend:
```sh
cd ai-backend
pip install -r requirements.txt
```

## Environment Setup

Create required .env (examples / inferred):
```
# backend/.env (if used)
DATABASE_URL=postgres://user:pass@host:port/db
JWT_SECRET=change_me

# ai-backend/.env
DB_URL=postgres://user:pass@host:port/db
OPENAI_API_KEY=sk-...
```

Adjust according to actual variables used in [backend/database.js](backend/database.js) and [ai-backend/db_connector.py](ai-backend/db_connector.py).

## Database

1. Apply migrations:
```sh
cd backend
node setup-db.js init
```
2. Review SQL schema: [backend/migrations/complete_database.sql](backend/migrations/complete_database.sql)

## Running Services

Backend API:
```sh
cd backend
npm start
```

Frontend (dev):
```sh
cd frontend
npm run dev
```

AI agent:
```sh
cd ai-backend
python ai_agent.py
```

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

## Frontend Highlights

Pages: [frontend/src/pages](frontend/src/pages)
Components: [frontend/src/components](frontend/src/components)
Styles: [frontend/src/styles](frontend/src/styles)
Chatbot UI: [frontend/src/components/Chatbot.jsx](frontend/src/components/Chatbot.jsx) with styles [frontend/src/styles/Chatbot.css](frontend/src/styles/Chatbot.css)

## AI Agent

Core logic: [ai-backend/ai_agent.py](ai-backend/ai_agent.py)
Tools integration: [ai-backend/tools.py](ai-backend/tools.py)
Database connector: [ai-backend/db_connector.py](ai-backend/db_connector.py)

Run tests:
```sh
cd ai-backend
python -m pytest -q
```

## Development

Lint frontend:
```sh
cd frontend
npm run lint
```

Hot reload (Vite) is available via dev server.

## Testing API

See root helper: [test-api.sh](test-api.sh)

Example (adjust endpoints):
```sh
bash test-api.sh
```

## Deployment Notes

- Build frontend: `npm run build` in [frontend/package.json](frontend/package.json)
- Serve build behind reverse proxy; keep backend & AI services secured
- Set production secrets in environment

## Contributing

1. Fork repository
2. Create feature branch
3. Ensure lint passes
4. Submit pull request

## Security

Rotate JWT secret; hash passwords (see any logic tied to [backend/models/User.js](backend/models/User.js)). Use HTTPS in production.

## License

Add license section (MIT / Apache 2.0 recommended).

## Roadmap (Suggested)

- Add automated tests (backend + frontend)
- Dockerization
- Monitoring & logging
- Role-based access control
- Enhanced AI recommendations

## Screenshots
<img width="1901" height="905" alt="image" src="https://github.com/user-attachments/assets/4d3ce1e0-c93c-40cd-9d9d-ee8cf6bc03d8" />
<img width="1902" height="900" alt="image" src="https://github.com/user-attachments/assets/05f64380-7388-4399-adf6-1a55c1269be0" />
<img width="1900" height="909" alt="image" src="https://github.com/user-attachments/assets/a22c8183-685b-46cb-92dc-428459b40e91" />
<img width="1891" height="902" alt="image" src="https://github.com/user-attachments/assets/dad514d7-9fca-4b2b-a289-5a276bcb3921" />

<img width="1893" height="900" alt="image" src="https://github.com/user-attachments/assets/75a1cbdc-afc1-4f6f-8f63-7ba7018081c9" />
<img width="1919" height="913" alt="image" src="https://github.com/user-attachments/assets/24365dc4-f7e1-4192-bfaa-667d164ea200" />

<img width="1370" height="857" alt="image" src="https://github.com/user-attachments/assets/160345a2-5c85-4984-940e-815029f3004d" />


## Acknowledgments

Inventory management & AI augmentation project.
