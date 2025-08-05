#!/bin/bash

# Dynamic IP Detection & Backend Starter Script
# This script automatically detects your network IP and starts the backend

echo "🔍 Detecting network IP address..."

# Get current network IP
NETWORK_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')

if [ -z "$NETWORK_IP" ]; then
    echo "❌ Could not detect network IP. Using localhost."
    NETWORK_IP="localhost"
else
    echo "✅ Detected network IP: $NETWORK_IP"
fi

echo ""
echo "🚀 Starting SuperTokens backend with dynamic configuration..."
echo "   📡 Network IP: $NETWORK_IP"
echo "   🔌 Port: 8080"
echo "   🌐 Access URLs:"
echo "      - Local: http://localhost:8080"
echo "      - Network: http://$NETWORK_IP:8080"
echo ""

# Start the backend
node index.js
