# SuperTokens Frontend Timeout Fix Guide

## 🚨 Issue: Frontend UI Getting Timeout Error

When the SuperTokens predefined frontend UI times out while connecting to your backend, it's usually due to configuration mismatches between frontend and backend.

## 🔧 Backend Configuration Fix

### 1. Updated SuperTokens Config
The backend has been updated to use a configurable API domain:

```javascript
// config/supertokens.js
appInfo: {
    apiDomain: process.env.API_DOMAIN || `http://localhost:${process.env.PORT || 8080}`,
    websiteDomain: process.env.APP_WEBSITE_URL || "http://localhost:3000",
    // ...
}
```

### 2. Updated Environment Variables
```bash
# .env
API_DOMAIN=http://your-ip-address:8080  # Use your network IP
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://your-ip-address:3000,http://your-ip-address:3001
```

## 🌐 Frontend Configuration Fix

### For React Frontend

Update your SuperTokens frontend configuration:

```javascript
// src/config/supertokens.js
import SuperTokens from "supertokens-auth-react";
import EmailPassword from "supertokens-auth-react/recipe/emailpassword";
import Session from "supertokens-auth-react/recipe/session";

SuperTokens.init({
    appInfo: {
        appName: "Your App Name",
        apiDomain: "http://your-ip-address:8080",  // 👈 Backend network IP
        websiteDomain: window.location.origin, // 👈 Dynamic frontend URL
        apiBasePath: "/auth",
        websiteBasePath: "/auth"
    },
    recipeList: [
        EmailPassword.init({
            // Additional config if needed
        }),
        Session.init({
            // Enable automatic token refresh
            tokenTransferMethod: "cookie",
        })
    ]
});
```

### For Vanilla JavaScript Frontend

```javascript
// frontend config
window.supertokensUIInit("supertokensui", {
    appInfo: {
        appName: "Your App Name",
        apiDomain: "http://your-ip-address:8080",  // 👈 Backend network IP
        websiteDomain: window.location.origin,
        apiBasePath: "/auth",
        websiteBasePath: "/auth"
    },
    recipeList: [
        window.supertokensUIEmailPassword.init(),
        window.supertokensUISession.init()
    ]
});
```

## 🧪 Testing Steps

### 1. Restart Backend with New Config
```bash
# Stop current server
pkill -f "node index.js"

# Start with new configuration
npm start
```

### 2. Verify Backend Configuration
```bash
curl http://your-ip-address:8080/health
# Should return 200 OK

curl -X POST http://your-ip-address:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"formFields": [{"id": "email", "value": "test@example.com"}, {"id": "password", "value": "password123"}]}'
# Should return 200 or specific SuperTokens response
```

### 3. Test Frontend Connection
Open your browser's Developer Tools (F12) and check:

1. **Network Tab**: Look for failed requests to your backend
2. **Console Tab**: Look for CORS errors or connection errors
3. **Application Tab**: Check if cookies are being set properly

## 🔍 Common Issues & Solutions

### Issue 1: CORS Errors
**Symptoms**: Console shows CORS errors
**Solution**: 
```bash
# Update ALLOWED_ORIGINS in .env
ALLOWED_ORIGINS=http://localhost:3000,http://your-frontend-ip:3000
```

### Issue 2: Wrong API Domain
**Symptoms**: Network requests go to localhost instead of network IP
**Solution**: Update frontend config `apiDomain` to use network IP

### Issue 3: Cookie/Session Issues
**Symptoms**: Authentication works but session doesn't persist
**Solution**: Ensure `credentials: true` in CORS and frontend uses `withCredentials: true`

### Issue 4: Port Issues
**Symptoms**: Connection refused errors
**Solution**: 
```bash
# Check what's running on port 8080
lsof -i :8080

# Try different port if needed
PORT=3001 npm start
```

## 🛠️ Debug Script for Frontend Issues

Create this HTML file to test frontend connection:

```html
<!DOCTYPE html>
<html>
<head>
    <title>SuperTokens Debug</title>
</head>
<body>
    <h1>SuperTokens Connection Test</h1>
    <div id="status"></div>
    
    <script>
        async function testConnection() {
            const statusDiv = document.getElementById('status');
            const backendUrl = 'http://your-ip-address:8080';
            
            try {
                statusDiv.innerHTML += '<p>Testing health endpoint...</p>';
                const healthResponse = await fetch(backendUrl + '/health');
                const healthData = await healthResponse.json();
                statusDiv.innerHTML += `<p>✅ Health check: ${healthData.status}</p>`;
                
                statusDiv.innerHTML += '<p>Testing SuperTokens signup...</p>';
                const signupResponse = await fetch(backendUrl + '/auth/signup', {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        formFields: [
                            {id: "email", value: "debugtest@example.com"},
                            {id: "password", value: "debugpassword123"}
                        ]
                    })
                });
                
                const signupData = await signupResponse.json();
                statusDiv.innerHTML += `<p>✅ Signup test: ${signupResponse.status} - ${JSON.stringify(signupData)}</p>`;
                
            } catch (error) {
                statusDiv.innerHTML += `<p>❌ Error: ${error.message}</p>`;
                console.error('Connection test failed:', error);
            }
        }
        
        // Run test on page load
        testConnection();
    </script>
</body>
</html>
```

## 🚀 Quick Fix Commands

### Restart Backend with Network Config
```bash
cd /path/to/your/backend
pkill -f "node index.js"
npm start
```

### Test Backend Endpoints
```bash
# Health check
curl http://your-ip-address:8080/health

# SuperTokens endpoints
curl -X POST http://your-ip-address:8080/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"formFields": [{"id": "email", "value": "test@example.com"}, {"id": "password", "value": "password123"}]}'
```

### Check Backend Logs
Monitor your backend terminal for any error messages when frontend tries to connect.

## 🔄 Environment-Specific Configurations

### Local Development (Same System)
```javascript
apiDomain: "http://localhost:8080"
```

### Cross-System (Different WiFi devices)
```javascript
apiDomain: "http://your-ip-address:8080"  // Your backend system's IP
```

### Production
```javascript
apiDomain: "https://your-api-domain.com"
```

## 🆘 If Still Getting Timeouts

1. **Check firewall settings** on backend system
2. **Verify both systems are on same WiFi**
3. **Use browser dev tools** to see exact error messages
4. **Test with simple fetch()** before using SuperTokens UI
5. **Try different ports** (3001, 8081, etc.)

## 📞 Debug Checklist

- [ ] Backend restarted with new config
- [ ] Frontend updated with network IP
- [ ] CORS origins include frontend URL
- [ ] No firewall blocking connections
- [ ] Browser dev tools show no CORS errors
- [ ] Cookies being set properly
- [ ] SuperTokens endpoints responding (not timing out)

---

**Most Common Fix**: Update frontend `apiDomain` to use your backend's network IP address (`http://your-ip-address:8080`) instead of `localhost`.
