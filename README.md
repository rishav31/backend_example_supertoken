# SuperTokens Node.js Backend

A complete Node.js Express backend with SuperTokens authentication integration. This project provides a robust foundation for building authenticated web applications with modern security practices.

## 🚀 Features

- **Unified Authentication**: Single endpoints handle EmailPassword, Passwordless, and ThirdParty authentication
- **Multiple Auth Methods**: Email/Password + Passwordless + OAuth (Google, GitHub, Apple)
- **OAuth Integration**: Third-party authentication via Google, GitHub, and Apple
- **Passwordless Login**: Magic links and OTP codes via email
- **Session Management**: Secure session handling with automatic refresh
- **User Management**: Admin endpoints for user listing, details, and deletion
- **Security**: CORS, Helmet security headers, input validation
- **API Structure**: Well-organized public and protected endpoints
- **Logging**: Request logging with Morgan
- **Testing**: Jest test suite with Supertest
- **Error Handling**: Comprehensive error handling and validation
- **Environment Config**: Flexible configuration via environment variables

## 📋 Prerequisites

- Node.js >= 16.0.0
- npm or yarn package manager

## 🛠️ Installation

1. **Clone or download the project**
   ```bash
   cd backend_example_supertoken
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   - Copy the `.env` file and modify as needed
   - The default configuration uses SuperTokens' managed service
   - Update `ALLOWED_ORIGINS` to match your frontend URL

4. **Start the development server**
   ```bash
   npm run dev
   ```

   Or for production:
   ```bash
   npm start
   ```

The server will start on `http://localhost:8080` by default.

## 📚 API Documentation

### Base URLs
- **Health Check**: `GET /health`
- **Public APIs**: `/api/public/*`
- **Protected endpoints with authentication**
- **User management and admin functionality**
- **Unified Auth APIs**: `/api/auth/*` ⭐ **Recommended**
- **SuperTokens**: `/auth/*` (auto-generated)

### Public Endpoints

#### `GET /api/public/hello`
Simple hello world endpoint
```json
{
  "message": "Hello from SuperTokens Node Backend!",
  "timestamp": "2025-07-22T10:00:00.000Z"
}
```

#### `GET /api/public/info`
Application information and available features
```json
{
  "appName": "SuperTokens Node Backend",
  "version": "1.0.0",
  "features": ["Email/Password Authentication", "Session Management", ...]
}
```

#### `GET /api/public/status`
Service health and performance metrics
```json
{
  "status": "healthy",
  "uptime": {"seconds": 3600, "formatted": "1h 0m 0s"},
  "memory": {"used": 45.2, "total": 67.8, "unit": "MB"}
}
```

### Authentication Endpoints

SuperTokens automatically creates these endpoints:

#### `POST /auth/signup`
Register a new user
```json
{
  "formFields": [
    {"id": "email", "value": "user@example.com"},
    {"id": "password", "value": "password123"}
  ]
}
```

#### `POST /auth/signin`
Sign in an existing user
```json
{
  "formFields": [
    {"id": "email", "value": "user@example.com"},
    {"id": "password", "value": "password123"}
  ]
}
```

#### `POST /auth/signout`
Sign out the current user (requires authentication)

### Unified Authentication Endpoints ⭐ **Recommended**

These smart endpoints automatically detect and handle EmailPassword, Passwordless, and ThirdParty authentication based on the request payload.

#### `POST /api/auth/signup`
Smart signup endpoint that handles all three authentication methods

**EmailPassword Signup:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Passwordless Signup:**
```json
{
  "email": "user@example.com"
}
```

**ThirdParty Provider Info:**
```json
{
  "provider": "google"
}
```

Response for EmailPassword:
```json
{
  "status": "success",
  "message": "Account created successfully via email/password",
  "authMethod": "emailpassword",
  "data": {
    "user": {
      "id": "user_id_here",
      "email": "user@example.com",
      "timeJoined": "2025-08-04T10:00:00.000Z"
    }
  }
}
```

Response for Passwordless:
```json
{
  "status": "success",
  "message": "Signup code sent successfully",
  "authMethod": "passwordless",
  "data": {
    "deviceId": "device_id_here",
    "preAuthSessionId": "session_id_here",
    "flowType": "USER_INPUT_CODE_AND_MAGIC_LINK",
    "instructions": "Check your email for the signup code or magic link..."
  }
}
```

