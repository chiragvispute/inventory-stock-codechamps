"""
Tool functions for the LangChain AI agent
These functions use fuzzy matching to handle product name variations
"""

from db_connector import get_connector
from typing import Optional
from difflib import SequenceMatcher
import logging

logger = logging.getLogger(__name__)


class FuzzyMatcher:
    """
    Fuzzy matching utility for handling product name variations
    Handles cases like: aluminum, Aluminum, Aluminium, ALUMINUM etc
    """
    
    @staticmethod
    def similarity_ratio(a: str, b: str) -> float:
        """Calculate similarity ratio between two strings (0-1)"""
        return SequenceMatcher(None, a.lower(), b.lower()).ratio()
    
    @staticmethod
    def find_best_match(search_term: str, candidates: list, 
                       threshold: float = 0.6) -> Optional[dict]:
        """
        Find best matching candidate from list
        
        Args:
            search_term: What user is searching for
            candidates: List of dict items with 'name' key
            threshold: Minimum similarity ratio (0-1)
            
        Returns:
            Best matching candidate or None
        """
        best_match = None
        best_ratio = threshold
        
        for candidate in candidates:
            ratio = FuzzyMatcher.similarity_ratio(
                search_term, 
                candidate.get('name', '')
            )
            if ratio > best_ratio:
                best_ratio = ratio
                best_match = candidate
        
        return best_match


# Tool Functions for LangChain

def query_product_stock(product_name: str) -> str:
    """
    Query the total stock level of a product
    Handles fuzzy matching for product names
    
    Example queries:
    - "How much Aluminium do we have?"
    - "What's the stock of aluminum?"
    - "Show me alumminum inventory"
    
    Args:
        product_name: Product name (case-insensitive, handles typos)
        
    Returns:
        Formatted string with stock information
    """
    try:
        connector = get_connector()
        
        # Search for products matching the name
        search_results = connector.search_products(product_name)
        
        if not search_results:
            return f"❌ Product '{product_name}' not found in inventory. Please check the spelling and try again."
        
        # Use fuzzy matcher to find best match
        best_product = FuzzyMatcher.find_best_match(
            product_name, 
            search_results,
            threshold=0.4
        )
        
        if not best_product:
            # If no fuzzy match but results exist, use first result
            best_product = search_results[0]
        
        # Get detailed stock information
        stock_info = connector.get_product_stock_level(best_product['product_id'])
        
        if not stock_info:
            return f"⚠️ Product '{best_product['name']}' has no stock information recorded."
        
        return f"""
📦 Stock Information for: {best_product['name']}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SKU Code: {best_product['sku_code']}
Total Stock: {stock_info['total_stock']} {best_product['unit_of_measure']}
Total Value: ${stock_info['total_value']:,.2f}
        """
    
    except Exception as e:
        logger.error(f"Error querying product stock: {e}")
        return f"❌ Error retrieving stock information: {str(e)}"


def query_product_by_warehouse(product_name: str) -> str:
    """
    Query stock levels of a product broken down by warehouse and location
    Useful for logistics and fulfillment questions
    
    Example queries:
    - "Where is the aluminium stored?"
    - "Show me alumminum in all warehouses"
    - "Which warehouse has aluminum?"
    
    Args:
        product_name: Product name (fuzzy matched)
        
    Returns:
        Formatted string with warehouse breakdown
    """
    try:
        connector = get_connector()
        
        # Find the product
        search_results = connector.search_products(product_name)
        if not search_results:
            return f"❌ Product '{product_name}' not found in inventory."
        
        best_product = FuzzyMatcher.find_best_match(
            product_name,
            search_results,
            threshold=0.4
        ) or search_results[0]
        
        # Get warehouse breakdown
        warehouse_stock = connector.get_product_stock_by_warehouse(
            best_product['product_id']
        )
        
        if not warehouse_stock:
            return f"⚠️ Product '{best_product['name']}' has no warehouse stock information."
        
        result = f"🏭 {best_product['name']} - Warehouse Locations\n"
        result += "━" * 60 + "\n"
        
        for stock in warehouse_stock:
            result += f"📍 {stock['warehouse_name']} → {stock['location_name']}\n"
            result += f"   Quantity: {stock['quantity']} {stock['unit_of_measure']}\n"
        
        return result
    
    except Exception as e:
        logger.error(f"Error querying warehouse stock: {e}")
        return f"❌ Error retrieving warehouse information: {str(e)}"


def query_low_stock_products(threshold: int = 50) -> str:
    """
    Query products that have stock below a certain threshold
    Useful for inventory management and reordering
    
    Example queries:
    - "What products are running low on stock?"
    - "Show me products with less than 50 units"
    - "Which items need reordering?"
    
    Args:
        threshold: Stock level threshold (default: 50 units)
        
    Returns:
        Formatted string with low stock products
    """
    try:
        connector = get_connector()
        
        low_stock = connector.get_low_stock_products(threshold)
        
        if not low_stock:
            return f"✅ All products have stock above {threshold} units threshold."
        
        result = f"⚠️ Low Stock Alert - Products Below {threshold} Units\n"
        result += "━" * 60 + "\n"
        
        for product in low_stock:
            result += f"🔴 {product['name']} (SKU: {product['sku_code']})\n"
            result += f"   Current Stock: {product['current_stock']} units\n"
            result += f"   Status: CRITICAL - Reorder needed!\n\n"
        
        return result
    
    except Exception as e:
        logger.error(f"Error querying low stock products: {e}")
        return f"❌ Error retrieving low stock information: {str(e)}"


