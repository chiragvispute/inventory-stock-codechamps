# 🤖 Inventory Management AI Agent

A sophisticated AI-powered chatbot built with **LangChain** and **Google Gemini** that can intelligently query your inventory database and answer natural language questions.

## ✨ Features

### 🔍 Smart Fuzzy Matching
- **Case-insensitive search**: "aluminum", "Aluminum", "ALUMINUM" all work
- **Typo tolerance**: "Aluminium" (British spelling) → "Aluminum" (US spelling)
- **Partial matching**: "alum" → finds all aluminum products
- Uses Python's `difflib.SequenceMatcher` for intelligent matching

### 🗄️ Database Integration
- **Real-time queries** directly from PostgreSQL
- **Complex queries**: Join operations across products, stock levels, warehouses, and locations
- **Performance optimized**: Efficient SQL with proper indexing support

### 🎯 Inventory Query Capabilities
- **Stock Levels**: "How much aluminum do we have?"
- **Warehouse Locations**: "Where is the aluminum stored?"
- **Low Stock Alerts**: "What products need reordering?"
- **Warehouse Summary**: "Show me inventory by warehouse"
- **Statistics**: "How many products do we have?"
- **Product Discovery**: "List all products"

### 🚀 LangChain & LangServe
- **Agent Executor**: Auto-selects appropriate tools for queries
- **Tool Calling**: Gemini decides which function to use
- **LangServe Integration**: Built-in REST API and interactive playground
- **FastAPI Backend**: Robust error handling and CORS support

---

## 📋 Prerequisites

### System Requirements
- Python 3.10+
- PostgreSQL 12+ (must be running with inventory database)
- Node.js 16+ (for frontend)

### Required API Keys
- **Google Gemini API Key**: Get from [Google AI Studio](https://makersuite.google.com/app/apikey)

---

## 🔧 Installation

### 1. Install Python Dependencies

```bash
cd ai-backend
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create/Update `.env` file in `ai-backend/` directory:

```dotenv
# PostgreSQL Database Configuration
DB_HOST=localhost
DB_PORT=5433
DB_NAME=stockmaster
DB_USER=postgres
DB_PASSWORD=Harsh$08131920

# Google Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Server Configuration
AI_PORT=8000
```

### 3. Verify Database Connection

Make sure your PostgreSQL database is running and has the schema initialized:

```bash
# Check if database is accessible
psql -h localhost -p 5433 -U postgres -d stockmaster -c "SELECT COUNT(*) FROM products;"
```

---

## 🚀 Running the AI Agent

### Start the Agent Server

```bash
cd ai-backend
python ai_agent.py
```

Expected output:
```
✅ LLM initialized: Google Gemini 2.5 Flash
✅ Tools registered: 6 inventory query tools
✅ Agent created and configured
✅ LangServe route added at /agent
🚀 Starting Inventory AI Agent on port 8000
📚 API Documentation: http://localhost:8000/docs
🔗 LangServe UI: http://localhost:8000/agent/playground
```

---

## 💻 Usage Examples

### Option 1: Interactive Playground (Best for Testing)

Open your browser and navigate to:
```
http://localhost:8000/agent/playground
```

This gives you an interactive UI to test queries in real-time.

### Option 2: API Documentation

```
http://localhost:8000/docs
```

Try the `/query` endpoint with examples:
- `"How much Aluminium do we have?"`
- `"Where is aluminum stored?"`
- `"Show me low stock products"`

### Option 3: Direct HTTP Requests

```bash
# PowerShell
$response = Invoke-WebRequest -Uri "http://localhost:8000/query" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"query":"How much aluminum do we have?"}' `
  -UseBasicParsing

Write-Host $response.Content
```

```bash
# Bash/Unix
curl -X POST http://localhost:8000/query \
  -H "Content-Type: application/json" \
  -d '{"query":"How much aluminum do we have?"}'
```

### Option 4: Python Script

```python
import requests

response = requests.post(
    "http://localhost:8000/query",
    json={"query": "How much aluminum do we have?"}
)

print(response.json()['response'])
```

---

## 🧪 Testing

### Run Automated Tests

```bash
python test_agent.py
```

This tests:
- ✅ Server health check
- ✅ Stock level queries (with variations)
- ✅ Warehouse location queries
- ✅ Low stock alerts
- ✅ Overview queries
- ✅ Product discovery

### Example Test Output

```
🤖 Inventory AI Agent - Test Suite
============================================================
🔍 Testing Health Check
============================================================
✅ Server is running!

[Test 1/13]
📝 Query: How much Aluminium do we have?
────────────────────────────────────────────────────────
✅ Response received:

