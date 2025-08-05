#!/bin/bash

# Network Connectivity Test Script for SuperTokens Backend
# This script helps test cross-system connectivity

echo "🌐 SuperTokens Backend Network Connectivity Test"
echo "================================================="

# Get system IP
echo "📍 Getting your system's network IP..."
SYSTEM_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
echo "   System IP: $SYSTEM_IP"

# Check if backend is running locally
echo ""
echo "🔍 Checking if backend is running locally..."
if curl -s http://localhost:8080/health > /dev/null; then
    echo "   ✅ Backend is running on localhost:8080"
else
    echo "   ❌ Backend is not running. Start with: npm start"
    exit 1
fi

# Check if backend is accessible via network IP
echo ""
echo "🌍 Checking if backend is accessible via network IP..."
if curl -s http://$SYSTEM_IP:8080/health > /dev/null; then
    echo "   ✅ Backend is accessible at http://$SYSTEM_IP:8080"
    echo "   🎉 Other devices on your WiFi can connect to: http://$SYSTEM_IP:8080"
else
    echo "   ❌ Backend is not accessible via network IP"
    echo "   💡 This might be due to firewall settings"
fi

# Test a sample endpoint
echo ""
echo "🧪 Testing sample endpoint..."
RESPONSE=$(curl -s http://$SYSTEM_IP:8080/api/public/hello)
if [ ! -z "$RESPONSE" ]; then
    echo "   ✅ Sample endpoint working: $RESPONSE"
else
    echo "   ❌ Sample endpoint not responding"
fi

echo ""
echo "📋 Configuration Summary:"
echo "   Backend URL for other devices: http://$SYSTEM_IP:8080"
echo "   Frontend should use: http://$SYSTEM_IP:8080"
echo "   Postman environment: SuperTokens Backend - Network"
echo ""
echo "🔧 Next Steps:"
echo "   1. Use the network IP in your frontend configuration"
echo "   2. Update SuperTokens init with apiDomain: 'http://$SYSTEM_IP:8080'"
echo "   3. Use the Network environment in Postman for testing"
echo ""