Response for ThirdParty:
```json
{
  "status": "redirect_required",
  "message": "Third-party authentication requires OAuth flow",
  "authMethod": "thirdparty",
  "data": {
    "provider": "google",
    "authUrl": "http://localhost:8080/auth/signin/google",
    "instructions": "Redirect user to: http://localhost:8080/auth/signin/google",
    "note": "Third-party signup/signin is handled automatically by SuperTokens OAuth flow"
  }
}
```

#### `POST /api/auth/signin`
Smart signin endpoint that handles EmailPassword, Passwordless, and ThirdParty authentication

**EmailPassword Signin:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Passwordless Code Request:**
```json
{
  "email": "user@example.com"
}
```

**ThirdParty Provider Request:**
```json
{
  "provider": "google"
}
```

**Passwordless Code Consumption:**
```json
{
  "email": "user@example.com",
  "code": "123456",
  "deviceId": "device_id_here",
  "preAuthSessionId": "session_id_here"
}
```

Response includes `authMethod` field indicating which authentication method was used (`"emailpassword"` or `"passwordless"`).

### Individual Authentication Endpoints

For advanced use cases, individual endpoints are also available:

#### `POST /api/passwordless/create-code`
Create a passwordless login code (magic link + OTP)
```json
{
  "email": "user@example.com"
}
```

Response:
```json
{
  "status": "success",
  "message": "Login code sent successfully",
  "data": {
    "deviceId": "device_id_here",
    "preAuthSessionId": "session_id_here",
    "flowType": "USER_INPUT_CODE_AND_MAGIC_LINK"
  }
}
```

#### `POST /api/passwordless/consume-code`
Verify and consume a passwordless login code
```json
{
  "deviceId": "device_id_here",
  "preAuthSessionId": "session_id_here",
  "userInputCode": "123456"
}
```

Response:
```json
{
  "status": "success",
  "message": "Signed in successfully",
  "data": {
    "user": {
      "id": "user_id_here",
      "email": "user@example.com",
      "timeJoined": "2025-08-04T10:00:00.000Z"
    },
    "createdNewUser": false
  }
}
```

#### `POST /api/passwordless/resend-code`
Resend a passwordless login code
```json
{
  "deviceId": "device_id_here",
  "preAuthSessionId": "session_id_here"
}
```

#### `POST /api/passwordless/check-email`
Check if email exists in the system
```json
{
  "email": "user@example.com"
}
```

Response:
```json
{
  "status": "success",
  "data": {
    "exists": true,
    "email": "user@example.com"
  }
}
```

#### `GET /api/passwordless/user-info`
Get current user information (requires authentication)
```json
{
  "status": "success",
  "data": {
    "id": "user_id_here",
    "email": "user@example.com",
    "timeJoined": "2025-08-04T10:00:00.000Z"
  }
}
```

### Custom Auth Endpoints

#### `GET /api/auth/session`
Get current session information (requires authentication)
```json
{
  "data": {
    "userId": "user_id_here",
    "sessionHandle": "session_handle_here",
    "accessTokenPayload": {...}
  }
}
```

#### `GET /api/auth/me`
Get current user profile information (requires authentication)
```json
{
  "data": {
    "id": "user_id_here",
    "email": "user@example.com",
    "profile": {...}
  }
}
```

### Third-Party OAuth Endpoints

#### `GET /api/auth/providers`
Get available OAuth providers and their authentication URLs

Response:
```json
{
  "status": "success",
  "message": "Available OAuth providers",
  "data": {
    "providers": [
      {
        "name": "google",
        "displayName": "Google",
        "authUrl": "http://localhost:8080/auth/signin/google",
        "signupUrl": "http://localhost:8080/auth/signin/google",
        "description": "Sign in with your Google account"
      },
      {
        "name": "github",
        "displayName": "GitHub",
        "authUrl": "http://localhost:8080/auth/signin/github",
        "signupUrl": "http://localhost:8080/auth/signin/github",
        "description": "Sign in with your GitHub account"
      },
      {
        "name": "apple",
        "displayName": "Apple",
        "authUrl": "http://localhost:8080/auth/signin/apple",
        "signupUrl": "http://localhost:8080/auth/signin/apple",
        "description": "Sign in with your Apple ID"
      }
    ],
    "totalProviders": 3
  }
}
```

#### `GET /api/auth/signin/:provider`
OAuth provider authentication endpoints (google, github, apple)

