# Frontend Implementation Guide: Third-Party OAuth Authentication

This guide provides complete frontend implementation examples for integrating third-party OAuth authentication (Google, GitHub, Apple) with your SuperTokens Node.js backend.

## 🚀 Quick Start

Your backend is already configured to support third-party authentication. This guide shows you how to implement the frontend side.

## 📋 Prerequisites

- Node.js backend running on `http://localhost:8080` (or your configured domain)
- Frontend framework of your choice (React, Vue, Angular, Vanilla JS)
- OAuth provider credentials configured in backend `.env` file

## 🎯 PreBuilt UI vs Custom Implementation

### ✅ **PreBuilt UI (Recommended)**

**Your current backend configuration is FULLY COMPATIBLE with SuperTokens PreBuilt UI!**

The PreBuilt UI provides:
- **Automatic OAuth Flow Handling** - No manual redirect URLs needed
- **Unified Authentication Page** - All methods (email/password, passwordless, OAuth) in one UI
- **Callback Handling** - Automatically handles OAuth callbacks at `/auth/callback/*`
- **Session Management** - Built-in session handling and user state management
- **Responsive Design** - Mobile-friendly authentication forms
- **Error Handling** - Comprehensive error states and validation

When you use the PreBuilt UI:
1. User visits `/auth` (or gets redirected there)
2. They see all available auth methods: email/password, passwordless, and OAuth buttons
3. Clicking OAuth buttons automatically handles the entire flow
4. After successful auth, user is redirected to your app

### 🔧 **Key Benefits with Your Backend:**

Your backend's ThirdParty configuration with `thirdPartyId: "google"`, `"github"`, and `"apple"` is **exactly what the PreBuilt UI expects**. The frontend SDK will:

- Automatically detect available providers from your backend
- Generate correct OAuth URLs using your backend's `/auth/signin/*` endpoints  
- Handle OAuth callbacks at `/auth/callback/google`, `/auth/callback/github`, etc.
- Create sessions using your backend's session management

### 🚀 **Quick Start with PreBuilt UI:**

1. **Install and configure** (as shown above)
2. **Start your backend** (`npm start`)
3. **Start your React app** (`npm start`)
4. **Visit** `http://localhost:3000/auth`
5. **See all auth methods** including OAuth buttons for Google, GitHub, Apple

That's it! No additional configuration needed.

## 🔧 Setup Options

### Option 1: SuperTokens Frontend SDK (Recommended)

The SuperTokens frontend SDK handles OAuth flows automatically and integrates seamlessly with your backend.

#### React Implementation

1. **Install SuperTokens React SDK:**
```bash
npm install supertokens-auth-react
npm install react-router-dom  # Required for routing
```

2. **Configure SuperTokens in your React app:**

```javascript
// src/config/supertokens.js
import SuperTokens from "supertokens-auth-react";
import EmailPassword from "supertokens-auth-react/recipe/emailpassword";
import Passwordless from "supertokens-auth-react/recipe/passwordless";
import ThirdParty from "supertokens-auth-react/recipe/thirdparty";
import Session from "supertokens-auth-react/recipe/session";

SuperTokens.init({
    appInfo: {
        appName: "Your App Name",
        apiDomain: "http://localhost:8080", // Your backend URL
        websiteDomain: "http://localhost:3000", // Your frontend URL
        apiBasePath: "/auth",
        websiteBasePath: "/auth"
    },
    recipeList: [
        EmailPassword.init(),
        Passwordless.init({
            contactMethod: "EMAIL"
        }),
        ThirdParty.init({
            signInAndUpFeature: {
                providers: [
                    // These must match your backend configuration
                    ThirdParty.Google.init(),
                    ThirdParty.Github.init(),
                    ThirdParty.Apple.init()
                ]
            }
        }),
        Session.init()
    ]
});
```

3. **Setup App.js with SuperTokens PreBuilt UI:**

