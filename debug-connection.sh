#!/bin/bash

# Debug Connection Script for SuperTokens Backend
echo "🔍 SuperTokens Backend Connection Debug"
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get system info
echo -e "${BLUE}🖥️  System Information${NC}"
echo "   OS: $(uname -s)"
echo "   Node Version: $(node --version 2>/dev/null || echo 'Not installed')"
echo "   Current Time: $(date)"
echo ""

# Check if server is running
echo -e "${BLUE}🔍 Server Status${NC}"
SERVER_PID=$(ps aux | grep "node index.js" | grep -v grep | awk '{print $2}')
if [ ! -z "$SERVER_PID" ]; then
    echo -e "   ${GREEN}✅ Server is running (PID: $SERVER_PID)${NC}"
else
    echo -e "   ${RED}❌ Server is not running${NC}"
    echo "   💡 Start with: npm start"
    exit 1
fi

# Get network info
echo -e "${BLUE}🌐 Network Information${NC}"
SYSTEM_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
echo "   Local IP: 127.0.0.1"
echo "   System IP: $SYSTEM_IP"
echo ""

# Test connections with timeouts
echo -e "${BLUE}🧪 Connection Tests${NC}"

# Test 1: Localhost
echo -n "   Testing localhost:8080 ... "
if timeout 5 curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Success${NC}"
    LOCALHOST_TIME=$(curl -w "%{time_total}" -s -o /dev/null http://localhost:8080/health)
    echo "      Response time: ${LOCALHOST_TIME}s"
else
    echo -e "${RED}❌ Failed${NC}"
    echo -e "      ${YELLOW}⚠️  Localhost connection failed${NC}"
fi

# Test 2: Network IP
echo -n "   Testing $SYSTEM_IP:8080 ... "
if timeout 5 curl -s http://$SYSTEM_IP:8080/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Success${NC}"
    NETWORK_TIME=$(curl -w "%{time_total}" -s -o /dev/null http://$SYSTEM_IP:8080/health)
    echo "      Response time: ${NETWORK_TIME}s"
else
    echo -e "${RED}❌ Failed${NC}"
    echo -e "      ${YELLOW}⚠️  Network connection failed${NC}"
fi

# Test 3: Port availability
echo -n "   Testing port 8080 availability ... "
if lsof -i :8080 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Port is in use${NC}"
    PORT_USAGE=$(lsof -i :8080 | grep LISTEN | awk '{print $1 " (PID: " $2 ")"}')
    echo "      Used by: $PORT_USAGE"
else
    echo -e "${RED}❌ Port is not in use${NC}"
fi

# Test SuperTokens endpoints
echo -e "${BLUE}🔐 SuperTokens Endpoint Tests${NC}"

# Test auth endpoint
echo -n "   Testing /auth/signup ... "
SIGNUP_RESPONSE=$(curl -s -w "%{http_code}" -X POST http://localhost:8080/auth/signup \
    -H "Content-Type: application/json" \
    -d '{"formFields": [{"id": "email", "value": "test@example.com"}, {"id": "password", "value": "password123"}]}' \
    -o /dev/null)

if [ "$SIGNUP_RESPONSE" = "200" ] || [ "$SIGNUP_RESPONSE" = "400" ]; then
    echo -e "${GREEN}✅ Endpoint accessible (HTTP $SIGNUP_RESPONSE)${NC}"
else
    echo -e "${RED}❌ Failed (HTTP $SIGNUP_RESPONSE)${NC}"
fi

# Test protected endpoint (should return 401)
echo -n "   Testing protected endpoint ... "
PROTECTED_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:8080/api/protected/profile -o /dev/null)
if [ "$PROTECTED_RESPONSE" = "401" ]; then
    echo -e "${GREEN}✅ Properly protected (HTTP 401)${NC}"
else
    echo -e "${YELLOW}⚠️  Unexpected response (HTTP $PROTECTED_RESPONSE)${NC}"
fi

# Memory and CPU check
echo -e "${BLUE}📊 Resource Usage${NC}"
if command -v top > /dev/null; then
    CPU_USAGE=$(top -l 1 -pid $SERVER_PID | grep "CPU usage" | awk '{print $3}' 2>/dev/null || echo "N/A")
    echo "   Server CPU usage: $CPU_USAGE"
fi

MEMORY_USAGE=$(ps -p $SERVER_PID -o %mem,rss | tail -1 | awk '{print $1 "% (" $2 " KB)"}' 2>/dev/null || echo "N/A")
echo "   Server memory usage: $MEMORY_USAGE"

# Network interface check
echo -e "${BLUE}🔌 Network Interface Status${NC}"
INTERFACE=$(route get default | grep interface | awk '{print $2}' 2>/dev/null || echo "unknown")
echo "   Primary interface: $INTERFACE"

if command -v netstat > /dev/null; then
    CONNECTIONS=$(netstat -an | grep :8080 | grep LISTEN | wc -l | tr -d ' ')
    echo "   Listening connections on port 8080: $CONNECTIONS"
fi

echo ""
echo -e "${BLUE}💡 Troubleshooting Tips${NC}"

if [ "$LOCALHOST_TIME" ] && (( $(echo "$LOCALHOST_TIME > 1.0" | bc -l) )); then
    echo -e "   ${YELLOW}⚠️  Slow response time detected${NC}"
    echo "      Consider restarting the server: pkill -f 'node index.js' && npm start"
fi

echo "   📖 For detailed troubleshooting, see: TIMEOUT_TROUBLESHOOTING.md"
echo "   🧪 Test with Postman using 'SuperTokens Backend - Local' environment"
echo "   🌐 For cross-system access, use 'SuperTokens Backend - Network' environment"
echo ""

# Quick fix suggestions
echo -e "${BLUE}🔧 Quick Fixes${NC}"
echo "   1. Restart server: pkill -f 'node index.js' && npm start"
echo "   2. Change port: PORT=3001 npm start"
echo "   3. Check firewall: sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate"
echo "   4. Test minimal connection: curl -v http://localhost:8080/health"
echo ""
