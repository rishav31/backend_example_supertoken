#!/usr/bin/env node

/**
 * Test script for user management endpoints
 * Demonstrates how to list and manage users
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:8080';

async function testUserManagement() {
    console.log('\n👥 Testing User Management Endpoints');
    console.log('=' .repeat(50));

    try {
        // First, sign in to get a session
        console.log('\n1. Signing in to get session...');
        const signinResponse = await axios.post(`${BASE_URL}/auth/signin`, {
            formFields: [
                { id: "email", value: "test123@example.com" },
                { id: "password", value: "password123" }
            ]
        });

        console.log('✅ Signed in successfully');
        
        // Extract session tokens from headers
        const accessToken = signinResponse.headers['st-access-token'];
        const frontToken = signinResponse.headers['front-token'];
        
        if (!accessToken) {
            console.error('❌ No access token received');
            return;
        }

        console.log('✅ Session tokens obtained');

        // Set up axios instance with session headers and cookies
        const authenticatedAxios = axios.create({
            baseURL: BASE_URL,
            headers: {
                'st-access-token': accessToken,
                'front-token': frontToken,
                'Cookie': signinResponse.headers['set-cookie']?.join('; ') || ''
            },
            withCredentials: true
        });

        // Test users list endpoint
        console.log('\n2. Testing Users List Endpoint...');
        try {
            const usersResponse = await authenticatedAxios.get('/api/protected/users');
            console.log('✅ Users list retrieved:', {
                totalUsers: usersResponse.data.data.users.length,
                firstUser: usersResponse.data.data.users[0]?.email,
                note: usersResponse.data.data.note
            });
        } catch (error) {
            console.error('❌ Users list failed:', error.response?.data || error.message);
        }

        // Test users list with search
        console.log('\n3. Testing Users List with Search...');
        try {
            const searchResponse = await authenticatedAxios.get('/api/protected/users?search=test');
            console.log('✅ Search results:', {
                matchingUsers: searchResponse.data.data.users.length,
                users: searchResponse.data.data.users.map(u => u.email)
            });
        } catch (error) {
            console.error('❌ Search failed:', error.response?.data || error.message);
        }

        // Test user details endpoint
        console.log('\n4. Testing User Details Endpoint...');
        try {
            const userDetailsResponse = await authenticatedAxios.get('/api/protected/users/5050646e-30a4-4b8c-956e-f599c18a5b4d');
            console.log('✅ User details retrieved:', {
                email: userDetailsResponse.data.data.user.email,
                timeJoined: userDetailsResponse.data.data.user.timeJoined
            });
        } catch (error) {
            console.error('❌ User details failed:', error.response?.data || error.message);
        }

        // Test pagination
        console.log('\n5. Testing Pagination...');
        try {
            const paginationResponse = await authenticatedAxios.get('/api/protected/users?limit=1&offset=0');
            console.log('✅ Pagination working:', {
                returnedUsers: paginationResponse.data.data.users.length,
                totalCount: paginationResponse.data.data.totalCount,
                hasMore: paginationResponse.data.data.hasMore
            });
        } catch (error) {
            console.error('❌ Pagination failed:', error.response?.data || error.message);
        }

    } catch (error) {
        console.error('❌ Authentication failed:', error.response?.data || error.message);
    }
}

async function main() {
    console.log('🚀 User Management Endpoints Test');
    console.log('Testing user listing and management functionality');
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

    await testUserManagement();

    console.log('\n🎉 User Management Tests Completed!');
    console.log('\n💡 Available User Management Endpoints:');
    console.log('   📋 GET  /api/protected/users - List all users');
    console.log('   🔍 GET  /api/protected/users?search=email - Search users');
    console.log('   👤 GET  /api/protected/users/:id - Get user details');
    console.log('   🗑️  DELETE /api/protected/users/:id - Delete user');
    console.log('\n📝 Note: These are demo endpoints with mock data.');
    console.log('    In production, integrate with your user database.');
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { testUserManagement };
