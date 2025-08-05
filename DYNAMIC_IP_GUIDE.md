# 🌐 Dynamic IP Configuration Guide

## Problem Solved ✅

Your IP address keeps changing, making it difficult to maintain consistent network access for cross-system testing. This solution **automatically detects and configures your current network IP** every time you start the backend.

## How It Works 🔧

### Automatic IP Detection
The backend now includes dynamic IP detection that:

1. **Detects your current network IP** using Node.js `os.networkInterfaces()`
2. **Sets `API_DOMAIN` environment variable** dynamically
3. **Creates CORS origins** for multiple ports (3000-3003)
4. **Logs network configuration** on startup for easy reference

### Key Changes Made

#### 1. Enhanced `index.js`
- Added `getNetworkIP()` function
- Dynamic `process.env.API_DOMAIN` setting
- Automatic CORS origin generation
- Startup logging with current IP

#### 2. Updated `.env` File
- Removed hardcoded IP addresses
- Added comments explaining dynamic behavior
- Simplified CORS configuration

#### 3. New Utility Scripts
- `update-ip.js` - Updates Postman environment files
- `start-dynamic.sh` - Convenient startup script with IP detection

## Usage 🚀

### Method 1: Standard Start (Recommended)
```bash
npm start
```
The backend automatically detects and uses your current IP.

### Method 2: Using Dynamic Start Script
```bash
./start-dynamic.sh
# or
npm run start:dynamic
```

### Method 3: Update Postman Environments
```bash
node update-ip.js
# or
npm run ip
```

## What You'll See 👀

When starting the backend, you'll see:

```
🌐 Network Configuration:
   Current IP: 192.168.1.5
   API Domain: http://192.168.1.5:8080
   Allowed CORS Origins:
     - http://localhost:3000
     - http://localhost:3001
     - http://192.168.1.5:3000
     - http://192.168.1.5:3001
     - http://192.168.1.5:3002
     - http://192.168.1.5:3003

🔧 Initializing SuperTokens with configuration:
   API Domain: http://192.168.1.5:8080
   Website Domain: http://localhost:3000
   SuperTokens URI: https://try.supertokens.com

🚀 SuperTokens Node Backend running on port 8080
📊 Health check: http://localhost:8080/health
🔐 Auth endpoints: http://localhost:8080/auth
📁 API endpoints: http://localhost:8080/api
🌍 Environment: development
🌐 Network access: http://192.168.1.5:8080
```

## Frontend Configuration 💻

### For React/Next.js Apps
Your frontend SuperTokens configuration can now use:

```javascript
SuperTokens.init({
    appInfo: {
        appName: "Your App",
        apiDomain: "http://192.168.1.5:8080", // Use the IP shown in backend logs
        websiteDomain: window.location.origin,
        apiBasePath: "/auth",
        websiteBasePath: "/auth"
    },
    // ... rest of config
});
```

### For API Calls
```javascript
const API_BASE = "http://192.168.1.5:8080/api"; // Use current IP from logs
```

## Postman Testing 📬

### Automatic Environment Update
```bash
npm run ip
```
This updates `SuperTokens-Backend-Network.postman_environment.json` with your current IP.

### Manual Testing
Use the network URL shown in the startup logs:
- Health: `http://192.168.1.5:8080/health`
- Auth: `http://192.168.1.5:8080/auth/signin`
- API: `http://192.168.1.5:8080/api/protected/profile`

## Benefits 🎯

✅ **No more manual IP updates** - Everything is automatic  
✅ **Works with changing IPs** - Perfect for DHCP networks  
✅ **Multiple device testing** - CORS configured for various ports  
✅ **Easy debugging** - Clear logging of network configuration  
✅ **Postman integration** - Automatic environment updates  
✅ **Future-proof** - Works regardless of network changes  

## Troubleshooting 🔧

### IP Detection Issues
If automatic detection fails, check:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

### Network Access Problems
1. Ensure both devices are on the same WiFi network
2. Check firewall settings
3. Verify the IP shown in startup logs
4. Test with: `curl http://YOUR-IP:8080/health`

### CORS Issues
The system automatically adds CORS origins for:
- `localhost:3000-3003` (local development)
- `your-ip:3000-3003` (network access)

Add additional origins to `.env` `ALLOWED_ORIGINS` if needed.

## Advanced Usage 🔬

### Custom IP Detection
Modify the `getNetworkIP()` function in `index.js` to customize IP selection logic.

### Additional CORS Origins
Add to `.env`:
```properties
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://custom-domain:3000
```

### Multiple Network Interfaces
The system automatically selects the first non-loopback IPv4 address. Modify `getNetworkIP()` for different selection criteria.

---

## Summary 📝

Your backend now automatically handles IP changes! Simply start with `npm start` and use the network IP shown in the logs for cross-system testing. No more manual configuration needed! 🎉
