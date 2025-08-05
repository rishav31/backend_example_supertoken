# Postman Collections for SuperTokens Node.js Backend

This directory contains comprehensive Postman collections for testing the SuperTokens Node.js Express backend API.

## 📁 Files Included

- **`SuperTokens-Backend.postman_collection.json`** - Basic collection with all API endpoints
- **`SuperTokens-Backend-Enhanced.postman_collection.json`** - Advanced collection with automated testing scripts
- **`SuperTokens-Backend-Local.postman_environment.json`** - Environment variables for local development
- **`SuperTokens-Backend-Network.postman_environment.json`** - Environment variables for network access (cross-system)

## 🌐 Cross-System Setup (Frontend on Different Device)

You can run the frontend on a different system (laptop, mobile, etc.) while keeping the backend on your current system, as long as both are on the same WiFi network.

### Backend Configuration (Your Current System)

1. **Find Your Network IP**:
   ```bash
   # On macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   # Your IP will be something like: your-ip-address
   ```

2. **Update CORS Configuration**:
   The `.env` file has been updated to allow cross-origin requests from your network IP:
   ```properties
   ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://your-ip-address:3000,http://your-ip-address:3001
   ```

3. **Start Backend Server**:
   ```bash
   npm start
   ```
   Server will be accessible at: `http://your-ip-address:8080`

### Frontend Configuration (Other System)

1. **Update Frontend API URL**: Configure your frontend to point to your backend's network IP:
   ```javascript
   // Frontend config
   const API_BASE_URL = 'http://your-ip-address:8080';
   ```

2. **SuperTokens Frontend Config**:
   ```javascript
   // SuperTokens frontend config
   SuperTokens.init({
       apiDomain: "http://your-ip-address:8080",
       apiBasePath: "/auth",
       // ... other config
   });
   ```

### Testing from Other System

Use the **Network environment** in Postman:
- **From your system**: Use `SuperTokens Backend - Local` environment
- **From other system**: Use `SuperTokens Backend - Network` environment

### Network Access Requirements

- ✅ Both devices on same WiFi network
- ✅ Backend system firewall allows port 8080
- ✅ CORS configured for network access
- ✅ Frontend configured with network IP

### Troubleshooting Network Access

1. **Can't connect from other device**:
   ```bash
      # Use telnet to test if port is open
   telnet your-ip-address 8080
   ```

2. **CORS errors**:
   - Verify frontend URL is in `ALLOWED_ORIGINS`
   - Check frontend is using correct backend IP

3. **Firewall issues**:
   ```bash
   # macOS: Allow incoming connections on port 8080
   sudo pfctl -f /etc/pf.conf
   ```

## 🚀 Quick Start

### 1. Import Collections

1. Open Postman
2. Click **Import** button
3. Select all three JSON files:
   - `SuperTokens-Backend.postman_collection.json` OR `SuperTokens-Backend-Enhanced.postman_collection.json`
   - `SuperTokens-Backend-Local.postman_environment.json`

### 2. Setup Environment

1. Select **"SuperTokens Backend - Local"** environment from the dropdown
2. Make sure your Node.js server is running (`npm start`)
3. Verify `baseUrl` is set to `http://localhost:8080`

### 3. Test the API

#### Basic Testing Flow:
1. **Health Check** - Verify server is running
2. **Public Endpoints** - Test endpoints that don't require authentication
3. **Authentication Flow**:
   - Sign Up with new user
   - Sign In 
   - Access protected endpoints
   - Sign Out
4. **Error Testing** - Test error scenarios

## 📋 Collection Details

### Basic Collection Features

- ✅ All documented API endpoints
- ✅ Proper request formatting
- ✅ Environment variable support
- ✅ Organized into logical folders

### Enhanced Collection Features

- ✅ **Automated Testing**: Each request includes test scripts
- ✅ **Session Management**: Automatically handles cookies and tokens
- ✅ **Dynamic Data**: Generates unique test emails
- ✅ **Error Validation**: Tests both success and failure scenarios
- ✅ **Environment Integration**: Saves and reuses values across requests
- ✅ **Response Validation**: Checks status codes, response structure, and data

## 🗂️ Endpoint Categories

### 🌍 Health & Public
- `GET /health` - Server health check
- `GET /api/public/hello` - Simple greeting
- `GET /api/public/info` - Application information
- `GET /api/public/status` - System status and metrics

