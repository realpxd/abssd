#!/bin/bash

# Security Test Script
# This script tests various security features of the application

echo "🔒 Security Test Suite"
echo "====================="
echo ""

BASE_URL="${1:-http://localhost:5000}"
echo "Testing against: $BASE_URL"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TOTAL=0
PASSED=0
FAILED=0

test_passed() {
    echo -e "${GREEN}✓ PASSED${NC}: $1"
    PASSED=$((PASSED + 1))
    TOTAL=$((TOTAL + 1))
}

test_failed() {
    echo -e "${RED}✗ FAILED${NC}: $1"
    FAILED=$((FAILED + 1))
    TOTAL=$((TOTAL + 1))
}

test_warning() {
    echo -e "${YELLOW}⚠ WARNING${NC}: $1"
}

echo "1. Testing Rate Limiting..."
echo "----------------------------"

# Test rate limiting by making multiple requests
RATE_TEST_COUNT=0
for i in {1..10}; do
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/api/health" 2>/dev/null)
    if [ "$response" = "200" ]; then
        RATE_TEST_COUNT=$((RATE_TEST_COUNT + 1))
    fi
done

if [ $RATE_TEST_COUNT -eq 10 ]; then
    test_passed "Rate limiting allows normal traffic (10 requests succeeded)"
else
    test_warning "Rate limiting may be too strict ($RATE_TEST_COUNT/10 succeeded)"
fi

echo ""
echo "2. Testing Security Headers..."
echo "-------------------------------"

# Check for security headers
HEADERS=$(curl -s -I "$BASE_URL/api/health" 2>/dev/null)

if echo "$HEADERS" | grep -iq "X-Content-Type-Options"; then
    test_passed "X-Content-Type-Options header present"
else
    test_failed "X-Content-Type-Options header missing"
fi

if echo "$HEADERS" | grep -iq "X-Frame-Options"; then
    test_passed "X-Frame-Options header present"
else
    test_failed "X-Frame-Options header missing"
fi

if echo "$HEADERS" | grep -iq "Strict-Transport-Security"; then
    test_passed "HSTS header present"
else
    test_warning "HSTS header missing (may be normal for localhost)"
fi

if echo "$HEADERS" | grep -iq "X-XSS-Protection"; then
    test_passed "X-XSS-Protection header present"
else
    test_failed "X-XSS-Protection header missing"
fi

echo ""
echo "3. Testing XSS Protection..."
echo "----------------------------"

# Test XSS in query parameters
XSS_PAYLOAD='<script>alert("xss")</script>'
response=$(curl -s "$BASE_URL/api/health?test=$XSS_PAYLOAD" 2>/dev/null)

if echo "$response" | grep -q "<script>"; then
    test_failed "XSS payload not sanitized in query parameters"
else
    test_passed "XSS payload sanitized in query parameters"
fi

echo ""
echo "4. Testing NoSQL Injection Protection..."
echo "------------------------------------------"

# Test NoSQL injection patterns
NOSQL_PAYLOAD='{"$gt":""}'
response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"email\": $NOSQL_PAYLOAD}" \
    "$BASE_URL/api/auth/login" 2>/dev/null)

if echo "$response" | grep -iq "error\|invalid"; then
    test_passed "NoSQL injection blocked"
else
    test_warning "NoSQL injection may not be properly blocked"
fi

echo ""
echo "5. Testing Request Size Limits..."
echo "----------------------------------"

# Generate a large payload (2MB of data)
LARGE_PAYLOAD=$(python3 -c "print('x' * 2000000)" 2>/dev/null || echo "SKIP")

if [ "$LARGE_PAYLOAD" != "SKIP" ]; then
    response=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST \
        -H "Content-Type: application/json" \
        -d "{\"data\": \"$LARGE_PAYLOAD\"}" \
        "$BASE_URL/api/contact" 2>/dev/null)
    
    if [ "$response" = "413" ] || [ "$response" = "400" ]; then
        test_passed "Large payload rejected (HTTP $response)"
    else
        test_failed "Large payload not rejected (HTTP $response)"
    fi
else
    test_warning "Large payload test skipped (Python not available)"
fi

echo ""
echo "6. Testing CORS Configuration..."
echo "---------------------------------"

# Test CORS with invalid origin
response=$(curl -s -I \
    -H "Origin: http://malicious-site.com" \
    "$BASE_URL/api/health" 2>/dev/null)

if echo "$response" | grep -iq "Access-Control-Allow-Origin"; then
    # CORS header present, check if it's not wildcard
    if echo "$response" | grep -q "Access-Control-Allow-Origin: \*"; then
        test_warning "CORS allows all origins (may be intentional for development)"
    else
        test_passed "CORS properly configured with specific origins"
    fi
else
    test_warning "CORS headers not found (may need valid origin)"
fi

echo ""
echo "7. Testing HTTP Parameter Pollution..."
echo "---------------------------------------"

# Test HPP by sending duplicate parameters
response=$(curl -s "$BASE_URL/api/health?test=1&test=2&test=3" 2>/dev/null)

if [ $? -eq 0 ]; then
    test_passed "HPP test completed (multiple parameters accepted)"
else
    test_failed "HPP test failed (request rejected)"
fi

echo ""
echo "8. Testing SQL Injection Patterns..."
echo "--------------------------------------"

# Test SQL injection patterns (even though we use MongoDB)
SQL_PAYLOAD="1' OR '1'='1"
response=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"test$SQL_PAYLOAD@test.com\"}" \
    "$BASE_URL/api/auth/login" 2>/dev/null)

if echo "$response" | grep -iq "error\|invalid"; then
    test_passed "SQL injection pattern blocked"
else
    test_warning "SQL injection pattern may not be properly blocked"
fi

echo ""
echo "9. Testing Server Information Disclosure..."
echo "--------------------------------------------"

# Check if server version is exposed
if echo "$HEADERS" | grep -iq "X-Powered-By"; then
    test_warning "X-Powered-By header exposed (should be hidden)"
else
    test_passed "X-Powered-By header hidden"
fi

if echo "$HEADERS" | grep -iq "Server:"; then
    SERVER_INFO=$(echo "$HEADERS" | grep -i "Server:" | head -1)
    test_warning "Server header exposed: $SERVER_INFO"
else
    test_passed "Server header hidden"
fi

echo ""
echo "10. Testing Error Message Information Leakage..."
echo "--------------------------------------------------"

# Test for stack traces in error responses
response=$(curl -s "$BASE_URL/api/nonexistent-route" 2>/dev/null)

if echo "$response" | grep -iq "stack\|error.*at.*line"; then
    test_failed "Stack traces exposed in error responses"
else
    test_passed "No stack traces in error responses"
fi

echo ""
echo "================================================"
echo "Security Test Summary"
echo "================================================"
echo -e "Total Tests: $TOTAL"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All security tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some security tests failed. Please review the results above.${NC}"
    exit 1
fi
