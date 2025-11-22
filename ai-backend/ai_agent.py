import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from langchain_community.utilities import SQLDatabase
import psycopg2
from dotenv import load_dotenv
import logging
import json

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="StockMaster AI Assistant")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------
# 1) Connect to PostgreSQL Database
# --------------------
DB_URL = os.getenv("DB_URL")
if not DB_URL:
    logger.error("DB_URL environment variable not found")
    raise ValueError("Database URL is required")

try:
    # Test database connection
    db = SQLDatabase.from_uri(DB_URL)
    logger.info("✅ Successfully connected to PostgreSQL database")
except Exception as e:
    logger.error(f"❌ Failed to connect to database: {e}")
    raise e

# --------------------
# 2) Configure Gemini AI
# --------------------
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    logger.error("GOOGLE_API_KEY environment variable not found")
    raise ValueError("Google API Key is required")

genai.configure(api_key=GOOGLE_API_KEY)
model = genai.GenerativeModel('gemini-2.5-flash')

# --------------------
# 3) Helper Functions
# --------------------
def get_table_schema():
    """Get database table schema for AI context"""
    try:
        tables = db.get_usable_table_names()
        schema_info = []
        for table in tables:
            try:
                table_info = db.get_table_info([table])
                schema_info.append(f"Table: {table}\n{table_info}")
            except:
                schema_info.append(f"Table: {table}")
        return "\n\n".join(schema_info)
    except Exception as e:
        logger.error(f"Error getting table schema: {e}")
        return "Unable to retrieve table schema"

def execute_sql_query(query):
    """Execute SQL query safely"""
    try:
        # Only allow SELECT queries for safety
        if not query.strip().upper().startswith('SELECT'):
            return "Error: Only SELECT queries are allowed for security reasons."
        
        result = db.run(query)
        return result
    except Exception as e:
        return f"Error executing query: {str(e)}"

def generate_sql_from_question(question, schema):
    """Generate SQL query from natural language question using Gemini"""
    try:
        prompt = f"""
You are a SQL expert for a StockMaster inventory management system. 
Analyze the user question and generate the appropriate SQL query.

DATABASE SCHEMA:
{schema}

USER QUESTION: {question}

Common question types and example queries:
- Stock levels: SELECT * FROM products WHERE stock_quantity < 10 LIMIT 20;
- Product search: SELECT * FROM products WHERE name ILIKE '%keyword%' LIMIT 10;
- Warehouse info: SELECT * FROM warehouses LIMIT 10;
- Recent activity: SELECT * FROM deliveries ORDER BY created_at DESC LIMIT 10;
- Categories: SELECT * FROM categories LIMIT 10;
- Low stock: SELECT name, stock_quantity FROM products WHERE stock_quantity < minimum_stock LIMIT 15;

Rules:
1. ALWAYS generate a valid SELECT query
2. Use proper PostgreSQL syntax with table names like: products, warehouses, categories, deliveries, receipts
3. Include relevant JOINs when needed
4. Always use LIMIT to prevent large results
5. Handle searches with ILIKE for case-insensitive matching
6. For general questions, show relevant data from main tables
7. Return ONLY the SQL query, no markdown or explanation

SQL Query:"""

        response = model.generate_content(prompt)
        sql_query = response.text.strip()
        
        # Clean up the response to extract just the SQL
        if "```sql" in sql_query:
            sql_query = sql_query.split("```sql")[1].split("```")[0].strip()
        elif "```" in sql_query:
            sql_query = sql_query.split("```")[1].strip()
        
        return sql_query
    except Exception as e:
        logger.error(f"Error generating SQL: {e}")
        return None