### 🔐 Authentication (SuperTokens)
- `POST /auth/signup` - Register new user
- `POST /auth/signin` - User sign in
- `POST /auth/signout` - User sign out
- `POST /auth/session/refresh` - Refresh session

### 🔒 Protected Endpoints
- `GET /api/protected/profile` - Get user profile
- `POST /api/protected/update-profile` - Update user profile
- `GET /api/protected/dashboard` - Get dashboard data
- `DELETE /api/protected/account` - Delete user account

### 🧪 Testing & Errors
- `GET /api/non-existent` - Test 404 handling
- `GET /api/protected/*` (without auth) - Test 401 handling
- `POST /auth/signup` (invalid data) - Test validation errors

## 🔧 Environment Variables

The environment file includes these variables:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `baseUrl` | Server base URL | `http://localhost:8080` |
| `email` | Test user email | `test@example.com` |
| `password` | Test user password | `password123` |
| `testEmail` | Dynamic test email | Generated automatically |
| `userId` | Current user ID | Set automatically |
| `accessToken` | JWT access token | Set automatically |
| `refreshToken` | JWT refresh token | Set automatically |

## 🧪 Automated Testing

The Enhanced collection includes comprehensive test scripts:

### Global Tests (All Requests)
- Response time validation
- Content-Type header validation

### Specific Endpoint Tests
- **Health Check**: Status validation, response time checks
- **Authentication**: Cookie handling, user ID extraction
- **Protected Routes**: Authorization validation
- **Error Scenarios**: Status code validation, error message checks

### Running Tests

1. **Individual Request**: Click **Send** and view **Test Results** tab
2. **Collection Runner**: 
   - Click collection → **Run collection**
   - Select requests to run
   - View detailed test results

## 📱 Usage Examples

### Authentication Flow Example

1. **Sign Up New User**:
   ```json
   POST /auth/signup
   {
     "formFields": [
       {"id": "email", "value": "newuser@example.com"},
       {"id": "password", "value": "securePassword123"}
     ]
   }
   ```

2. **Sign In**:
   ```json
   POST /auth/signin
   {
     "formFields": [
       {"id": "email", "value": "newuser@example.com"},
       {"id": "password", "value": "securePassword123"}
     ]
   }
   ```

3. **Access Protected Resource**:
   ```
   GET /api/protected/profile
   // Cookies automatically included
   ```

### Testing Protected Endpoints

After signing in, you can test protected endpoints:

- **Profile Management**: Get and update user profiles
- **Dashboard Data**: Access user-specific dashboard information
- **Account Management**: Delete user accounts

## 🛠️ Customization

### Adding New Endpoints

1. Right-click on appropriate folder
2. Select **Add Request**
3. Configure method, URL, headers, and body
4. Add test scripts if using Enhanced collection

### Environment Setup for Different Stages

Create additional environment files for:
- **Local Development**: `http://localhost:8080` (same system)
- **Network Access**: `http://your-ip-address:8080` (cross-system on same WiFi)
- **Staging**: `https://api-staging.yourapp.com`
- **Production**: `https://api.yourapp.com`

### Custom Test Scripts

Example test script for custom validation:
```javascript
pm.test("Custom validation", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('customField');
    pm.environment.set("customValue", jsonData.customField);
});
```

## 🐛 Troubleshooting

### Common Issues

1. **Server Not Running**: Ensure `npm start` is running
2. **CORS Errors**: Check CORS configuration in backend
3. **Authentication Fails**: Verify credentials and session cookies
4. **404 Errors**: Check endpoint URLs and server routes

### Debug Tips

- Use **Postman Console** to view detailed request/response logs
- Check **Network** tab for cookie handling
- Verify **Environment Variables** are set correctly
- Review **Test Results** for specific failure details

## 🚀 Advanced Features

### Pre-request Scripts

The Enhanced collection includes pre-request scripts that:
- Generate unique test emails
- Set up authentication headers
- Log request details

### Collection Variables

Use collection variables for values that don't change between environments:
- API version numbers
- Common request headers
- Default pagination limits

### Automated Test Flows

Chain requests together using:
```javascript
// In test script
pm.execution.setNextRequest("Next Request Name");
```

## 📖 Additional Resources

- [Postman Documentation](https://learning.postman.com/)
- [SuperTokens API Documentation](https://supertokens.com/docs)
- [Express.js Guide](https://expressjs.com/en/guide/)

---

**Happy Testing! 🧪✨**

These collections provide everything you need to test your SuperTokens backend API comprehensively. Use the Enhanced collection for automated testing and CI/CD integration.