def query_warehouse_summary() -> str:
    """
    Query inventory summary across all warehouses
    Provides overview of inventory distribution
    
    Example queries:
    - "Show me warehouse inventory summary"
    - "How much inventory do we have in each warehouse?"
    - "Total inventory overview"
    
    Returns:
        Formatted string with warehouse summaries
    """
    try:
        connector = get_connector()
        
        warehouses = connector.get_warehouse_inventory_summary()
        
        if not warehouses:
            return "⚠️ No warehouse information available."
        
        result = "🏢 Warehouse Inventory Summary\n"
        result += "━" * 60 + "\n"
        
        total_units = 0
        total_value = 0
        
        for warehouse in warehouses:
            result += f"📦 {warehouse['warehouse_name']}\n"
            result += f"   Total Products: {warehouse['total_products']}\n"
            result += f"   Total Units: {warehouse['total_units']}\n"
            result += f"   Total Value: ${warehouse['total_value']:,.2f}\n\n"
            
            total_units += warehouse['total_units']
            total_value += warehouse['total_value']
        
        result += "━" * 60 + "\n"
        result += f"📊 TOTAL: {total_units} units | ${total_value:,.2f} value\n"
        
        return result
    
    except Exception as e:
        logger.error(f"Error querying warehouse summary: {e}")
        return f"❌ Error retrieving warehouse summary: {str(e)}"


def query_general_statistics() -> str:
    """
    Query general inventory statistics
    Provides quick overview of the entire inventory system
    
    Example queries:
    - "Give me inventory statistics"
    - "How many products do we have?"
    - "Total inventory overview"
    
    Returns:
        Formatted string with statistics
    """
    try:
        connector = get_connector()
        
        stats = connector.get_statistics()
        
        result = "📊 Inventory System Statistics\n"
        result += "━" * 60 + "\n"
        result += f"📦 Total Products: {stats['total_products']}\n"
        result += f"📍 Total Units in Stock: {stats['total_stock_units']}\n"
        result += f"🏢 Total Warehouses: {stats['total_warehouses']}\n"
        
        return result
    
    except Exception as e:
        logger.error(f"Error querying statistics: {e}")
        return f"❌ Error retrieving statistics: {str(e)}"


def list_all_products() -> str:
    """
    List all products in the inventory
    Useful for discovery and browsing
    
    Example queries:
    - "What products do we have?"
    - "Show me all inventory items"
    - "List all products"
    
    Returns:
        Formatted string with all products
    """
    try:
        connector = get_connector()
        
        products = connector.get_all_products()
        
        if not products:
            return "⚠️ No products found in inventory."
        
        result = "📋 All Products in Inventory\n"
        result += "━" * 60 + "\n"
        
        for i, product in enumerate(products, 1):
            result += f"{i}. {product['name']}\n"
            result += f"   SKU: {product['sku_code']}\n"
            result += f"   Unit: {product['unit_of_measure']}\n"
            if product['category_name']:
                result += f"   Category: {product['category_name']}\n"
            result += "\n"
        
        return result
    
    except Exception as e:
        logger.error(f"Error listing products: {e}")
        return f"❌ Error retrieving products: {str(e)}"


# Tool definitions for LangChain
TOOLS = [
    {
        "name": "query_product_stock",
        "description": "Query the total stock level of a product. Handles fuzzy matching of product names. Use this when user asks 'how much [product] do we have' or similar questions.",
        "func": query_product_stock,
        "input_schema": {
            "type": "object",
            "properties": {
                "product_name": {
                    "type": "string",
                    "description": "The name of the product to query (case-insensitive, supports variations like 'aluminum', 'Aluminum', 'Aluminium')"
                }
            },
            "required": ["product_name"]
        }
    },
    {
        "name": "query_product_by_warehouse",
        "description": "Query stock levels of a product broken down by warehouse and location. Use this when user asks where a product is located or stored.",
        "func": query_product_by_warehouse,
        "input_schema": {
            "type": "object",
            "properties": {
                "product_name": {
                    "type": "string",
                    "description": "The name of the product to query"
                }
            },
            "required": ["product_name"]
        }
    },
    {
        "name": "query_low_stock_products",
        "description": "Query products with stock below a threshold. Use this when user asks about reordering or low inventory.",
        "func": query_low_stock_products,
        "input_schema": {
            "type": "object",
            "properties": {
                "threshold": {
                    "type": "integer",
                    "description": "Stock level threshold (default: 50 units)"
                }
            },
            "required": []
        }
    },
    {
        "name": "query_warehouse_summary",
        "description": "Query inventory summary across all warehouses. Use this when user asks for overview of warehouse inventory.",
        "func": query_warehouse_summary,
        "input_schema": {
            "type": "object",
            "properties": {}
        }
    },
    {
        "name": "query_general_statistics",
        "description": "Query general inventory statistics like total products, total stock units, and number of warehouses.",
        "func": query_general_statistics,
        "input_schema": {
            "type": "object",
            "properties": {}
        }
    },
    {
        "name": "list_all_products",
        "description": "List all products in the inventory system. Use this when user wants to see available products.",
        "func": list_all_products,
        "input_schema": {
            "type": "object",
            "properties": {}
        }
    }
]