```jsx
// src/App.js
import React from 'react';
import SuperTokens, { SuperTokensWrapper } from "supertokens-auth-react";
import { getSuperTokensRoutesForReactRouterDom } from "supertokens-auth-react/ui";
import { EmailPasswordPreBuiltUI } from "supertokens-auth-react/recipe/emailpassword/prebuiltui";
import { PasswordlessPreBuiltUI } from "supertokens-auth-react/recipe/passwordless/prebuiltui";
import { ThirdPartyPreBuiltUI } from "supertokens-auth-react/recipe/thirdparty/prebuiltui";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./config/supertokens";

function App() {
    return (
        <SuperTokensWrapper>
            <Router>
                <div className="App">
                    <Routes>
                        {/* 
                        SuperTokens handles auth routes automatically with PreBuilt UI
                        This includes:
                        - /auth/signin - Shows all configured auth methods (email/password, passwordless, OAuth)
                        - /auth/signup - Shows signup options
                        - /auth/callback/google - Handles Google OAuth callback
                        - /auth/callback/github - Handles GitHub OAuth callback  
                        - /auth/callback/apple - Handles Apple OAuth callback
                        */}
                        {getSuperTokensRoutesForReactRouterDom(require("react-router-dom"), [
                            EmailPasswordPreBuiltUI, 
                            PasswordlessPreBuiltUI, 
                            ThirdPartyPreBuiltUI
                        ])}
                        
                        {/* Your app routes */}
                        <Route path="/" element={<HomePage />} />
                        <Route path="/dashboard" element={
                            <SessionAuth>
                                <Dashboard />
                            </SessionAuth>
                        } />
                    </Routes>
                </div>
            </Router>
        </SuperTokensWrapper>
    );
}

function HomePage() {
    return (
        <div style={{ padding: '40px', textAlign: 'center' }}>
            <h1>Welcome to Your App</h1>
            <p>SuperTokens PreBuilt UI handles all authentication!</p>
            <div>
                <a href="/auth" style={{ 
                    display: 'inline-block', 
                    padding: '12px 24px', 
                    backgroundColor: '#4285f4', 
                    color: 'white', 
                    textDecoration: 'none', 
                    borderRadius: '4px',
                    margin: '10px'
                }}>
                    Sign In / Sign Up (All Methods)
                </a>
                <a href="/dashboard" style={{ 
                    display: 'inline-block', 
                    padding: '12px 24px', 
                    backgroundColor: '#28a745', 
                    color: 'white', 
                    textDecoration: 'none', 
                    borderRadius: '4px',
                    margin: '10px'
                }}>
                    Dashboard (Protected)
                </a>
            </div>
        </div>
    );
}

function Dashboard() {
    return (
        <div style={{ padding: '40px' }}>
            <h2>Protected Dashboard</h2>
            <p>You are successfully authenticated!</p>
            <p>This page is protected and requires a valid session.</p>
        </div>
    );
}

export default App;
```

4. **Alternative: Custom Authentication Component with PreBuilt UI Components:**

If you want more control over the UI while still using SuperTokens components:

```jsx
// src/components/CustomAuth.jsx
import React from "react";
import { signInAndUp } from "supertokens-auth-react/recipe/thirdparty";
import { createCode, consumeCode } from "supertokens-auth-react/recipe/passwordless";
import { signInAndUp as emailPasswordSignInAndUp } from "supertokens-auth-react/recipe/emailpassword"; 

function CustomAuthComponent() {
    const handleGoogleLogin = async () => {
        try {
            // This will automatically redirect to Google OAuth and handle the callback
            await signInAndUp({
                thirdPartyId: "google"
            });
        } catch (error) {
            console.error("Google login error:", error);
        }
    };

    const handleGitHubLogin = async () => {
        try {
            await signInAndUp({
                thirdPartyId: "github"
            });
        } catch (error) {
            console.error("GitHub login error:", error);
        }
    };

    const handleAppleLogin = async () => {
        try {
            await signInAndUp({
                thirdPartyId: "apple"
            });
        } catch (error) {
            console.error("Apple login error:", error);
        }
    };

    return (
        <div className="custom-auth-container" style={{ padding: '40px', maxWidth: '400px', margin: '0 auto' }}>
            <h2>Sign In to Your Account</h2>
            
            {/* Third-Party Login Buttons */}
            <div className="oauth-buttons" style={{ marginBottom: '30px' }}>
                <button 
                    onClick={handleGoogleLogin}
                    style={{
                        width: '100%',
                        backgroundColor: '#4285f4',
                        color: 'white',
                        padding: '12px 24px',
                        border: 'none',
                        borderRadius: '6px',
                        margin: '8px 0',
                        cursor: 'pointer',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px'
                    }}
                >
                    <span>🌐</span>
                    <span>Continue with Google</span>
                </button>

                <button 
                    onClick={handleGitHubLogin}
                    style={{
                        width: '100%',
                        backgroundColor: '#333',
                        color: 'white',
                        padding: '12px 24px',
                        border: 'none',
                        borderRadius: '6px',
                        margin: '8px 0',
                        cursor: 'pointer',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px'
                    }}
                >
                    <span>🐙</span>
                    <span>Continue with GitHub</span>
                </button>

                <button 
                    onClick={handleAppleLogin}
                    style={{
                        width: '100%',
                        backgroundColor: '#000',
                        color: 'white',
                        padding: '12px 24px',
                        border: 'none',
                        borderRadius: '6px',
                        margin: '8px 0',
                        cursor: 'pointer',
                        fontSize: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px'
                    }}
                >
                    <span>🍎</span>
                    <span>Continue with Apple</span>
                </button>
            </div>

            <div className="divider" style={{ 
                margin: '30px 0', 
                textAlign: 'center', 
                borderTop: '1px solid #eee',
                position: 'relative'
            }}>
                <span style={{ 
                    backgroundColor: 'white', 
                    padding: '0 15px', 
                    color: '#666',
                    position: 'relative',
                    top: '-10px'
                }}>
                    OR
                </span>
            </div>

            {/* You can add custom email/password and passwordless forms here */}
            <div className="traditional-auth">
                <p style={{ textAlign: 'center', color: '#666' }}>
                    Use the full PreBuilt UI at <a href="/auth">/auth</a> for email/password and passwordless options
                </p>
            </div>
        </div>
    );
}

export default CustomAuthComponent;
```

