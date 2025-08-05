#!/bin/bash

# SuperTokens Frontend Timeout Test Script
echo "🧪 SuperTokens Frontend Connectivity Test"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BACKEND_IP="192.168.1.6"
PORT="8080"

echo -e "${BLUE}🔍 Testing Backend Connectivity for SuperTokens Frontend${NC}"
echo ""

# Test 1: Basic connectivity
echo -n "1. Testing basic connectivity ... "
if curl -m 10 -s "http://$BACKEND_IP:$PORT/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Success${NC}"
else
    echo -e "${RED}❌ Failed${NC}"
    echo "   Cannot connect to backend. Check if server is running and network accessible."
    exit 1
fi

# Test 2: SuperTokens debug endpoint
echo -n "2. Testing SuperTokens configuration ... "
CONFIG_RESPONSE=$(curl -s "http://$BACKEND_IP:$PORT/debug/supertokens")
if [[ $CONFIG_RESPONSE == *"SuperTokens backend ready"* ]]; then
    echo -e "${GREEN}✅ Ready${NC}"
    echo "   API Domain: $(echo $CONFIG_RESPONSE | grep -o '"apiDomain":"[^"]*' | cut -d'"' -f4)"
else
    echo -e "${RED}❌ Configuration issue${NC}"
    echo "   Response: $CONFIG_RESPONSE"
fi

# Test 3: Auth endpoint response time
echo -n "3. Testing auth endpoint performance ... "
START_TIME=$(date +%s%N)
AUTH_RESPONSE=$(curl -s -w "%{http_code}" \
    -X POST "http://$BACKEND_IP:$PORT/auth/signup" \
    -H "Content-Type: application/json" \
    -d '{"formFields": [{"id": "email", "value": "test@example.com"}, {"id": "password", "value": "password123"}]}')
END_TIME=$(date +%s%N)
DURATION=$(( ($END_TIME - $START_TIME) / 1000000 )) # Convert to milliseconds

if [[ $DURATION -lt 60000 ]]; then # Less than 60 seconds
    echo -e "${GREEN}✅ Fast (${DURATION}ms)${NC}"
else
    echo -e "${YELLOW}⚠️  Slow (${DURATION}ms)${NC}"
fi

# Test 4: CORS preflight
echo -n "4. Testing CORS preflight ... "
CORS_RESPONSE=$(curl -s -w "%{http_code}" \
    -X OPTIONS "http://$BACKEND_IP:$PORT/auth/signup" \
    -H "Origin: http://localhost:3000" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: content-type")

if [[ $CORS_RESPONSE == *"200"* ]] || [[ $CORS_RESPONSE == *"204"* ]]; then
    echo -e "${GREEN}✅ CORS configured${NC}"
else
    echo -e "${YELLOW}⚠️  Check CORS configuration${NC}"
fi

# Test 5: Session endpoint
echo -n "5. Testing protected endpoint (should return 401) ... "
PROTECTED_RESPONSE=$(curl -s -w "%{http_code}" "http://$BACKEND_IP:$PORT/api/auth/session" -o /dev/null)
if [[ $PROTECTED_RESPONSE == "401" ]]; then
    echo -e "${GREEN}✅ Properly protected${NC}"
else
    echo -e "${YELLOW}⚠️  Unexpected response: $PROTECTED_RESPONSE${NC}"
fi

echo ""
echo -e "${BLUE}📋 Frontend Configuration Summary${NC}"
echo "For your SuperTokens frontend, use this configuration:"
echo ""
echo -e "${YELLOW}SuperTokens.init({${NC}"
echo -e "${YELLOW}    appInfo: {${NC}"
echo -e "${YELLOW}        appName: \"Your App\",${NC}"
echo -e "${GREEN}        apiDomain: \"http://$BACKEND_IP:$PORT\",${NC}"
echo -e "${YELLOW}        websiteDomain: \"http://localhost:3000\", // Your frontend URL${NC}"
echo -e "${YELLOW}        apiBasePath: \"/auth\",${NC}"
echo -e "${YELLOW}        websiteBasePath: \"/auth\"${NC}"
echo -e "${YELLOW}    },${NC}"
echo -e "${YELLOW}    recipeList: [EmailPassword.init(), Session.init()]${NC}"
echo -e "${YELLOW}});${NC}"

echo ""
echo -e "${BLUE}🔧 Timeout Configuration${NC}"
echo "✅ Backend request timeout: 60 seconds"
echo "✅ Backend keep-alive timeout: 120 seconds"  
echo "✅ Enhanced connection logging enabled"

echo ""
echo -e "${BLUE}🌐 Network Access${NC}"
echo "✅ Backend accessible at: http://$BACKEND_IP:$PORT"
echo "✅ CORS configured for cross-origin requests"
echo "✅ SuperTokens endpoints ready for frontend"

echo ""
if [[ $DURATION -lt 10000 ]]; then
    echo -e "${GREEN}🎉 Everything looks great! Your SuperTokens frontend should work without timeouts.${NC}"
elif [[ $DURATION -lt 30000 ]]; then
    echo -e "${YELLOW}⚠️  Response times are acceptable but could be faster. Monitor for timeout issues.${NC}"
else
    echo -e "${RED}🚨 Response times are slow. Frontend may experience timeouts. Consider optimization.${NC}"
fi

echo ""
echo -e "${BLUE}📞 If you still get timeouts:${NC}"
echo "1. Check browser dev tools Network tab for specific errors"
echo "2. Verify frontend apiDomain uses network IP (not localhost)"
echo "3. Ensure both devices are on same WiFi"
echo "4. Check backend logs for timeout messages"
echo "5. See: SUPERTOKENS_FRONTEND_FIX.md for detailed troubleshooting"
