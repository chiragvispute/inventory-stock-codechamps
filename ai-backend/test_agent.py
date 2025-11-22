"""
Test script for the Inventory Management AI Agent
Tests various queries and verifies the agent is working correctly
"""

import requests
import json
from time import sleep

# Configuration
BASE_URL = "http://localhost:8000"
HEALTH_CHECK_URL = f"{BASE_URL}/health"
QUERY_URL = f"{BASE_URL}/query"
AGENT_PLAYGROUND_URL = f"{BASE_URL}/agent/playground"

# Test queries with different variations
TEST_QUERIES = [
    # Product stock queries with variations
    "How much Aluminium do we have?",
    "What's the stock of aluminum?",
    "Show me alumminum inventory",
    
    # Warehouse location queries
    "Where is the aluminum stored?",
    "Which warehouse has aluminum?",
    "Show me aluminum locations",
    
    # Low stock queries
    "What products are running low on stock?",
    "Show me products that need reordering",
    
    # Overview queries
    "Give me warehouse inventory summary",
    "Show me inventory statistics",
    
    # Product discovery
    "What products do we have?",
    "List all products in inventory",
]


def test_health_check():
    """Test if the API is running"""
    print("\n" + "="*60)
    print("🔍 Testing Health Check")
    print("="*60)
    
    try:
        response = requests.get(HEALTH_CHECK_URL)
        print(f"✅ Server is running!")
        print(f"Response: {json.dumps(response.json(), indent=2)}")
        return True
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Make sure it's running on port 8000")
        print("   Run: python ai_agent.py")
        return False


def test_query(query: str):
    """Test a specific query"""
    print(f"\n📝 Query: {query}")
    print("-" * 60)
    
    try:
        response = requests.post(
            QUERY_URL,
            params={"query": query},
            timeout=30
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Response received:")
            print(f"\n{data.get('response', 'No response')}\n")
            return True
        else:
            print(f"❌ Error: {response.status_code}")
            print(f"Details: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ Request timeout - agent took too long to respond")
        return False
    except requests.exceptions.ConnectionError:
        print("❌ Connection error - server not running")
        return False
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        return False


def main():
    """Run all tests"""
    print("\n" + "="*60)
    print("🤖 Inventory AI Agent - Test Suite")
    print("="*60)
    
    # First check if server is running
    if not test_health_check():
        print("\n⚠️  Please start the server first:")
        print("   python ai_agent.py")
        return
    
    print("\n" + "="*60)
    print("🧪 Running Test Queries")
    print("="*60)
    
    # Test each query
    passed = 0
    failed = 0
    
    for i, query in enumerate(TEST_QUERIES, 1):
        print(f"\n[Test {i}/{len(TEST_QUERIES)}]")
        if test_query(query):
            passed += 1
        else:
            failed += 1
        
        # Small delay between requests
        sleep(0.5)
    
    # Print summary
    print("\n" + "="*60)
    print("📊 Test Summary")
    print("="*60)
    print(f"✅ Passed: {passed}")
    print(f"❌ Failed: {failed}")
    print(f"📈 Total: {len(TEST_QUERIES)}")
    
    # Print additional info
    print("\n" + "="*60)
    print("🔗 Available Endpoints")
    print("="*60)
    print(f"📚 API Documentation: {BASE_URL}/docs")
    print(f"🎮 Interactive Playground: {AGENT_PLAYGROUND_URL}")
    print(f"❤️  Health Check: {HEALTH_CHECK_URL}")
    print(f"💬 Query Endpoint: {QUERY_URL}")
    
    print("\n" + "="*60)
    print("✨ Tests Complete!")
    print("="*60)


if __name__ == "__main__":
    main()