📦 Stock Information for: Aluminium
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SKU Code: ALU-001
Total Stock: 1500 KG
Total Value: $45,000.00
```

---

## 🏗️ Architecture

### Component Overview

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                        │
│            (Vite @ http://localhost:5173)              │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────▼────────────┐
         │  FastAPI AI Agent      │
         │  (Port 8000)           │
         │  ┌──────────────────┐  │
         │  │ LangChain Agent  │  │
         │  │ (Tool Calling)   │  │
         │  └───────┬──────────┘  │
         │          │             │
         │  ┌───────▼──────────┐  │
         │  │ Tools (6 functions)│ │
         │  │ - Stock queries  │  │
         │  │ - Warehouse info │  │
         │  │ - Low stock      │  │
         │  │ - Statistics     │  │
         │  └───────┬──────────┘  │
         └──────────┼──────────────┘
                    │
         ┌──────────▼──────────┐
         │   PostgreSQL DB     │
         │   (Port 5433)       │
         │   Tables:           │
         │   - products        │
         │   - stock_levels    │
         │   - warehouses      │
         │   - locations       │
         └─────────────────────┘
```

### Data Flow

1. **User Query** → React Frontend
2. **Natural Language** → FastAPI `/query` endpoint
3. **LangChain Processing** → Agent analyzes query
4. **Tool Selection** → Agent picks appropriate tool
5. **Database Query** → Tool executes SQL with fuzzy matching
6. **Response Generation** → LLM formats response
7. **Response Display** → Frontend shows results

---

## 🛠️ File Structure

