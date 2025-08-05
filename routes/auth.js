const express = require('express');
const { verifySession } = require('supertokens-node/recipe/session/framework/express');
const EmailPassword = require("supertokens-node/recipe/emailpassword");
const Passwordless = require("supertokens-node/recipe/passwordless");
const ThirdParty = require("supertokens-node/recipe/thirdparty");
const { RecipeUserId } = require("supertokens-node");

const router = express.Router();

/**
 * @route   POST /api/auth/signup
 * @desc    User signup - handled by SuperTokens
 * @access  Public
 * @note    This route is automatically handled by SuperTokens middleware
 */

/**
 * @route   POST /api/auth/signin
 * @desc    User signin - handled by SuperTokens
 * @access  Public
 * @note    This route is automatically handled by SuperTokens middleware
 */

/**
 * @route   POST /api/auth/signout
 * @desc    User signout - handled by SuperTokens
 * @access  Protected
 * @note    This route is automatically handled by SuperTokens middleware
 */

/**
 * @route   GET /api/auth/session
 * @desc    Get current session information
 * @access  Protected
 */
router.get('/session', verifySession(), async (req, res) => {
    try {
        const userId = req.session.getUserId();
        const sessionHandle = req.session.getHandle();
        const accessTokenPayload = req.session.getAccessTokenPayload();

        res.json({
            message: 'Session information retrieved successfully',
            data: {
                userId,
                sessionHandle,
                accessTokenPayload,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Session info error:', error);
        res.status(500).json({
            error: 'Failed to retrieve session information',
            message: error.message
        });
    }
});

/**
 * @route   POST /api/auth/session/refresh
 * @desc    Refresh session - handled by SuperTokens
 * @access  Protected
 * @note    This route is automatically handled by SuperTokens middleware
 */

/**
 * @route   GET /api/auth/me
 * @desc    Get current user information
 * @access  Protected
 */
router.get('/me', verifySession(), async (req, res) => {
    try {
        const userId = req.session.getUserId();
        
        // In a real application, you would fetch user data from your database
        // For demo purposes, we'll return mock user data
        const userData = {
            id: userId,
            email: `user.${userId.slice(-6)}@example.com`, // Mock email
            profile: {
                name: 'Demo User',
                avatar: null,
                bio: 'This is a demo user profile',
                joinedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                lastActive: new Date().toISOString()
            },
            preferences: {
                theme: 'light',
                notifications: true,
                language: 'en'
            }
        };

        res.json({
            message: 'User information retrieved successfully',
            data: userData
        });
    } catch (error) {
        console.error('Get user info error:', error);
        res.status(500).json({
            error: 'Failed to retrieve user information',
            message: error.message
        });
    }
});

/**
 * @route   POST /api/auth/update-session-data
 * @desc    Update session data
 * @access  Protected
 */
router.post('/update-session-data', verifySession(), async (req, res) => {
    try {
        const { customData } = req.body;

        if (!customData || typeof customData !== 'object') {
            return res.status(400).json({
                error: 'Invalid request',
                message: 'customData must be a valid object'
            });
        }

        // Update session data
        await req.session.updateAccessTokenPayload(customData);

        res.json({
            message: 'Session data updated successfully',
            data: {
                updatedData: customData,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Update session data error:', error);
        res.status(500).json({
            error: 'Failed to update session data',
            message: error.message
        });
    }
});

/**
 * @route   POST /api/auth/signup
 * @desc    Unified signup endpoint - handles EmailPassword, Passwordless, and ThirdParty authentication
 * @access  Public
 * @body    For EmailPassword: { email, password }
 *          For Passwordless: { email }
 *          For ThirdParty: { provider, code, redirectURI } or { provider, authorizationCode }
 */
router.post('/signup', async (req, res) => {
    try {
        const { email, password, provider, code, redirectURI, authorizationCode } = req.body;

        // Third-party authentication
        if (provider) {
            console.log(`🌐 Third-party signup attempt with provider: ${provider}`);
            
            // For third-party auth, we need to handle the OAuth flow
            // This is typically done on the frontend, but we can provide info about available providers
            const availableProviders = ['google', 'github', 'apple'];
            
            if (!availableProviders.includes(provider.toLowerCase())) {
                return res.status(400).json({
                    error: 'Unsupported provider',
                    message: `Provider '${provider}' is not supported. Available providers: ${availableProviders.join(', ')}`,
                    availableProviders
                });
            }

            // Return OAuth URLs for the requested provider
            const baseUrl = process.env.API_DOMAIN || `http://localhost:${process.env.PORT || 8080}`;
            const authUrl = `${baseUrl}/auth/signin/${provider.toLowerCase()}`;
            
            return res.status(200).json({
                status: 'redirect_required',
                message: 'Third-party authentication requires OAuth flow',
                authMethod: 'thirdparty',
                data: {
                    provider: provider.toLowerCase(),
                    authUrl,
                    instructions: `Redirect user to: ${authUrl}`,
                    note: "Third-party signup/signin is handled automatically by SuperTokens OAuth flow"
                }
            });
        }

        if (!email) {
            return res.status(400).json({
                error: 'Email is required',
                message: 'Please provide an email address or a third-party provider'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Invalid email format',
                message: 'Please provide a valid email address'
            });
        }

        console.log(`📝 Unified signup attempt for: ${email}`);

        // If password is provided, use EmailPassword signup
        if (password) {
            console.log('🔑 Processing EmailPassword signup...');
            
            try {
                const response = await EmailPassword.signUp("public", email, password);

                if (response.status === "OK") {
                    return res.status(201).json({
                        status: 'success',
                        message: 'Account created successfully via email/password',
                        authMethod: 'emailpassword',
                        data: {
                            user: {
                                id: response.user.id,
                                email: response.user.email,
                                timeJoined: new Date(response.user.timeJoined).toISOString()
                            }
                        }
                    });
                } else if (response.status === "EMAIL_ALREADY_EXISTS_ERROR") {
                    return res.status(409).json({
                        error: 'Email already exists',
                        message: 'An account with this email already exists. Try signing in instead.'
                    });
                } else {
                    console.error('EmailPassword signup failed:', response);
                    return res.status(400).json({
                        error: 'Signup failed',
                        message: 'Failed to create account with email and password'
                    });
                }
            } catch (error) {
                console.error('EmailPassword signup error details:', error);
                return res.status(500).json({
                    error: 'Signup failed',
                    message: 'An error occurred during account creation'
                });
            }
        }

        // If no password provided, use passwordless signup (create code)
        console.log('📧 Creating passwordless signup code...');
        
        try {
            const response = await Passwordless.createCode({
                tenantId: "public",
                email: email,
                userContext: {}
            });

            if (response.status === "OK") {
                res.status(200).json({
                    status: 'success',
                    message: 'Signup code sent successfully',
                    authMethod: 'passwordless',
                    data: {
                        deviceId: response.deviceId,
                        preAuthSessionId: response.preAuthSessionId,
                        flowType: "USER_INPUT_CODE_AND_MAGIC_LINK",
                        instructions: "Check your email for the signup code or magic link. To complete signup, use the signin endpoint with: { email, code, deviceId, preAuthSessionId }"
                    }
                });
            } else {
                console.error('Passwordless signup failed:', response);
                res.status(400).json({
                    error: 'Failed to create signup code',
                    message: 'Could not send signup code to the provided email'
                });
            }
        } catch (error) {
            console.error('Passwordless signup error details:', error);
            res.status(500).json({
                error: 'Signup failed',
                message: 'An error occurred during account creation'
            });
        }

    } catch (error) {
        console.error('Unified signup error:', error);
        res.status(500).json({
            error: 'Signup failed',
            message: 'An error occurred during account creation'
        });
    }
});

/**
 * @route   POST /api/auth/signin
 * @desc    Unified signin endpoint - handles EmailPassword, Passwordless, and ThirdParty authentication
 * @access  Public
 * @body    For EmailPassword: { email, password }
 *          For Passwordless: { email } or { email, code, deviceId, preAuthSessionId }
 *          For ThirdParty: { provider, code, redirectURI } or { provider, authorizationCode }
 */
router.post('/signin', async (req, res) => {
    try {
        const { email, password, code, deviceId, preAuthSessionId, provider, redirectURI, authorizationCode } = req.body;

        // Third-party authentication
        if (provider) {
            console.log(`🌐 Third-party signin attempt with provider: ${provider}`);
            
            const availableProviders = ['google', 'github', 'apple'];
            
            if (!availableProviders.includes(provider.toLowerCase())) {
                return res.status(400).json({
                    error: 'Unsupported provider',
                    message: `Provider '${provider}' is not supported. Available providers: ${availableProviders.join(', ')}`,
                    availableProviders
                });
            }

            // Return OAuth URLs for the requested provider
            const baseUrl = process.env.API_DOMAIN || `http://localhost:${process.env.PORT || 8080}`;
            const authUrl = `${baseUrl}/auth/signin/${provider.toLowerCase()}`;
            
            return res.status(200).json({
                status: 'redirect_required',
                message: 'Third-party authentication requires OAuth flow',
                authMethod: 'thirdparty',
                data: {
                    provider: provider.toLowerCase(),
                    authUrl,
                    instructions: `Redirect user to: ${authUrl}`,
                    note: "Third-party signin/signup is handled automatically by SuperTokens OAuth flow"
                }
            });
        }

        if (!email) {
            return res.status(400).json({
                error: 'Email is required',
                message: 'Please provide an email address or a third-party provider'
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                error: 'Invalid email format',
                message: 'Please provide a valid email address'
            });
        }

        console.log(`🔐 Unified signin attempt for: ${email}`);

        // Check if this is a passwordless code consumption request
        if (code && deviceId && preAuthSessionId) {
            console.log('📱 Processing passwordless code consumption...');
            
            try {
                const response = await Passwordless.consumeCode({
                    tenantId: "public",
                    userInputCode: code,
                    deviceId: deviceId,
                    preAuthSessionId: preAuthSessionId,
                    userContext: {}
                });

                if (response.status === "OK") {
                    return res.status(200).json({
                        status: 'success',
                        message: 'Signed in successfully via passwordless',
                        authMethod: 'passwordless',
                        data: {
                            user: {
                                id: response.user.id,
                                email: response.user.email,
                                timeJoined: new Date(response.user.timeJoined).toISOString()
                            },
                            createdNewUser: response.createdNewUser
                        }
                    });
                } else if (response.status === "INCORRECT_USER_INPUT_CODE_ERROR") {
                    return res.status(400).json({
                        error: 'Invalid code',
                        message: 'The code you entered is incorrect or expired'
                    });
                } else if (response.status === "EXPIRED_USER_INPUT_CODE_ERROR") {
                    return res.status(400).json({
                        error: 'Code expired',
                        message: 'The code has expired. Please request a new one'
                    });
                } else {
                    console.error('Passwordless consume code failed:', response);
                    return res.status(400).json({
                        error: 'Authentication failed',
                        message: 'Failed to authenticate with the provided code'
                    });
                }
            } catch (error) {
                console.error('Passwordless consume code error details:', error);
                return res.status(500).json({
                    error: 'Authentication failed',
                    message: 'An error occurred during authentication'
                });
            }
        }

        // Check if this is an EmailPassword signin request
        if (password) {
            console.log('🔑 Processing EmailPassword signin...');
            
            try {
                const response = await EmailPassword.signIn("public", email, password);

                if (response.status === "OK") {
                    return res.status(200).json({
                        status: 'success',
                        message: 'Signed in successfully via email/password',
                        authMethod: 'emailpassword',
                        data: {
                            user: {
                                id: response.user.id,
                                email: response.user.email,
                                timeJoined: new Date(response.user.timeJoined).toISOString()
                            }
                        }
                    });
                } else if (response.status === "WRONG_CREDENTIALS_ERROR") {
                    return res.status(401).json({
                        error: 'Invalid credentials',
                        message: 'Email or password is incorrect'
                    });
                } else {
                    console.error('EmailPassword signin failed:', response);
                    return res.status(400).json({
                        error: 'Authentication failed',
                        message: 'Failed to authenticate with email and password'
                    });
                }
            } catch (error) {
                console.error('EmailPassword signin error details:', error);
                return res.status(500).json({
                    error: 'Authentication failed',
                    message: 'An error occurred during authentication'
                });
            }
        }

        // If no password provided, treat as passwordless code creation request
        console.log('📧 Creating passwordless login code...');
        
        try {
            const response = await Passwordless.createCode({
                tenantId: "public",
                email: email,
                userContext: {}
            });

            if (response.status === "OK") {
                res.status(200).json({
                    status: 'success',
                    message: 'Login code sent successfully',
                    authMethod: 'passwordless',
                    data: {
                        deviceId: response.deviceId,
                        preAuthSessionId: response.preAuthSessionId,
                        flowType: "USER_INPUT_CODE_AND_MAGIC_LINK",
                        instructions: "Check your email for the login code or magic link. To complete signin, call this endpoint again with: { email, code, deviceId, preAuthSessionId }"
                    }
                });
            } else {
                console.error('Passwordless create code failed:', response);
                res.status(400).json({
                    error: 'Failed to create login code',
                    message: 'Could not send login code to the provided email'
                });
            }
        } catch (error) {
            console.error('Passwordless create code error details:', error);
            res.status(500).json({
                error: 'Authentication failed',
                message: 'An error occurred during authentication'
            });
        }

    } catch (error) {
        console.error('Unified signin error:', error);
        res.status(500).json({
            error: 'Authentication failed',
            message: 'An error occurred during authentication'
        });
    }
});

// ============================================================================
// THIRD-PARTY OAUTH ENDPOINTS
// ============================================================================

/**
 * @route   GET /api/auth/providers
 * @desc    Get available OAuth providers and their URLs
 * @access  Public
 */
router.get('/providers', (req, res) => {
    const baseUrl = process.env.API_DOMAIN || `http://localhost:${process.env.PORT || 8080}`;
    
    const providers = [
        {
            name: 'google',
            displayName: 'Google',
            authUrl: `${baseUrl}/auth/signin/google`,
            signupUrl: `${baseUrl}/auth/signin/google`,
            icon: 'https://developers.google.com/identity/images/g-logo.png',
            description: 'Sign in with your Google account'
        },
        {
            name: 'github',
            displayName: 'GitHub',
            authUrl: `${baseUrl}/auth/signin/github`,
            signupUrl: `${baseUrl}/auth/signin/github`,
            icon: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
            description: 'Sign in with your GitHub account'
        },
        {
            name: 'apple',
            displayName: 'Apple',
            authUrl: `${baseUrl}/auth/signin/apple`,
            signupUrl: `${baseUrl}/auth/signin/apple`,
            icon: 'https://appleid.apple.com/appleauth/static/jsapi/appleid/1/images/appleid-signin-logo.png',
            description: 'Sign in with your Apple ID'
        }
    ];

    res.status(200).json({
        status: 'success',
        message: 'Available OAuth providers',
        data: {
            providers,
            totalProviders: providers.length,
            note: "OAuth authentication is handled by SuperTokens. Redirect to authUrl to initiate OAuth flow."
        }
    });
});

/**
 * @route   GET /api/auth/signin/:provider
 * @desc    Redirect to OAuth provider for authentication
 * @access  Public
 * @param   provider - google, github, or apple
 */
router.get('/signin/:provider', (req, res) => {
    const { provider } = req.params;
    const availableProviders = ['google', 'github', 'apple'];
    
    if (!availableProviders.includes(provider.toLowerCase())) {
        return res.status(400).json({
            error: 'Unsupported provider',
            message: `Provider '${provider}' is not supported. Available providers: ${availableProviders.join(', ')}`,
            availableProviders
        });
    }

    // This endpoint would typically be handled by SuperTokens frontend SDK
    // For API-only usage, return instructions
    return res.status(200).json({
        status: 'redirect_required',
        message: `${provider.toUpperCase()} OAuth authentication`,
        authMethod: 'thirdparty',
        data: {
            provider: provider.toLowerCase(),
            instructions: "This endpoint is typically handled by SuperTokens frontend SDK. For manual OAuth flow, implement the OAuth 2.0 authorization code flow.",
            oauthFlow: {
                step1: `Redirect user to ${provider} OAuth authorization URL`,
                step2: "Handle OAuth callback with authorization code",
                step3: "Exchange authorization code for access token",
                step4: "SuperTokens creates session automatically"
            },
            note: "For production use, integrate SuperTokens frontend SDK to handle OAuth flows automatically"
        }
    });
});

module.exports = router;
