# Connection Timeout Troubleshooting Guide

## 🚨 Issue: Connection Timeouts

If you're experiencing connection timeouts when trying to connect to the SuperTokens backend, follow these troubleshooting steps:

## 🔍 Quick Diagnostics

### 1. Verify Server Status
```bash
# Check if server is running
ps aux | grep "node index.js" | grep -v grep

# Test local connection
curl -v --connect-timeout 10 http://localhost:8080/health

# Test network connection
```bash
curl -v --connect-timeout 10 http://your-ip-address:8080/health
```
```

### 2. Check Server Logs
```bash
# If server was started in background, check logs
npm start
# Look for any error messages or timeout warnings
```

## 🛠️ Common Fixes

### Fix 1: Restart the Server
```bash
# Stop the server
pkill -f "node index.js"

# Start fresh
npm start
```

### Fix 2: Check Firewall (macOS)
```bash
# Check if firewall is blocking connections
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# If firewall is on, temporarily disable for testing
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off
```

### Fix 3: Check Port Usage
```bash
# See what's using port 8080
lsof -i :8080

# If something else is using it, kill it
sudo lsof -ti:8080 | xargs sudo kill -9
```

### Fix 4: Network Interface Issues
```bash
# Get all network interfaces
ifconfig

# Test different interfaces
curl http://127.0.0.1:8080/health
curl http://localhost:8080/health
curl http://your-ip-address:8080/health
```

## 🔧 Server Configuration Fixes

### Increase Timeout Settings
Add to `index.js`:
```javascript
// Add after app creation
app.use((req, res, next) => {
    req.setTimeout(30000); // 30 seconds
    res.setTimeout(30000); // 30 seconds
    next();
});

// Set server timeout
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SuperTokens Node Backend running on port ${PORT}`);
});

server.timeout = 30000; // 30 seconds
server.keepAliveTimeout = 65000; // 65 seconds
server.headersTimeout = 66000; // 66 seconds
```

## 📱 Postman Specific Fixes

### 1. Postman Timeout Settings
- Go to Settings (⚙️) → General
- Increase "Request timeout" to 30000ms (30 seconds)
- Enable "Send cookies automatically"

### 2. Postman Proxy Issues
- Go to Settings → Proxy
- Turn off "Global Proxy Configuration"
- Or add localhost to proxy bypass list

### 3. Use Different Postman Environment
- Try "SuperTokens Backend - Local" environment first
- If that works, then try "SuperTokens Backend - Network"

## 🌐 Network-Specific Fixes

### WiFi Connection Issues
```bash
# Restart network interface
sudo ifconfig en0 down
sudo ifconfig en0 up

# Flush DNS
sudo dscacheutil -flushcache
```

### VPN Interference
- Disconnect from VPN temporarily
- Test connection
- If VPN is the issue, add local network to VPN exceptions

## 🧪 Test Commands

### Quick Connection Test
```bash
# Test basic connectivity
telnet localhost 8080
# Should connect immediately

# Test HTTP response
curl -i --connect-timeout 5 http://localhost:8080/health
```

### Test SuperTokens Endpoints
```bash
# Test signup endpoint
curl -X POST http://localhost:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"formFields": [{"id": "email", "value": "test@example.com"}, {"id": "password", "value": "password123"}]}'
```

## 🔄 Server Restart with Better Logging

Create a debug version of the server:

```javascript
// debug-server.js
const express = require('express');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Enhanced logging
app.use((req, res, next) => {
    const start = Date.now();
    console.log(`📥 ${new Date().toISOString()} - ${req.method} ${req.url}`);
    
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`📤 ${new Date().toISOString()} - ${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
    });
    
    next();
});

app.get('/debug', (req, res) => {
    res.json({
        message: 'Debug endpoint working',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🐛 Debug server running on port ${PORT}`);
    console.log(`📍 Local: http://localhost:${PORT}/debug`);
    console.log(`🌐 Network: http://your-ip-address:${PORT}/debug`);
});

server.on('connection', (socket) => {
    console.log('🔌 New connection established');
    socket.on('close', () => {
        console.log('🔌 Connection closed');
    });
});

server.on('timeout', () => {
    console.log('⏰ Server timeout occurred');
});
```

## 🆘 Emergency Steps

If nothing else works:

1. **Complete Reset**:
   ```bash
   # Kill all node processes
   pkill -f node
   
   # Clear npm cache
   npm cache clean --force
   
   # Reinstall dependencies
   rm -rf node_modules package-lock.json
   npm install
   
   # Restart server
   npm start
   ```

2. **Use Different Port**:
   ```bash
   # Try port 3001
   PORT=3001 npm start
   ```

3. **Minimal Test Server**:
   ```javascript
   // minimal-server.js
   const http = require('http');
   
   const server = http.createServer((req, res) => {
       res.writeHead(200, { 'Content-Type': 'application/json' });
       res.end(JSON.stringify({ message: 'Minimal server working' }));
   });
   
   server.listen(8080, () => {
       console.log('Minimal server running on port 8080');
   });
   ```

## 📞 Getting Help

If timeouts persist:
1. Check system resources: `top` or Activity Monitor
2. Check for conflicting applications on port 8080
3. Try running on a different port
4. Test with a different device on the same network

---

**Most Common Fix**: Restart the server with `npm start` and test with `curl` first before using Postman.
