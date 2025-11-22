"""
Inventory Management AI Agent - LLM-Based Tool Selection
Uses LangChain with Google Gemini to understand queries and select appropriate tools
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import uvicorn
import logging
import json
from tools import (
    query_product_stock,
    query_product_by_warehouse,
    query_low_stock_products,
    query_warehouse_summary,
    query_general_statistics,
    list_all_products
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
AI_PORT = int(os.getenv('AI_PORT', 8000))

if not GEMINI_API_KEY:
    logger.error("❌ GEMINI_API_KEY not found in environment variables!")
    raise ValueError("GEMINI_API_KEY is required")


# ============================================================================
# INITIALIZE LLM
# ============================================================================

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0,
    max_tokens=1000,
    timeout=30,
    max_retries=2,
    google_api_key=GEMINI_API_KEY
)

logger.info("✅ LLM initialized: Google Gemini 2.5 Flash")


# ============================================================================
# TOOL SELECTION WITH LLM
# ============================================================================

TOOL_SELECTOR_PROMPT = """You are an inventory management assistant. Analyze the user's query and determine which tool to use.

Available tools:
1. "list_products" - Use when user asks for all products, product list, or what products exist
2. "product_stock" - Use when user asks about stock level of a specific product (e.g., "how much X do we have", "stock of X")
3. "product_location" - Use when user asks where a product is stored or which warehouse has it
4. "low_stock" - Use when user asks about low stock items, products that need reordering, or stock below threshold
5. "warehouse_summary" - Use when user asks for warehouse overview, inventory summary by warehouse, or warehouse statistics
6. "general_stats" - Use when user asks for general statistics, total inventory, or overall inventory information

USER QUERY: {query}

Respond with ONLY a JSON object (no markdown, no code blocks):
{{
  "tool": "tool_name_here",
  "product_name": "product name if needed, otherwise null",
  "reason": "brief explanation"
}}

Examples:
- "What products do we have?" → {{"tool": "list_products", "product_name": null, "reason": "User wants product list"}}
- "How much aluminum?" → {{"tool": "product_stock", "product_name": "aluminum", "reason": "User asks for specific product stock"}}
- "Where is copper stored?" → {{"tool": "product_location", "product_name": "copper", "reason": "User asks for product location"}}
- "Low stock items?" → {{"tool": "low_stock", "product_name": null, "reason": "User asks for low stock products"}}
- "Warehouse summary" → {{"tool": "warehouse_summary", "product_name": null, "reason": "User asks for warehouse overview"}}
- "How many products total?" → {{"tool": "general_stats", "product_name": null, "reason": "User asks for statistics"}}
"""


def select_tool_with_llm(user_query: str) -> dict:
    """
    Use LLM to analyze query and select appropriate tool
    """
    try:
        prompt = ChatPromptTemplate.from_template(TOOL_SELECTOR_PROMPT)
        chain = prompt | llm | StrOutputParser()
        
        response = chain.invoke({"query": user_query})
        
        # Parse JSON response
        # Remove markdown code blocks if present
        response = response.strip()
        if response.startswith("```"):
            response = response.split("```")[1]
            if response.startswith("json"):
                response = response[4:]
        response = response.strip()
        
        tool_selection = json.loads(response)
        return tool_selection
    
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse LLM response: {e}")
        return {"tool": "list_products", "product_name": None, "reason": "Error parsing response"}
    except Exception as e:
        logger.error(f"Tool selection error: {e}")
        return {"tool": "list_products", "product_name": None, "reason": "Error selecting tool"}


def execute_tool(tool_name: str, product_name: str = None) -> str:
    """
    Execute the selected tool
    """
    try:
        if tool_name == "list_products":
            return list_all_products()
        
        elif tool_name == "product_stock":
            if not product_name:
                return "❌ Please specify which product you want to check the stock for."
            return query_product_stock(product_name)
        
        elif tool_name == "product_location":
            if not product_name:
                return "❌ Please specify which product you want to find."
            return query_product_by_warehouse(product_name)
        
        elif tool_name == "low_stock":
            return query_low_stock_products()
        
        elif tool_name == "warehouse_summary":
            return query_warehouse_summary()
        
        elif tool_name == "general_stats":
            return query_general_statistics()
        
        else:
            return f"❌ Unknown tool: {tool_name}"
    
    except Exception as e:
        logger.error(f"Tool execution error: {e}")
        return f"❌ Error executing tool: {str(e)}"


# ============================================================================
# SETUP FASTAPI APP
# ============================================================================

app = FastAPI(
    title="Inventory Management AI Agent",
    description="AI-powered inventory chatbot using LangChain & Google Gemini",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """Root endpoint with service info"""
    return {
        "name": "Inventory AI Agent",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "Inventory AI Agent",
        "version": "1.0.0"
    }


@app.post("/query")
async def query_inventory(query: str):
    """
    Query the inventory system with natural language.
    The LLM analyzes the query and automatically selects the right tool.
    
    Query Examples:
    - "What products do we have?"
    - "How much aluminum do we have?"
    - "Where is copper stored?"
    - "Show me low stock items"
    - "Give me warehouse summary"
    - "What are the statistics?"
    
    Args:
        query: Natural language question about inventory
        
    Returns:
        Response from inventory system
    """
    try:
        if not query or len(query.strip()) == 0:
            raise HTTPException(status_code=400, detail="Query cannot be empty")
        
        logger.info(f"📝 Processing query: {query}")
        
        # Step 1: Use LLM to select tool
        logger.info("🧠 Analyzing query with LLM...")
        tool_selection = select_tool_with_llm(query)
        logger.info(f"🔧 Selected tool: {tool_selection['tool']} | Reason: {tool_selection['reason']}")
        
        # Step 2: Execute the selected tool
        response = execute_tool(tool_selection['tool'], tool_selection.get('product_name'))
        
        return {
            "query": query,
            "response": response,
            "tool_used": tool_selection['tool'],
            "success": True
        }
    
    except Exception as e:
        logger.error(f"❌ Error processing query: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error processing query: {str(e)}"
        )


if __name__ == "__main__":
    logger.info(f"🚀 Starting Inventory AI Agent on port {AI_PORT}")
    logger.info(f"📚 API docs: http://localhost:{AI_PORT}/docs")
    logger.info(f"⏹️  Press Ctrl+C to stop")
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=AI_PORT,
        log_level="info"
    )