def format_ai_response(question, sql_query, query_result):
    """Format the final response using Gemini"""
    try:
        # Handle different types of query results
        if isinstance(query_result, str) and query_result.startswith("Error:"):
            return f"I encountered an issue accessing the data: {query_result}. Let me know if you'd like to try a different question."
        
        # If query_result is empty or None
        if not query_result or (isinstance(query_result, list) and len(query_result) == 0):
            return f"I searched for information related to '{question}' but didn't find any matching data. Your inventory might be empty or the search criteria didn't match any records."
        
        prompt = f"""
You are StockMaster AI, a friendly and helpful inventory management assistant. 
A user asked: "{question}"

You executed this SQL query: {sql_query}
The query returned: {query_result}

Please provide a helpful, conversational response that:
1. Answers the user's question clearly and directly
2. Explains what you found in plain, easy-to-understand language
3. Highlights important information (like low stock alerts)
4. Provides actionable insights when relevant
5. Suggests useful next steps when appropriate
6. Use a friendly, professional tone
7. Format numbers and data clearly
8. Use emojis sparingly but appropriately

Keep your response concise but informative. Don't repeat the SQL query.

Response:"""

        response = model.generate_content(prompt)
        ai_answer = response.text.strip()
        
        # If AI response is too generic, provide a more specific response
        if "couldn't understand" in ai_answer.lower() or len(ai_answer) < 20:
            return f"Here's what I found for your question '{question}': {str(query_result)[:500]}{'...' if len(str(query_result)) > 500 else ''}"
        
        return ai_answer
    except Exception as e:
        logger.error(f"Error formatting response: {e}")
        # Provide a fallback response with the raw data
        return f"I found some information for your question about '{question}': {str(query_result)[:300]}{'...' if len(str(query_result)) > 300 else ''}"

# --------------------
# 4) FastAPI Endpoints
# --------------------
class Query(BaseModel):
    question: str
    user_id: int = None

class ChatResponse(BaseModel):
    answer: str
    status: str
    query_time: float = None

@app.get("/")
def root():
    return {
        "message": "🤖 StockMaster AI Assistant is running!", 
        "version": "2.0",
        "database": "Connected to PostgreSQL",
        "endpoints": [
            "/ai/chat - Main chat endpoint",
            "/ai/health - Database health check",
            "/ai/tables - List available tables"
        ]
    }

@app.get("/ai/health")
def health_check():
    """Check database connection and available tables"""
    try:
        tables = db.get_usable_table_names()
        return {
            "status": "healthy",
            "database": "PostgreSQL",
            "tables_available": len(tables),
            "tables": tables[:5]
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail=f"Database health check failed: {str(e)}")

@app.get("/ai/tables")
def get_tables():
    """Get list of available database tables"""
    try:
        tables = db.get_usable_table_names()
        return {"tables": tables, "count": len(tables)}
    except Exception as e:
        logger.error(f"Failed to get tables: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/ai/chat", response_model=ChatResponse)
def ai_chat(q: Query):
    """Main chat endpoint for natural conversation with the AI assistant"""
    try:
        import time
        start_time = time.time()
        
        logger.info(f"Processing question: {q.question}")
        
        # Get database schema
        schema = get_table_schema()
        
        # Generate SQL query from the question
        sql_query = generate_sql_from_question(q.question, schema)
        
        if not sql_query:
            # Provide a helpful response even if SQL generation fails
            return ChatResponse(
                answer="I understand you're asking about your inventory. Let me show you some general information about your products and stock levels. Try asking specific questions like 'show me low stock items' or 'what's in my warehouses'.",
                status="success"
            )
        
        logger.info(f"Generated SQL: {sql_query}")
        
        # Execute the SQL query
        query_result = execute_sql_query(sql_query)
        
        # Format the response
        answer = format_ai_response(q.question, sql_query, query_result)
        
        query_time = round(time.time() - start_time, 2)
        
        logger.info(f"✅ Question processed successfully in {query_time}s")
        logger.info(f"SQL executed: {sql_query}")
        logger.info(f"Query result: {str(query_result)[:200]}...")
        logger.info(f"Final answer: {answer[:100]}...")
        
        return ChatResponse(
            answer=answer,
            status="success",
            query_time=query_time
        )
        
    except Exception as e:
        logger.error(f"❌ Error processing question: {e}")
        return ChatResponse(
            answer=f"I'm sorry, I encountered an error while processing your question. Please try again or rephrase your question.",
            status="error"
        )

# Legacy endpoint for backward compatibility
@app.post("/ai/query")
def ai_query(q: Query):
    """Legacy endpoint - redirects to new chat endpoint"""
    return ai_chat(q)

if __name__ == "__main__":
    import uvicorn
    logger.info("🚀 Starting StockMaster AI Assistant...")
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