**Usage:**
- Redirect users to `/api/auth/signin/google` for Google OAuth
- Redirect users to `/api/auth/signin/github` for GitHub OAuth  
- Redirect users to `/api/auth/signin/apple` for Apple OAuth

**Note:** These endpoints are typically handled by the SuperTokens frontend SDK. For manual implementation, follow the OAuth 2.0 authorization code flow.

### Protected Endpoints

All protected endpoints require a valid session. Include the session in cookies (automatically handled by SuperTokens).

#### `GET /api/protected/profile`
Get user profile information

#### `POST /api/protected/update-profile`
Update user profile
```json
{
  "name": "John Doe",
  "bio": "Software Developer",
  "preferences": {...}
}
```

#### `GET /api/protected/dashboard`
Get user dashboard data with statistics and recent activity

#### `GET /api/protected/users`
Get list of all users (admin endpoint) 🔒 **Requires Authentication**

Query parameters:
- `limit` (optional): Number of users to return (default: 10)
- `offset` (optional): Pagination offset (default: 0)  
- `search` (optional): Search users by email

**Authentication:** This endpoint requires a valid SuperTokens session. Use it from a frontend application where the user is already signed in, or include proper session cookies/headers from a SuperTokens signin.

Response:
```json
{
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "id": "user_id_here",
        "email": "user@example.com",
        "timeJoined": "2025-08-04T10:00:00.000Z",
        "loginMethods": [
          {
            "recipeId": "emailpassword",
            "email": "user@example.com",
            "verified": true,
            "timeJoined": "2025-08-04T10:00:00.000Z"
          }
        ],
        "tenantIds": ["public"]
      }
    ],
    "totalCount": 5,
    "hasMore": false,
    "note": "Demo endpoint with mock data"
  }
}
```

#### `GET /api/protected/users/:userId`
Get specific user details (admin endpoint) 🔒 **Requires Authentication**

Response:
```json
{
  "message": "User details retrieved successfully",
  "data": {
    "user": {
      "id": "user_id_here",
      "email": "user@example.com",
      "timeJoined": "2025-08-04T10:00:00.000Z",
      "loginMethods": [...],
      "tenantIds": ["public"]
    },
    "note": "Demo endpoint with mock data"
  }
}
```

#### `DELETE /api/protected/users/:userId`
Delete specific user (admin endpoint) 🔒 **Requires Authentication**

**Note:** Cannot delete your own account through this endpoint - use `/api/protected/account` instead.

**Authentication:** This endpoint requires a valid SuperTokens session with admin privileges.

#### `DELETE /api/protected/account`
Delete user account (revokes all sessions)

## 🧪 Testing

Run the test suite:
```bash
npm test
```

The tests cover:
- Public endpoint accessibility
- Protected endpoint authentication requirements
- User management endpoints (demo mode)
- Error handling
- 404 responses for invalid routes

**Testing User Management Endpoints:**
```bash
# Run the user management test script
node test-user-management.js
```

**Note:** The user management endpoints require proper SuperTokens session authentication. They work best when used from a frontend application where users are already authenticated through SuperTokens.

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `8080` |
| `SUPERTOKENS_CONNECTION_URI` | SuperTokens core URL | `https://try.supertokens.com` |
| `SUPERTOKENS_API_KEY` | SuperTokens API key | (empty) |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000,http://localhost:3001` |
| `APP_NAME` | Application name | `SuperTokens Node Backend` |
| `APP_WEBSITE_URL` | Frontend website URL | `http://localhost:3000` |
| `API_DOMAIN` | Backend API domain | `http://localhost:8080` |
| `PASSWORDLESS_FLOW_TYPE` | Passwordless auth flow | `USER_INPUT_CODE_AND_MAGIC_LINK` |
| `PASSWORDLESS_CONTACT_METHOD` | Contact method for passwordless | `EMAIL` |

#### Third-Party OAuth Configuration

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | For Google auth |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | For Google auth |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | For GitHub auth |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret | For GitHub auth |
| `APPLE_CLIENT_ID` | Apple OAuth client ID | For Apple auth |
| `APPLE_CLIENT_SECRET` | Apple OAuth client secret | For Apple auth |

**Setting up OAuth providers:**

