"""
Quick debug script to test database connection and queries
"""
import sys
sys.path.insert(0, '.')

from db_connector import get_connector
import json

print("=" * 60)
print("🔍 Testing Database Connection & Queries")
print("=" * 60)

try:
    connector = get_connector()
    
    # Test 1: Get all products
    print("\n[Test 1] Fetching all products...")
    products = connector.get_all_products()
    print(f"✅ Found {len(products)} products:")
    for p in products:
        print(f"   - {p['name']} (ID: {p['product_id']}, SKU: {p['sku_code']})")
    
    # Test 2: Search for a product
    print("\n[Test 2] Searching for 'laptop'...")
    results = connector.search_products('laptop')
    print(f"✅ Found {len(results)} results:")
    for r in results:
        print(f"   - {r['name']}")
    
    # Test 3: Get stock for a product
    if products:
        print(f"\n[Test 3] Getting stock level for '{products[0]['name']}'...")
        stock = connector.get_product_stock_level(products[0]['product_id'])
        print(f"✅ Stock info: {json.dumps(stock, indent=2)}")
    
    # Test 4: Get low stock products
    print("\n[Test 4] Fetching low stock products...")
    low_stock = connector.get_low_stock_products(threshold=50)
    print(f"✅ Found {len(low_stock)} low stock products:")
    for item in low_stock:
        print(f"   - {item['name']}: {item['current_stock']} units")
    
    # Test 5: Get warehouse summary
    print("\n[Test 5] Getting warehouse summary...")
    summary = connector.get_warehouse_inventory_summary()
    print(f"✅ Warehouse summary: {json.dumps(summary, indent=2)}")
    
    print("\n" + "=" * 60)
    print("✅ All tests completed successfully!")
    print("=" * 60)
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    import traceback
    traceback.print_exc()