### Option 2: Manual OAuth Implementation (Advanced)

If you prefer to implement OAuth manually without the SuperTokens frontend SDK:

#### Vanilla JavaScript Implementation

```html
<!DOCTYPE html>
<html>
<head>
    <title>Manual OAuth Implementation</title>
    <style>
        .oauth-button {
            display: inline-block;
            padding: 12px 24px;
            margin: 8px;
            border: none;
            border-radius: 4px;
            color: white;
            text-decoration: none;
            cursor: pointer;
            font-size: 16px;
        }
        .google { background-color: #4285f4; }
        .github { background-color: #333; }
        .apple { background-color: #000; }
    </style>
</head>
<body>
    <div id="auth-container">
        <h2>Sign In with OAuth</h2>
        
        <button class="oauth-button google" onclick="loginWithGoogle()">
            🌐 Sign in with Google
        </button>
        
        <button class="oauth-button github" onclick="loginWithGitHub()">
            🐙 Sign in with GitHub
        </button>
        
        <button class="oauth-button apple" onclick="loginWithApple()">
            🍎 Sign in with Apple
        </button>
        
        <div id="status"></div>
    </div>

    <script>
        const API_BASE = 'http://localhost:8080/api';
        
        // Get available OAuth providers from backend
        async function getOAuthProviders() {
            try {
                const response = await fetch(`${API_BASE}/auth/providers`);
                const data = await response.json();
                return data.data.providers;
            } catch (error) {
                console.error('Error fetching providers:', error);
                return [];
            }
        }

        // Generic OAuth login function
        async function loginWithProvider(providerName) {
            try {
                // First, get the OAuth URL from your backend
                const response = await fetch(`${API_BASE}/auth/signin`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ provider: providerName })
                });

                const data = await response.json();
                
                if (data.status === 'redirect_required') {
                    // Redirect to OAuth provider
                    window.location.href = data.data.authUrl;
                } else {
                    document.getElementById('status').innerHTML = 
                        `<p style="color: red;">Error: ${data.message}</p>`;
                }
            } catch (error) {
                console.error(`${providerName} login error:`, error);
                document.getElementById('status').innerHTML = 
                    `<p style="color: red;">Login failed: ${error.message}</p>`;
            }
        }

        // Specific provider functions
        function loginWithGoogle() {
            loginWithProvider('google');
        }

        function loginWithGitHub() {
            loginWithProvider('github');
        }

        function loginWithApple() {
            loginWithProvider('apple');
        }

        // Handle OAuth callback (if needed)
        function handleOAuthCallback() {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const state = urlParams.get('state');
            
            if (code) {
                // OAuth callback received
                document.getElementById('status').innerHTML = 
                    '<p style="color: green;">OAuth callback received. Processing...</p>';
                
                // SuperTokens will handle the rest automatically
                // You might want to redirect to your app's main page
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 2000);
            }
        }

        // Check for OAuth callback on page load
        window.onload = function() {
            handleOAuthCallback();
        };
    </script>
</body>
</html>
```

#### React (Manual Implementation)

