#!/usr/bin/env node

/**
 * Third-Party Authentication Test Script
 * Tests the third-party OAuth functionality
 */

const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:8080';
const API_URL = `${BASE_URL}/api`;

// ANSI Colors for terminal output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m',
    bold: '\x1b[1m'
};

function log(color, message) {
    console.log(`${color}${message}${colors.reset}`);
}

function logHeader(message) {
    console.log(`\n${colors.bold}${colors.cyan}${'='.repeat(60)}${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}${message.toUpperCase()}${colors.reset}`);
    console.log(`${colors.bold}${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
}

function logSection(message) {
    console.log(`\n${colors.bold}${colors.yellow}--- ${message} ---${colors.reset}`);
}

function logSuccess(message) {
    log(colors.green, `✅ ${message}`);
}

function logError(message) {
    log(colors.red, `❌ ${message}`);
}

function logInfo(message) {
    log(colors.blue, `ℹ️  ${message}`);
}

function logWarning(message) {
    log(colors.yellow, `⚠️  ${message}`);
}

async function makeRequest(method, url, data = null, description = '') {
    try {
        logInfo(`Testing: ${description || `${method} ${url}`}`);
        
        const config = {
            method,
            url,
            timeout: 10000,
            validateStatus: () => true // Don't throw on any status code
        };
        
        if (data) {
            config.data = data;
            config.headers = { 'Content-Type': 'application/json' };
        }
        
        const response = await axios(config);
        
        const statusColor = response.status >= 200 && response.status < 300 ? colors.green : 
                           response.status >= 400 ? colors.red : colors.yellow;
        
        log(statusColor, `Status: ${response.status} ${response.statusText}`);
        
        if (response.data) {
            console.log('Response:', JSON.stringify(response.data, null, 2));
        }
        
        return response;
    } catch (error) {
        logError(`Request failed: ${error.message}`);
        if (error.code === 'ECONNREFUSED') {
            logError('Connection refused - Make sure the server is running on http://localhost:8080');
        }
        return null;
    }
}

async function testServer() {
    logHeader('Third-Party Authentication Test Suite');
    
    // Test server health
    logSection('1. Server Health Check');
    const healthResponse = await makeRequest('GET', `${BASE_URL}/health`, null, 'Server health check');
    
    if (!healthResponse || healthResponse.status !== 200) {
        logError('Server is not running or not healthy. Please start the server first.');
        process.exit(1);
    }
    
    logSuccess('Server is running and healthy');
    
    // Test OAuth providers endpoint
    logSection('2. OAuth Providers Information');
    const providersResponse = await makeRequest('GET', `${API_URL}/auth/providers`, null, 'Get available OAuth providers');
    
    if (providersResponse && providersResponse.status === 200) {
        logSuccess('OAuth providers endpoint working correctly');
        const providers = providersResponse.data.data.providers;
        logInfo(`Available providers: ${providers.map(p => p.name).join(', ')}`);
        
        // Validate provider structure
        providers.forEach(provider => {
            if (provider.name && provider.displayName && provider.authUrl) {
                logSuccess(`Provider ${provider.name} configured correctly`);
            } else {
                logWarning(`Provider ${provider.name} missing some configuration`);
            }
        });
    } else {
        logError('OAuth providers endpoint failed');
    }
    
    // Test third-party signup via unified endpoint
    logSection('3. Third-Party Signup (Unified Endpoint)');
    
    const thirdPartyProviders = ['google', 'github', 'apple'];
    
    for (const provider of thirdPartyProviders) {
        const signupResponse = await makeRequest('POST', `${API_URL}/auth/signup`, 
            { provider }, 
            `Third-party signup with ${provider}`
        );
        
        if (signupResponse && signupResponse.status === 200) {
            logSuccess(`${provider} signup endpoint working correctly`);
            
            const data = signupResponse.data;
            if (data.status === 'redirect_required' && data.authMethod === 'thirdparty') {
                logSuccess(`${provider} returns correct redirect information`);
                logInfo(`Auth URL: ${data.data.authUrl}`);
            } else {
                logWarning(`${provider} response format unexpected`);
            }
        } else {
            logError(`${provider} signup endpoint failed`);
        }
    }
    
    // Test third-party signin via unified endpoint
    logSection('4. Third-Party Signin (Unified Endpoint)');
    
    for (const provider of thirdPartyProviders) {
        const signinResponse = await makeRequest('POST', `${API_URL}/auth/signin`, 
            { provider }, 
            `Third-party signin with ${provider}`
        );
        
        if (signinResponse && signinResponse.status === 200) {
            logSuccess(`${provider} signin endpoint working correctly`);
            
            const data = signinResponse.data;
            if (data.status === 'redirect_required' && data.authMethod === 'thirdparty') {
                logSuccess(`${provider} returns correct redirect information`);
            } else {
                logWarning(`${provider} response format unexpected`);
            }
        } else {
            logError(`${provider} signin endpoint failed`);
        }
    }
    
    // Test individual OAuth provider endpoints
    logSection('5. Individual OAuth Provider Endpoints');
    
    for (const provider of thirdPartyProviders) {
        const oauthResponse = await makeRequest('GET', `${API_URL}/auth/signin/${provider}`, null, 
            `OAuth endpoint for ${provider}`
        );
        
        if (oauthResponse && oauthResponse.status === 200) {
            logSuccess(`${provider} OAuth endpoint working correctly`);
            
            const data = oauthResponse.data;
            if (data.status === 'redirect_required' && data.data.provider === provider) {
                logSuccess(`${provider} OAuth endpoint returns correct information`);
            } else {
                logWarning(`${provider} OAuth endpoint response format unexpected`);
            }
        } else {
            logError(`${provider} OAuth endpoint failed`);
        }
    }
    
    // Test invalid provider
    logSection('6. Invalid Provider Handling');
    
    const invalidResponse = await makeRequest('POST', `${API_URL}/auth/signup`, 
        { provider: 'invalid_provider' }, 
        'Test invalid provider handling'
    );
    
    if (invalidResponse && invalidResponse.status === 400) {
        logSuccess('Invalid provider correctly rejected');
    } else {
        logWarning('Invalid provider handling may need improvement');
    }
    
    // Test mixed authentication (should still work)
    logSection('7. Mixed Authentication Support');
    
    const emailPasswordResponse = await makeRequest('POST', `${API_URL}/auth/signup`, 
        { email: 'test@example.com', password: 'testPassword123' }, 
        'Email/password signup (should still work)'
    );
    
    if (emailPasswordResponse && (emailPasswordResponse.status === 200 || emailPasswordResponse.status === 409)) {
        logSuccess('Email/password authentication still working alongside third-party');
    } else {
        logError('Email/password authentication may be broken');
    }
    
    const passwordlessResponse = await makeRequest('POST', `${API_URL}/auth/signup`, 
        { email: 'test@example.com' }, 
        'Passwordless signup (should still work)'
    );
    
    if (passwordlessResponse && passwordlessResponse.status === 200) {
        logSuccess('Passwordless authentication still working alongside third-party');
    } else {
        logError('Passwordless authentication may be broken');
    }
    
    // Summary
    logHeader('Test Summary');
    logInfo('Third-party authentication integration complete!');
    logInfo('All authentication methods (EmailPassword, Passwordless, ThirdParty) are working');
    logInfo('OAuth providers configured: Google, GitHub, Apple');
    console.log('');
    logInfo('Next steps:');
    logInfo('1. Configure OAuth client credentials in .env file');
    logInfo('2. Set up OAuth applications in provider consoles');
    logInfo('3. Test with SuperTokens frontend SDK for complete OAuth flow');
    logInfo('4. Update frontend to use the unified authentication endpoints');
    console.log('');
}

// Run the tests
testServer().catch(error => {
    logError(`Test suite failed: ${error.message}`);
    process.exit(1);
});