1. **Google OAuth**: Visit [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. **GitHub OAuth**: Go to GitHub Settings > Developer settings > OAuth Apps
3. **Apple OAuth**: Use [Apple Developer Console](https://developer.apple.com/account/resources/identifiers/list)

### SuperTokens Configuration

The SuperTokens configuration is in `config/supertokens.js`. Key settings:

- **Framework**: Express.js
- **Recipes**: EmailPassword + Passwordless + ThirdParty authentication
- **Third-Party Providers**: Google, GitHub, Apple OAuth
- **Passwordless Flow**: Magic links and OTP codes via email
- **Session**: Secure session management with automatic refresh
- **CORS**: Configured for cross-origin requests
- **Security**: Production-ready security settings

## 🏗️ Project Structure

```
├── .env                    # Environment variables
├── .github/
│   └── copilot-instructions.md
├── config/
│   └── supertokens.js      # SuperTokens configuration
├── routes/
│   ├── auth.js            # Custom auth endpoints
│   ├── passwordless.js    # Passwordless auth endpoints
│   ├── protected.js       # Protected endpoints
│   └── public.js          # Public endpoints
├── tests/
│   └── app.test.js        # Test suite
├── index.js               # Main application entry
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## 🚦 Development Workflow

1. **Start development server**: `npm run dev`
2. **Run tests**: `npm test`
3. **Test endpoints**: Use tools like Postman, curl, or your frontend
4. **Check logs**: Monitor console output for requests and errors
5. **Health check**: Visit `http://localhost:8080/health`

## 🔐 Authentication Flow

### Unified Endpoints (Recommended)
1. **Frontend sends signup/signin** to `/api/auth/signup` or `/api/auth/signin`
2. **Smart detection** determines authentication method based on payload:
   - EmailPassword: when `password` field is provided
   - Passwordless: when only `email` is provided
3. **SuperTokens handles** the chosen authentication method
4. **Session creation** happens automatically upon successful authentication
5. **Session cookies** are automatically set in browser
6. **Protected requests** include session cookies automatically
7. **Backend validates** session using `verifySession()` middleware

### Traditional SuperTokens Flow
1. **Frontend sends signup/signin** to `/auth/signup` or `/auth/signin`
2. **SuperTokens validates** credentials and creates session
3. **Session cookies** are automatically set in browser
4. **Protected requests** include session cookies automatically
5. **Backend validates** session using `verifySession()` middleware
6. **Session refresh** happens automatically when needed

## 🔒 Security Features

- **CORS**: Configurable cross-origin request handling
- **Helmet**: Security headers (CSP, HSTS, etc.)
- **Input Validation**: Email and password validation
- **Session Security**: Secure cookie settings, automatic refresh
- **Error Handling**: Safe error responses without sensitive data leaks
- **Rate Limiting**: Ready for rate limiting middleware integration

## 🚀 Production Deployment

1. **Set environment variables** for production
2. **Use HTTPS** for all requests
3. **Configure CORS** for your production domains
4. **Set up monitoring** and logging
5. **Consider load balancing** for high availability
6. **Use a process manager** like PM2

## 📮 Postman Testing

This project includes comprehensive Postman collections for testing all API endpoints:

### Collections Available
- **SuperTokens-Backend.postman_collection.json**: Complete API testing suite
- **SuperTokens-Backend-Enhanced.postman_collection.json**: Enhanced collection with advanced testing scenarios

### Environments
- **SuperTokens-Backend-Local.postman_environment.json**: Local development environment (localhost:8080)
- **SuperTokens-Backend-Network.postman_environment.json**: Network environment (192.168.1.6:8080)

### Features Tested
- ✅ EmailPassword authentication (signup, signin, signout)
- ✅ Passwordless authentication (magic links, OTP codes)
- ✅ Session management and verification
- ✅ Protected endpoints with authentication
- ✅ Public endpoints accessibility
- ✅ Error handling and validation
- ✅ Cross-system network connectivity

Import these collections into Postman to start testing immediately. See `POSTMAN_GUIDE.md` for detailed setup instructions.

## 🤝 Contributing

1. Fork the project
2. Create a feature branch
3. Make changes and add tests
4. Run the test suite
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

- [SuperTokens Documentation](https://supertokens.com/docs)
- [Express.js Documentation](https://expressjs.com/)
- [Node.js Documentation](https://nodejs.org/docs)

---

**Ready to build something amazing? Start the server and begin developing your authenticated application!** 🎉