```jsx
// src/components/ManualOAuth.jsx
import React, { useState, useEffect } from 'react';

const ManualOAuth = () => {
    const [providers, setProviders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const API_BASE = 'http://localhost:8080/api';

    useEffect(() => {
        fetchProviders();
    }, []);

    const fetchProviders = async () => {
        try {
            const response = await fetch(`${API_BASE}/auth/providers`);
            const data = await response.json();
            setProviders(data.data.providers);
        } catch (err) {
            setError('Failed to load OAuth providers');
        }
    };

    const handleOAuthLogin = async (providerName) => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE}/auth/signin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ provider: providerName })
            });

            const data = await response.json();

            if (data.status === 'redirect_required') {
                // Redirect to OAuth provider
                window.location.href = data.data.authUrl;
            } else {
                setError(data.message || 'OAuth login failed');
            }
        } catch (err) {
            setError(`Login with ${providerName} failed: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const getProviderIcon = (providerName) => {
        const icons = {
            google: '🌐',
            github: '🐙',
            apple: '🍎'
        };
        return icons[providerName] || '🔗';
    };

    const getProviderColor = (providerName) => {
        const colors = {
            google: '#4285f4',
            github: '#333',
            apple: '#000'
        };
        return colors[providerName] || '#666';
    };

    return (
        <div className="manual-oauth">
            <h2>Sign In with OAuth</h2>
            
            {error && (
                <div style={{ color: 'red', marginBottom: '16px' }}>
                    {error}
                </div>
            )}

            <div className="oauth-buttons">
                {providers.map((provider) => (
                    <button
                        key={provider.name}
                        onClick={() => handleOAuthLogin(provider.name)}
                        disabled={loading}
                        style={{
                            backgroundColor: getProviderColor(provider.name),
                            color: 'white',
                            padding: '12px 24px',
                            border: 'none',
                            borderRadius: '4px',
                            margin: '8px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <span>{getProviderIcon(provider.name)}</span>
                        <span>
                            {loading ? 'Loading...' : `Sign in with ${provider.displayName}`}
                        </span>
                    </button>
                ))}
            </div>

            <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
                <p>Available providers loaded from backend:</p>
                <ul>
                    {providers.map(provider => (
                        <li key={provider.name}>
                            {provider.displayName} - {provider.description}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default ManualOAuth;
```

## 🔐 OAuth Provider Setup

Before your OAuth integration works, you need to configure OAuth applications with each provider:

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new OAuth 2.0 Client ID
3. Add authorized redirect URIs:
   - `http://localhost:8080/auth/callback/google`
   - `http://your-ip-address:8080/auth/callback/google` (if using network access)
4. Copy Client ID and Client Secret to your backend `.env` file

### GitHub OAuth Setup

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL to:
   - `http://localhost:8080/auth/callback/github`
4. Copy Client ID and Client Secret to your backend `.env` file

### Apple OAuth Setup

1. Go to [Apple Developer Console](https://developer.apple.com/account/resources/identifiers/list)
2. Create a new Services ID
3. Configure Sign in with Apple
4. Set return URLs and configure the integration
5. Copy Client ID and Client Secret to your backend `.env` file

## 🌐 Backend Environment Variables

Add these to your backend `.env` file:

```env
# OAuth Provider Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here
APPLE_CLIENT_ID=your_apple_client_id_here
APPLE_CLIENT_SECRET=your_apple_client_secret_here
```

## 🧪 Testing Your Implementation

### **Testing PreBuilt UI Integration:**

1. **Start your backend server:**
```bash
cd /path/to/your/backend
npm start
# Should see: Server running on http://localhost:8080
```

2. **Create a test React app (if you don't have one):**
```bash
npx create-react-app my-auth-app
cd my-auth-app
npm install supertokens-auth-react react-router-dom
```

3. **Test OAuth providers endpoint:**
```bash
curl http://localhost:8080/api/auth/providers
# Should return Google, GitHub, Apple providers
```

4. **Test backend OAuth integration:**
```bash
# Test Google OAuth
curl -X POST http://localhost:8080/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"provider": "google"}'

# Should return redirect info with authUrl
```

5. **Run the comprehensive backend test:**
```bash
npm run test:thirdparty
# All tests should pass
```

6. **Test PreBuilt UI in browser:**
   - Visit `http://localhost:3000/auth`
   - You should see:
     - Email/password form
     - Passwordless email option  
     - **Google sign in button** 🌐
     - **GitHub sign in button** 🐙
     - **Apple sign in button** 🍎

### **Verifying OAuth Flow:**

1. **Click any OAuth button** (e.g., Google)
2. **Should redirect to** Google's OAuth consent screen
3. **After OAuth consent**, you'll be redirected back to your app
4. **Check browser console** for any errors
5. **Verify session** by visiting protected routes

### **Testing Without OAuth Credentials:**

Even without OAuth credentials configured, you can test:
- ✅ OAuth buttons appear in PreBuilt UI
- ✅ Backend returns provider information  
- ✅ Clicking buttons shows OAuth flow (will fail at provider step without credentials)
- ✅ Email/password and passwordless still work perfectly

### **With OAuth Credentials Configured:**

Once you add real OAuth credentials to your `.env` file:
- ✅ Complete OAuth flow works end-to-end
- ✅ Users can sign in with Google/GitHub/Apple
- ✅ Sessions are created automatically
- ✅ Users are redirected to your app after successful auth

## 🔧 Troubleshooting

### Common Issues

1. **OAuth callback not working:**
   - Check redirect URIs in OAuth provider settings
   - Ensure backend is accessible from the OAuth provider
   - Verify CORS settings in backend

2. **Provider not found errors:**
   - Verify OAuth credentials in `.env` file
   - Check that provider is enabled in SuperTokens config
   - Ensure backend server is running

3. **CORS errors:**
   - Add your frontend domain to `ALLOWED_ORIGINS` in backend `.env`
   - Check that CORS is properly configured in backend

### Debug Steps

1. **Check backend logs** for OAuth-related errors
2. **Verify provider configuration** using the test endpoint
3. **Test OAuth URLs** manually in browser
4. **Check network requests** in browser dev tools

## 📱 Mobile Implementation

For React Native or mobile apps, you can use similar approaches with platform-specific OAuth libraries:

- **React Native:** Use `react-native-app-auth` or similar libraries
- **iOS:** Integrate with native OAuth libraries
- **Android:** Use Android OAuth libraries

## 🔒 Security Considerations

1. **Always use HTTPS in production**
2. **Keep OAuth credentials secure**
3. **Validate redirect URIs**
4. **Implement proper session management**
5. **Use state parameters to prevent CSRF attacks**

## 📖 Additional Resources

- [SuperTokens Documentation](https://supertokens.com/docs)
- [OAuth 2.0 RFC](https://tools.ietf.org/html/rfc6749)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Documentation](https://docs.github.com/en/developers/apps/building-oauth-apps)
- [Apple Sign In Documentation](https://developer.apple.com/sign-in-with-apple/)

---

## 🎯 Quick Implementation Checklist

### **For PreBuilt UI (Recommended):**
- [ ] ✅ **Backend is ready** (your current setup is perfect!)
- [ ] Install `supertokens-auth-react` and `react-router-dom`
- [ ] Copy the SuperTokens configuration code
- [ ] Copy the App.js setup with PreBuilt UI imports
- [ ] Start backend and frontend servers
- [ ] Visit `/auth` to see unified authentication page
- [ ] **All OAuth providers will be visible and functional** (even without credentials)
- [ ] Add real OAuth credentials for full functionality
- [ ] Test OAuth flow with each provider

### **For Custom Implementation:**
- [ ] Choose implementation method (SuperTokens SDK functions vs Manual API calls)
- [ ] Install required frontend dependencies  
- [ ] Create custom OAuth login components
- [ ] Implement manual OAuth redirect handling
- [ ] Set up OAuth applications with providers
- [ ] Add OAuth credentials to backend `.env`
- [ ] Test OAuth flow end-to-end
- [ ] Handle OAuth callbacks properly
- [ ] Implement error handling
- [ ] Test with all three providers (Google, GitHub, Apple)

## ✅ **Summary: Your Backend is Ready!**

**Great news!** Your current SuperTokens backend configuration is **100% compatible** with the PreBuilt UI for third-party authentication. 

**What works right now:**
- ✅ **PreBuilt UI will automatically detect** your Google, GitHub, Apple providers
- ✅ **OAuth buttons will appear** in the authentication interface
- ✅ **Backend endpoints are properly configured** for OAuth flows
- ✅ **Session management works** seamlessly with frontend SDK
- ✅ **All authentication methods work together** (email/password + passwordless + OAuth)

**Next steps:**
1. **Set up a React frontend** with the PreBuilt UI code above
2. **Add OAuth credentials** to your backend `.env` when ready for production
3. **Enjoy a fully functional multi-method authentication system!**

Your backend is ready to handle OAuth authentication - now choose your preferred frontend implementation approach and start building!