```
ai-backend/
├── ai_agent.py           # Main agent with FastAPI + LangServe
├── db_connector.py       # PostgreSQL connection & queries
├── tools.py              # Tool functions & fuzzy matching
├── test_agent.py         # Test suite
├── requirements.txt      # Python dependencies
├── .env                  # Environment configuration
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

### Key Files Explained

#### `ai_agent.py`
- **LLM Initialization**: Sets up Google Gemini
- **Tool Definitions**: Defines 6 inventory query tools
- **Agent Setup**: Creates LangChain agent with tool calling
- **FastAPI Routes**: Provides `/query` endpoint and LangServe UI
- **Error Handling**: Comprehensive error management

#### `db_connector.py`
- **Database Connection**: psycopg2 PostgreSQL integration
- **Query Functions**: Pre-built queries for common operations
- **Fuzzy Matching**: SQL LIKE and similarity-based search
- **Connection Pooling**: Efficient resource management

#### `tools.py`
- **FuzzyMatcher Class**: Similarity ratio calculation
- **Tool Functions**: 6 main inventory query functions
- **Best Match Selection**: Intelligent product matching
- **Response Formatting**: User-friendly output formatting

---

## 🔐 Security Considerations

### Current Implementation (Development)
```python
CORSMiddleware(
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Production Recommendations

```python
# 1. Restrict CORS to specific domains
CORSMiddleware(
    allow_origins=[
        "https://yourdomain.com",
        "https://app.yourdomain.com"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

# 2. Add authentication
from fastapi.security import HTTPBearer
security = HTTPBearer()

@app.post("/query")
async def query_inventory(query: str, token: HTTPAuthCredentials = Depends(security)):
    # Verify token
    pass

# 3. Use environment-specific configs
if os.getenv("NODE_ENV") == "production":
    # Stricter settings
    pass

# 4. Add rate limiting
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

@app.post("/query")
@limiter.limit("100/minute")
async def query_inventory(query: str):
    pass
```

---

## 🐛 Troubleshooting

### Issue: `GEMINI_API_KEY not found`

**Solution**: Make sure `.env` file has the API key:
```dotenv
GEMINI_API_KEY=your_actual_key_here
```

Get a free key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Issue: `Connection refused - Cannot connect to database`

**Solution**: Verify PostgreSQL is running:
```bash
# Check if PostgreSQL is running
psql -h localhost -p 5433 -U postgres -c "SELECT 1"

# If not, start PostgreSQL
# Windows: services.msc → PostgreSQL
# Linux: sudo systemctl start postgresql
# Mac: brew services start postgresql
```

### Issue: `Product not found in inventory`

**Solution**: Check database has sample data:
```bash
# Connect to database
psql -h localhost -p 5433 -U postgres -d stockmaster

# Check products table
SELECT COUNT(*) FROM products;

# If empty, run migrations
\i ../backend/migrations/001_create_tables.sql
\i ../backend/migrations/002_sample_data.sql
```

### Issue: `Agent taking too long to respond`

**Solution**: Check agent iteration limit and LLM timeout:
```python
# In ai_agent.py
agent_executor = AgentExecutor(
    agent=agent,
    tools=tools,
    max_iterations=10,  # ← Adjust if needed
    return_intermediate_steps=True,
)

llm = ChatGoogleGenerativeAI(
    timeout=60,  # ← Increase timeout
)
```

### Issue: `Port 8000 already in use`

**Solution**: Change port in `.env`:
```dotenv
AI_PORT=8001
```

Or kill the process using port 8000:
```bash
# PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess | Stop-Process

# Linux
lsof -ti:8000 | xargs kill -9

# Mac
lsof -ti:8000 | xargs kill -9
```

---

## 📊 Example Queries and Responses

### Example 1: Product Stock Query (Fuzzy Matching)

**Query**: "How much alumminum do we have?"

**Response**:
```
📦 Stock Information for: Aluminium
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SKU Code: ALU-001
Total Stock: 1500 KG
Total Value: $45,000.00
```

### Example 2: Warehouse Location Query

**Query**: "Where is aluminum stored?"

**Response**:
```
🏭 Aluminium - Warehouse Locations
════════════════════════════════════════════════════════════
📍 Main Warehouse → Rack A1
   Quantity: 800 KG
📍 Main Warehouse → Rack B2
   Quantity: 400 KG
📍 Secondary Warehouse → Zone 1
   Quantity: 300 KG
```

### Example 3: Low Stock Alert

**Query**: "What products are running low?"

**Response**:
```
⚠️ Low Stock Alert - Products Below 50 Units
════════════════════════════════════════════════════════════
🔴 Copper Wire (SKU: COP-002)
   Current Stock: 25 units
   Status: CRITICAL - Reorder needed!

🔴 Stainless Steel Sheets (SKU: SS-001)
   Current Stock: 40 units
   Status: CRITICAL - Reorder needed!
```

### Example 4: Warehouse Overview

**Query**: "Show me warehouse inventory summary"

**Response**:
```
🏢 Warehouse Inventory Summary
════════════════════════════════════════════════════════════
📦 Main Warehouse
   Total Products: 45
   Total Units: 5,230
   Total Value: $156,900.00

📦 Secondary Warehouse
   Total Products: 28
   Total Units: 2,100
   Total Value: $63,000.00

════════════════════════════════════════════════════════════
📊 TOTAL: 7,330 units | $219,900.00 value
```

---

## 🚢 Deployment

### Local Development
```bash
python ai_agent.py
```

### Docker (Production)

Create `Dockerfile`:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ENV PYTHONUNBUFFERED=1

CMD ["python", "ai_agent.py"]
```

Build and run:
```bash
docker build -t inventory-ai-agent .
docker run -p 8000:8000 --env-file .env inventory-ai-agent
```

---

## 📚 API Reference

### Endpoints

#### GET `/health`
Health check endpoint

**Response**:
```json
{
  "status": "healthy",
  "service": "Inventory AI Agent",
  "version": "1.0.0"
}
```

#### POST `/query`
Query the AI agent with natural language

**Request**:
```json
{
  "query": "How much aluminum do we have?"
}
```

**Response**:
```json
{
  "query": "How much aluminum do we have?",
  "response": "📦 Stock Information for: Aluminium\n...",
  "success": true
}
```

#### POST `/agent/invoke`
LangServe agent invoke endpoint (advanced)

#### GET `/docs`
Swagger UI documentation

#### GET `/agent/playground`
Interactive LangServe playground

---

## 🤝 Integration with Frontend

### Example React Component

```jsx
import { useState } from 'react';

export function InventoryChat() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuery = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      setResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input 
        value={query} 
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Ask about inventory..."
      />
      <button onClick={handleQuery} disabled={loading}>
        {loading ? 'Loading...' : 'Ask AI'}
      </button>
      <pre>{response}</pre>
    </div>
  );
}
```

---

## 📝 Notes

- **Fuzzy Matching**: Uses `difflib.SequenceMatcher` for flexible product name matching
- **Database Efficiency**: SQL queries use LIKE and similarity for performance
- **Tool Calling**: Gemini automatically selects the best tool for each query
- **Extensibility**: Easy to add more tools by creating new functions and adding them to the agent

---

## 📄 License

This project is part of the Inventory Management System and follows the same license as the main project.

---

## 🙋 Support

For issues or questions:
1. Check the **Troubleshooting** section above
2. Review logs in the terminal running the agent
3. Check that all prerequisites are installed
4. Verify database connection with `psql`

---

**Built with ❤️ using LangChain, Google Gemini, and FastAPI**
