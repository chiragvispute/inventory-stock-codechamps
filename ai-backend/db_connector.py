"""
Database connector for querying inventory management system
Handles PostgreSQL connections and inventory queries
"""

import psycopg2
from psycopg2 import sql
import os
from dotenv import load_dotenv
from typing import List, Dict, Optional
import logging
from decimal import Decimal
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

load_dotenv()

def convert_decimals(obj):
    """Convert Decimal objects to float for JSON serialization"""
    if isinstance(obj, dict):
        return {k: convert_decimals(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_decimals(item) for item in obj]
    elif isinstance(obj, Decimal):
        return float(obj)
    return obj

class InventoryDBConnector:
    """
    Database connector for inventory management system
    Handles all database operations for inventory queries
    """
    
    def __init__(self):
        """Initialize database connection parameters from environment"""
        self.db_config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'port': int(os.getenv('DB_PORT', 5433)),
            'database': os.getenv('DB_NAME', 'stockmaster'),
            'user': os.getenv('DB_USER', 'postgres'),
            'password': os.getenv('DB_PASSWORD', ''),
        }
        self.connection = None
    
    def connect(self):
        """Establish database connection"""
        try:
            self.connection = psycopg2.connect(**self.db_config)
            logger.info("✅ Database connection established")
            return True
        except psycopg2.Error as e:
            logger.error(f"❌ Database connection failed: {e}")
            return False
    
    def close(self):
        """Close database connection"""
        if self.connection:
            self.connection.close()
            logger.info("Database connection closed")
    
    def execute_query(self, query: str, params: tuple = ()) -> List[Dict]:
        """
        Execute a SQL query and return results
        
        Args:
            query: SQL query string
            params: Query parameters
            
        Returns:
            List of dictionaries containing query results
        """
        try:
            if not self.connection:
                self.connect()
            
            cursor = self.connection.cursor()
            cursor.execute(query, params)
            
            # Get column names
            columns = [desc[0] for desc in cursor.description]
            
            # Fetch all results and convert to list of dicts
            results = []
            for row in cursor.fetchall():
                result_dict = dict(zip(columns, row))
                # Convert Decimals to floats
                result_dict = convert_decimals(result_dict)
                results.append(result_dict)
            
            cursor.close()
            return results
        
        except psycopg2.Error as e:
            # Rollback transaction on error
            if self.connection:
                self.connection.rollback()
            logger.error(f"Query execution error: {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            return []
        
        except psycopg2.Error as e:
            logger.error(f"Query execution error: {e}")
            return []
    
    def get_all_products(self) -> List[Dict]:
        """
        Get all products from the database
        
        Returns:
            List of products with their details
        """
        query = """
            SELECT 
                p.product_id,
                p.name,
                p.sku_code,
                p.unit_of_measure,
                p.per_unit_cost,
                pc.name as category_name
            FROM products p
            LEFT JOIN product_categories pc ON p.category_id = pc.category_id
            ORDER BY p.name
        """
        return self.execute_query(query)
    
    def get_product_by_fuzzy_name(self, product_name: str) -> Optional[Dict]:
        """
        Find a product by fuzzy matching on name
        Uses PostgreSQL similarity for fuzzy matching
        
        Args:
            product_name: Product name to search for
            
        Returns:
            Product details or None if not found
        """
        # First try exact match (case-insensitive)
        query_exact = """
            SELECT 
                product_id,
                name,
                sku_code,
                unit_of_measure,
                per_unit_cost
            FROM products
            WHERE LOWER(name) = LOWER(%s)
            LIMIT 1
        """
        
        results = self.execute_query(query_exact, (product_name,))
        if results:
            return results[0]
        
        # If no exact match, use similarity (requires pg_trgm extension)
        # Falls back to LIKE if similarity not available
        query_fuzzy = """
            SELECT 
                product_id,
                name,
                sku_code,
                unit_of_measure,
                per_unit_cost
            FROM products
            WHERE LOWER(name) LIKE LOWER(%s)
            ORDER BY name
            LIMIT 5
        """
        
        # Build LIKE pattern
        like_pattern = f"%{product_name}%"
        results = self.execute_query(query_fuzzy, (like_pattern,))
        
        return results[0] if results else None
    
    def search_products(self, search_term: str) -> List[Dict]:
        """
        Search for products by name or SKU code
        
        Args:
            search_term: Product name or SKU to search for
            
        Returns:
            List of matching products
        """
        query = """
            SELECT 
                product_id,
                name,
                sku_code,
                unit_of_measure,
                per_unit_cost
            FROM products
            WHERE LOWER(name) LIKE LOWER(%s) 
               OR LOWER(sku_code) LIKE LOWER(%s)
            ORDER BY name
            LIMIT 10
        """
        
        like_pattern = f"%{search_term}%"
        return self.execute_query(query, (like_pattern, like_pattern))
    
    def get_product_stock_level(self, product_id: int) -> Optional[Dict]:
        """
        Get current stock levels for a product across all warehouses
        
        Args:
            product_id: Product ID
            
        Returns:
            Product stock information
        """
        query = """
            SELECT 
                p.product_id,
                p.name,
                p.sku_code,
                p.unit_of_measure,
                COALESCE(SUM(sl.quantity_on_hand), 0) as total_stock,
                COALESCE(SUM(sl.quantity_on_hand * p.per_unit_cost), 0) as total_value
            FROM products p
            LEFT JOIN stock_levels sl ON p.product_id = sl.product_id
            WHERE p.product_id = %s
            GROUP BY p.product_id, p.name, p.sku_code, p.unit_of_measure
        """
        
        results = self.execute_query(query, (product_id,))
        return results[0] if results else None
    
    def get_product_stock_by_warehouse(self, product_id: int) -> List[Dict]:
        """
        Get stock levels for a product by warehouse
        
        Args:
            product_id: Product ID
            
        Returns:
            List of stock levels by warehouse
        """
        query = """
            SELECT 
                w.name as warehouse_name,
                l.name as location_name,
                sl.quantity_on_hand as quantity,
                p.unit_of_measure
            FROM stock_levels sl
            JOIN locations l ON sl.location_id = l.location_id
            JOIN warehouses w ON l.warehouse_id = w.warehouse_id
            JOIN products p ON sl.product_id = p.product_id
            WHERE sl.product_id = %s
            ORDER BY w.name, l.name
        """
        
        return self.execute_query(query, (product_id,))
    
    def get_low_stock_products(self, threshold: int = 50) -> List[Dict]:
        """
        Get products with stock below threshold
        
        Args:
            threshold: Stock level threshold (default 50)
            
        Returns:
            List of low stock products
        """
        query = """
            SELECT 
                p.product_id,
                p.name,
                p.sku_code,
                COALESCE(SUM(sl.quantity_on_hand), 0) as current_stock,
                %s as threshold
            FROM products p
            LEFT JOIN stock_levels sl ON p.product_id = sl.product_id
            GROUP BY p.product_id, p.name, p.sku_code
            HAVING COALESCE(SUM(sl.quantity_on_hand), 0) < %s
            ORDER BY current_stock ASC
        """
        
        return self.execute_query(query, (threshold, threshold))
    
    def get_warehouse_inventory_summary(self) -> List[Dict]:
        """
        Get inventory summary by warehouse
        
        Returns:
            List of warehouse inventory summaries
        """
        query = """
            SELECT 
                w.name as warehouse_name,
                COUNT(DISTINCT sl.product_id) as total_products,
                COALESCE(SUM(sl.quantity_on_hand), 0) as total_units,
                COALESCE(SUM(sl.quantity_on_hand * p.per_unit_cost), 0) as total_value
            FROM warehouses w
            LEFT JOIN locations l ON w.warehouse_id = l.warehouse_id
            LEFT JOIN stock_levels sl ON l.location_id = sl.location_id
            LEFT JOIN products p ON sl.product_id = p.product_id
            GROUP BY w.warehouse_id, w.name
            ORDER BY w.name
        """
        
        return self.execute_query(query)
    
    def get_product_details(self, product_name: str) -> Optional[Dict]:
        """
        Get complete product details including stock information
        
        Args:
            product_name: Product name to search for
            
        Returns:
            Complete product details or None
        """
        # First find the product
        product = self.get_product_by_fuzzy_name(product_name)
        if not product:
            return None
        
        # Get stock levels
        stock_info = self.get_product_stock_level(product['product_id'])
        warehouse_stock = self.get_product_stock_by_warehouse(product['product_id'])
        
        return {
            'product': product,
            'stock_summary': stock_info,
            'warehouse_stock': warehouse_stock
        }
    
    def get_statistics(self) -> Dict:
        """
        Get general inventory statistics
        
        Returns:
            Inventory statistics
        """
        stats = {}
        
        # Total products
        query = "SELECT COUNT(*) as count FROM products"
        result = self.execute_query(query)
        stats['total_products'] = result[0]['count'] if result else 0
        
        # Total stock
        query = "SELECT COALESCE(SUM(quantity), 0) as total FROM stock_levels"
        result = self.execute_query(query)
        stats['total_stock_units'] = result[0]['total'] if result else 0
        
        # Total warehouses
        query = "SELECT COUNT(*) as count FROM warehouses"
        result = self.execute_query(query)
        stats['total_warehouses'] = result[0]['count'] if result else 0
        
        return stats


# Global connector instance
_connector = None

def get_connector() -> InventoryDBConnector:
    """Get or create global database connector instance"""
    global _connector
    if _connector is None:
        _connector = InventoryDBConnector()
        _connector.connect()
    return _connector


def close_connector():
    """Close global connector"""
    global _connector
    if _connector:
        _connector.close()
        _connector = None
