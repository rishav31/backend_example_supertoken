# SuperTokens Frontend Timeout Fix Guide

## 🚨 Issue: SuperTokens Frontend UI Getting Timeout Errors

If your SuperTokens predefined frontend UI is getting timeout errors while the backend works fine in Postman, here's the complete solution.

## ✅ Backend Configuration (FIXED)

The backend has been updated with:
- **Increased timeouts**: 60 seconds request timeout, 120 seconds keep-alive
- **Enhanced debugging**: Detailed connection and timeout logging  
- **Better CORS handling**: Proper cross-origin configuration
- **SuperTokens debugging**: New debug endpoint at `/debug/supertokens`

## 🔧 Frontend Configuration (ACTION REQUIRED)

### 1. Update Your Frontend SuperTokens Init

**React Frontend Example:**
```javascript
// src/config/supertokens.js
import SuperTokens from "supertokens-auth-react";
import EmailPassword from "supertokens-auth-react/recipe/emailpassword";
import Session from "supertokens-auth-react/recipe/session";

SuperTokens.init({
    appInfo: {
        appName: "Your App",
        // 🔥 CRITICAL: Use your network IP, not localhost
        apiDomain: "http://your-ip-address:8080",
        websiteDomain: "http://localhost:3000", // Your frontend URL
        apiBasePath: "/auth",
        websiteBasePath: "/auth"
    },
    recipeList: [
        EmailPassword.init({
            // Increase timeout for slow connections
            useShadowDom: false,
            palette: {
                // Optional: Add custom styling
            }
        }),
        Session.init({
            // Handle session timeouts gracefully
            onHandleEvent: async (context) => {
                if (context.action === "UNAUTHORISED") {
                    console.log("Session expired, redirecting to login");
                }
            }
        })
    ],
    // 🔥 CRITICAL: Add network configuration
    networkInterceptor: (request, userContext) => {
        console.log("SuperTokens request:", request.url);
        return request;
    }
});
```

### 2. Environment-Specific Configuration

Create different configs for different environments:

```javascript
// src/config/supertokens-config.js
const getConfig = () => {
    const isLocalNetwork = window.location.hostname !== 'localhost';
    
    return {
        appInfo: {
            appName: "Your App",
            // Dynamic API domain based on environment
            apiDomain: isLocalNetwork 
                ? "http://your-ip-address:8080"  // Network access
                : "http://localhost:8080",    // Local development
            websiteDomain: window.location.origin,
            apiBasePath: "/auth",
            websiteBasePath: "/auth"
        }
    };
};

SuperTokens.init(getConfig());
```

## 🌐 Network Access Setup

### If Frontend is on Different Device:

1. **Update your .env or config:**
   ```javascript
   // Frontend running on different device
   const BACKEND_URL = "http://your-ip-address:8080"; // Backend device IP
   
   SuperTokens.init({
       appInfo: {
           apiDomain: BACKEND_URL,
           websiteDomain: window.location.origin, // Automatically detects frontend URL
           // ... rest of config
       }
   });
   ```

2. **Handle CORS properly:**
   ```javascript
   // Make sure your frontend URL is added to backend CORS
   // Backend .env should include your frontend device IP:
   // ALLOWED_ORIGINS=http://localhost:3000,http://192.168.1.x:3000
   ```

## 🧪 Testing Steps

### 1. Test Backend Connectivity
```bash
# From your frontend device, test these URLs:
curl http://your-ip-address:8080/health
curl http://your-ip-address:8080/debug/supertokens
```

### 2. Browser Developer Tools
1. Open browser dev tools (F12)
2. Go to Network tab
3. Try to access SuperTokens UI
4. Look for failed requests to `/auth/*` endpoints
5. Check request timing - should be under 60 seconds

### 3. Check SuperTokens Debug Endpoint
Visit: `http://your-ip-address:8080/debug/supertokens` in your browser
Should return:
```json
{
  "status": "OK",
  "message": "SuperTokens backend ready for frontend",
  "configuration": {
    "apiDomain": "http://your-ip-address:8080",
    "websiteDomain": "http://localhost:3000",
    "apiBasePath": "/auth"
  }
}
```

## 🔍 Debugging Timeout Issues

### Frontend Browser Console Debugging:
```javascript
// Add this to your frontend for debugging
SuperTokens.init({
    // ... your config
    networkInterceptor: (request, userContext) => {
        console.log(`🌐 SuperTokens ${request.method} ${request.url}`);
        console.log(`📊 Timeout: ${request.timeout || 'default'}ms`);
        
        // Log when request completes
        const originalThen = request.then;
        request.then = function(...args) {
            console.log(`✅ SuperTokens request completed: ${request.url}`);
            return originalThen.apply(this, args);
        };
        
        return request;
    }
});
```

### Backend Monitoring:
The backend now logs detailed connection info:
- New connections with IP addresses
- Request timeouts with full details  
- Socket errors and timeouts
- SuperTokens session creation

## ⚠️ Common Issues & Solutions

### Issue 1: "Network Error" or "Connection Refused"
**Solution**: Update `apiDomain` in frontend config to use network IP instead of localhost

### Issue 2: CORS Errors
**Solution**: Backend `.env` already updated with network origins. Verify your frontend device IP is included.

### Issue 3: Slow Initial Load
**Solution**: Backend timeouts increased to 60+ seconds. First SuperTokens request may take longer.

### Issue 4: Session Cookies Not Working
**Solution**: 
```javascript
// Make sure credentials are included
SuperTokens.init({
    // ... config
    usesDynamicLoginMethods: false // Disable if causing issues
});
```

## 🚀 Quick Fix Commands

### Backend (Already Applied):
```bash
# Backend is already running with enhanced timeout configuration
# Check logs for connection details
```

### Frontend:
```javascript
// Minimal working config for cross-device testing
SuperTokens.init({
    appInfo: {
        appName: "Test App",
        apiDomain: "http://your-ip-address:8080", // 👈 Use backend network IP
        websiteDomain: window.location.origin, // 👈 Auto-detect frontend
        apiBasePath: "/auth",
        websiteBasePath: "/auth"
    },
    recipeList: [
        EmailPassword.init(),
        Session.init()
    ]
});
```

## 📞 Still Having Issues?

1. **Check backend logs** for connection attempts and timeouts
2. **Run**: `./debug-connection.sh` to test connectivity  
3. **Verify network**: Both devices on same WiFi
4. **Test with curl**: `curl -v http://your-ip-address:8080/auth/signup` 
5. **Browser console**: Look for specific error messages

---

## 📋 Checklist

- [ ] Frontend `apiDomain` uses network IP (`http://your-ip-adddress:8080`)
- [ ] Backend CORS includes frontend device IP
- [ ] Both devices on same WiFi network
- [ ] Backend showing enhanced timeout logs
- [ ] SuperTokens debug endpoint accessible
- [ ] Browser dev tools shows successful `/auth` requests

**The backend is now optimized for SuperTokens frontend connections with 60-120 second timeouts!** 🎉
