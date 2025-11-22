#!/bin/bash

# API Testing Script for Inventory Stock Management
# This script tests the main API endpoints to ensure frontend-backend connectivity

BASE_URL="http://localhost:5001"
TEST_USER_LOGIN="testuser"
TEST_USER_PASSWORD="testpass"

echo "🧪 Starting API Testing..."
echo "==============================="

# Step 1: Test server health
echo "1️⃣ Testing server health..."
response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api")
if [ "$response" = "200" ]; then
    echo "✅ Server is running"
else
    echo "❌ Server is not responding (HTTP $response)"
    exit 1
fi

# Step 2: Test login and get token
echo ""
echo "2️⃣ Testing user authentication..."
login_response=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"loginId\":\"$TEST_USER_LOGIN\",\"password\":\"$TEST_USER_PASSWORD\"}")

# Extract token
token=$(echo "$login_response" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$token" ]; then
    echo "✅ Authentication successful"
    echo "🔑 Token: ${token:0:20}..."
else
    echo "❌ Authentication failed"
    echo "Response: $login_response"
    exit 1
fi

# Step 3: Test protected endpoints
echo ""
echo "3️⃣ Testing protected endpoints..."

# Test stock endpoint
echo "📦 Testing stock endpoint..."
stock_response=$(curl -s -H "Authorization: Bearer $token" "$BASE_URL/api/stock")
stock_count=$(echo "$stock_response" | grep -o '"product_id"' | wc -l)

if [ "$stock_count" -gt 0 ]; then
    echo "✅ Stock endpoint working (Found $stock_count items)"
else
    echo "⚠️  Stock endpoint returned empty or error"
    echo "Response: $stock_response"
fi

# Test products endpoint
echo "🏷️  Testing products endpoint..."
products_response=$(curl -s -H "Authorization: Bearer $token" "$BASE_URL/api/products")
products_count=$(echo "$products_response" | grep -o '"product_id"' | wc -l)

if [ "$products_count" -gt 0 ]; then
    echo "✅ Products endpoint working (Found $products_count items)"
else
    echo "⚠️  Products endpoint returned empty or error"
    echo "Response: $products_response"
fi

# Test search functionality
echo "🔍 Testing search functionality..."
search_response=$(curl -s -H "Authorization: Bearer $token" "$BASE_URL/api/products?search=chair")
search_count=$(echo "$search_response" | grep -o '"product_id"' | wc -l)

if [ "$search_count" -gt 0 ]; then
    echo "✅ Search functionality working (Found $search_count items)"
else
    echo "⚠️  Search returned no results"
    echo "Response: $search_response"
fi

# Step 4: Test stock update
echo ""
echo "4️⃣ Testing stock update functionality..."
update_response=$(curl -s -X POST "$BASE_URL/api/stock" \
    -H "Authorization: Bearer $token" \
    -H "Content-Type: application/json" \
    -d "{\"productId\":1,\"locationId\":1,\"quantityOnHand\":100,\"quantityFreeToUse\":95}")

if echo "$update_response" | grep -q "product_id"; then
    echo "✅ Stock update working"
else
    echo "⚠️  Stock update may have issues"
    echo "Response: $update_response"
fi

echo ""
echo "==============================="
echo "🎉 API Testing Complete!"
echo ""
echo "💡 To test manually:"
echo "1. Open http://localhost:5173 in your browser"
echo "2. Login with: $TEST_USER_LOGIN / $TEST_USER_PASSWORD"
echo "3. Navigate to Stock tab to see data from database"
echo ""
echo "🔧 Troubleshooting:"
echo "- Ensure both backend (port 5001) and frontend (port 5173) are running"
echo "- Check database connection in backend console"
echo "- Verify CORS settings if you see browser errors"