#!/usr/bin/env node

/**
 * Test script for unified authentication endpoints
 * Demonstrates both EmailPassword and Passwordless authentication flows
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:8080';

async function testEmailPasswordFlow() {
    console.log('\n🔑 Testing EmailPassword Authentication Flow');
    console.log('=' .repeat(50));

    try {
        // Test signup
        console.log('\n1. Testing EmailPassword Signup...');
        const signupData = {
            email: `test-${Date.now()}@example.com`,
            password: 'securePassword123'
        };

        const signupResponse = await axios.post(`${BASE_URL}/api/auth/signup`, signupData);
        console.log('✅ Signup successful:', {
            status: signupResponse.data.status,
            authMethod: signupResponse.data.authMethod,
            userId: signupResponse.data.data.user.id
        });

        // Test signin
        console.log('\n2. Testing EmailPassword Signin...');
        const signinResponse = await axios.post(`${BASE_URL}/api/auth/signin`, signupData);
        console.log('✅ Signin successful:', {
            status: signinResponse.data.status,
            authMethod: signinResponse.data.authMethod,
            userId: signinResponse.data.data.user.id
        });

    } catch (error) {
        console.error('❌ EmailPassword flow error:', error.response?.data || error.message);
    }
}

async function testPasswordlessFlow() {
    console.log('\n📧 Testing Passwordless Authentication Flow');
    console.log('=' .repeat(50));

    try {
        // Test code creation
        console.log('\n1. Testing Passwordless Code Creation...');
        const email = `passwordless-${Date.now()}@example.com`;
        
        const codeResponse = await axios.post(`${BASE_URL}/api/auth/signin`, { email });
        console.log('✅ Code creation successful:', {
            status: codeResponse.data.status,
            authMethod: codeResponse.data.authMethod,
            hasDeviceId: !!codeResponse.data.data.deviceId,
            hasPreAuthSessionId: !!codeResponse.data.data.preAuthSessionId
        });

        console.log('\n📝 Note: In a real application, the user would receive an email with:');
        console.log('   - Magic link for one-click authentication');
        console.log('   - OTP code for manual entry');
        console.log('   - Both options lead to the same authentication result');

        // Test invalid code consumption
        console.log('\n2. Testing Invalid Code Consumption...');
        try {
            await axios.post(`${BASE_URL}/api/auth/signin`, {
                email,
                code: '000000',
                deviceId: codeResponse.data.data.deviceId,
                preAuthSessionId: codeResponse.data.data.preAuthSessionId
            });
        } catch (error) {
            console.log('✅ Invalid code properly rejected:', error.response.data.message);
        }

    } catch (error) {
        console.error('❌ Passwordless flow error:', error.response?.data || error.message);
    }
}

async function testPasswordlessSignup() {
    console.log('\n📝 Testing Passwordless Signup Flow');
    console.log('=' .repeat(50));

    try {
        console.log('\n1. Testing Passwordless Signup (Code Creation)...');
        const email = `signup-passwordless-${Date.now()}@example.com`;
        
        const signupResponse = await axios.post(`${BASE_URL}/api/auth/signup`, { email });
        console.log('✅ Passwordless signup code sent:', {
            status: signupResponse.data.status,
            authMethod: signupResponse.data.authMethod,
            message: signupResponse.data.message
        });

    } catch (error) {
        console.error('❌ Passwordless signup error:', error.response?.data || error.message);
    }
}

async function main() {
    console.log('🚀 Unified Authentication Flow Tests');
    console.log('Testing both EmailPassword and Passwordless authentication');
    console.log('Server should be running on', BASE_URL);

    // Check if server is running
    try {
        await axios.get(`${BASE_URL}/health`);
        console.log('✅ Server is running');
    } catch (error) {
        console.error('❌ Server is not running. Please start the server first:');
        console.error('   npm start');
        process.exit(1);
    }

    await testEmailPasswordFlow();
    await testPasswordlessFlow();
    await testPasswordlessSignup();

    console.log('\n🎉 All tests completed!');
    console.log('\n💡 Key Benefits of Unified Endpoints:');
    console.log('   ✅ Single endpoint handles multiple auth methods');
    console.log('   ✅ Frontend can use same API for different flows');
    console.log('   ✅ Automatic method detection based on payload');
    console.log('   ✅ Consistent response format with authMethod indicator');
    console.log('   ✅ Simplified client-side authentication logic');
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { testEmailPasswordFlow, testPasswordlessFlow, testPasswordlessSignup };
