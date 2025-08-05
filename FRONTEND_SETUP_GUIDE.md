# Frontend Setup Guide for Cross-System Development

This guide helps frontend developers connect to the SuperTokens backend running on a different system.

## 🌐 Backend Information

**Backend System IP**: `your-ip-address`  
**Backend URL**: `http://your-ip-address:8080`  
**Status**: ✅ Running and accessible

## 🔧 Frontend Configuration

### React with SuperTokens

```javascript
// src/config/supertokens.js
import SuperTokens from "supertokens-auth-react";
import EmailPassword from "supertokens-auth-react/recipe/emailpassword";
import Session from "supertokens-auth-react/recipe/session";

SuperTokens.init({
    appInfo: {
        appName: "Your App Name",
        apiDomain: "http://your-ip-address:8080",  // 👈 Backend IP
        websiteDomain: "http://localhost:3000", // 👈 Your frontend URL
        apiBasePath: "/auth",
        websiteBasePath: "/auth"
    },
    recipeList: [
        EmailPassword.init(),
        Session.init()
    ]
});
```

### API Client Configuration

```javascript
// src/config/api.js
const API_BASE_URL = "http://your-ip-address:8080";  // 👈 Backend IP

// Axios configuration
import axios from 'axios';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Important for SuperTokens session cookies
    headers: {
        'Content-Type': 'application/json'
    }
});

export default apiClient;
```

### Fetch Configuration

```javascript
// Using fetch with SuperTokens
import Session from "supertokens-auth-react/recipe/session";

const callAPI = async () => {
    const response = await fetch("http://your-ip-address:8080/api/protected/profile", {
        method: "GET",
        credentials: 'include', // Important for cookies
        headers: {
            "Content-Type": "application/json"
        }
    });
    
    if (response.status === 401) {
        // Session expired, redirect to login
        window.location.href = "/auth";
        return;
    }
    
    return response.json();
};
```

## 🧪 Testing Endpoints

You can test these endpoints from your frontend system:

### Public Endpoints (No auth required)
- `GET http://your-ip-address:8080/health` - Health check
- `GET http://your-ip-address:8080/api/public/hello` - Hello message
- `GET http://your-ip-address:8080/api/public/info` - App info

### Authentication Endpoints
- `POST http://your-ip-address:8080/auth/signup` - Sign up
- `POST http://your-ip-address:8080/auth/signin` - Sign in
- `POST http://your-ip-address:8080/auth/signout` - Sign out

### Protected Endpoints (Auth required)
- `GET http://your-ip-address:8080/api/protected/profile` - User profile
- `GET http://your-ip-address:8080/api/auth/session` - Session info

## 🐛 Troubleshooting

### CORS Errors
If you see CORS errors, the backend is already configured for your frontend. Make sure you're using `withCredentials: true` in your requests.

### Connection Refused
1. Verify both devices are on the same WiFi
2. Check that backend is running: `http://your-ip-address:8080/health`
3. Try accessing the health endpoint in your browser

### Authentication Issues
1. Ensure `withCredentials: true` or `credentials: 'include'` is set
2. Check that cookies are being sent in network tab
3. Verify SuperTokens configuration matches backend

## 📱 Quick Test

Open your browser and visit: `http://your-ip-address:8080/health`

You should see:
```json
{
  "status": "OK",
  "message": "SuperTokens Node Backend is running",
  "timestamp": "2025-07-22T16:45:57.198Z",
  "environment": "development"
}
```

## 🔗 Next Steps

1. Update your frontend configuration with the backend IP
2. Test authentication flow (signup/signin)
3. Implement protected routes
4. Use the Postman collection for API testing

---

**Need help?** The backend developer can run `./test-network-connectivity.sh` to verify connectivity.
