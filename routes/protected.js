const express = require('express');
const { verifySession } = require('supertokens-node/recipe/session/framework/express');
const { SessionRequest } = require('supertokens-node/framework/express');
const supertokens = require("supertokens-node");
const EmailPassword = require("supertokens-node/recipe/emailpassword");
const Passwordless = require("supertokens-node/recipe/passwordless");

const router = express.Router();

/**
 * @route   GET /api/protected/profile
 * @desc    Get user profile information
 * @access  Protected
 */
router.get('/profile', verifySession(), async (req, res) => {
    try {
        const userId = req.session.getUserId();
        const sessionHandle = req.session.getHandle();

        res.json({
            message: 'Profile retrieved successfully',
            data: {
                userId,
                sessionHandle,
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({
            error: 'Failed to retrieve profile',
            message: error.message
        });
    }
});

/**
 * @route   POST /api/protected/update-profile
 * @desc    Update user profile
 * @access  Protected
 */
router.post('/update-profile', verifySession(), async (req, res) => {
    try {
        const userId = req.session.getUserId();
        const { name, bio, preferences } = req.body;

        // Here you would typically update the user data in your database
        // For demo purposes, we'll just return the updated data
        const updatedProfile = {
            userId,
            name,
            bio,
            preferences,
            updatedAt: new Date().toISOString()
        };

        res.json({
            message: 'Profile updated successfully',
            data: updatedProfile
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            error: 'Failed to update profile',
            message: error.message
        });
    }
});

/**
 * @route   GET /api/protected/dashboard
 * @desc    Get user dashboard data
 * @access  Protected
 */
router.get('/dashboard', verifySession(), async (req, res) => {
    try {
        const userId = req.session.getUserId();
        
        // Mock dashboard data
        const dashboardData = {
            userId,
            stats: {
                totalLogins: 42,
                lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                accountCreated: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            },
            recentActivity: [
                { action: 'Profile updated', timestamp: new Date().toISOString() },
                { action: 'Login successful', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
                { action: 'Password changed', timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() }
            ]
        };

        res.json({
            message: 'Dashboard data retrieved successfully',
            data: dashboardData
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            error: 'Failed to retrieve dashboard data',
            message: error.message
        });
    }
});

/**
 * @route   GET /api/protected/users
 * @desc    Get list of all users (admin endpoint)
 * @access  Protected
 */
router.get('/users', verifySession(), async (req, res) => {
    try {
        const currentUserId = req.session.getUserId();
        const { limit = 10, offset = 0, search } = req.query;

        console.log(`👥 Admin ${currentUserId} requesting users list`);

        // For demo purposes, we'll return a mock list of users since SuperTokens 
        // doesn't provide a direct listUsers API in the SDK.
        // In a real application, you would:
        // 1. Store user data in your own database
        // 2. Use SuperTokens Core API directly
        // 3. Or use SuperTokens Dashboard for user management

        const mockUsers = [
            {
                id: currentUserId,
                email: "test123@example.com",
                timeJoined: "2025-08-04T12:21:20.540Z",
                loginMethods: [
                    {
                        recipeId: "emailpassword",
                        email: "test123@example.com",
                        verified: false,
                        timeJoined: "2025-08-04T12:21:20.540Z"
                    }
                ],
                tenantIds: ["public"]
            },
            {
                id: "6b5849de-a7c3-413f-a5c4-93c0049d9093",
                email: "newtest@example.com",
                timeJoined: "2025-08-04T12:28:29.883Z",
                loginMethods: [
                    {
                        recipeId: "emailpassword",
                        email: "newtest@example.com",
                        verified: false,
                        timeJoined: "2025-08-04T12:28:29.883Z"
                    }
                ],
                tenantIds: ["public"]
            }
        ];

        // Filter users if search term provided
        let users = mockUsers;
        if (search) {
            const searchLower = search.toLowerCase();
            users = users.filter(user => 
                user.email && user.email.toLowerCase().includes(searchLower)
            );
        }

        // Apply pagination
        const startIndex = parseInt(offset) || 0;
        const limitNum = parseInt(limit) || 10;
        const paginatedUsers = users.slice(startIndex, startIndex + limitNum);

        res.json({
            message: 'Users retrieved successfully',
            data: {
                users: paginatedUsers,
                totalCount: users.length,
                hasMore: startIndex + limitNum < users.length,
                pagination: {
                    offset: startIndex,
                    limit: limitNum,
                    total: users.length
                },
                requestedBy: currentUserId,
                timestamp: new Date().toISOString(),
                note: "This is a demo endpoint. In production, integrate with your user database or use SuperTokens Core API directly."
            }
        });
    } catch (error) {
        console.error('Users list error:', error);
        res.status(500).json({
            error: 'Failed to retrieve users',
            message: error.message
        });
    }
});

/**
 * @route   GET /api/protected/users/:userId
 * @desc    Get specific user details (admin endpoint)
 * @access  Protected
 */
router.get('/users/:userId', verifySession(), async (req, res) => {
    try {
        const currentUserId = req.session.getUserId();
        const { userId } = req.params;

        console.log(`👤 Admin ${currentUserId} requesting details for user ${userId}`);

        // For demo purposes, return mock user data
        // In a real application, you would fetch from your database
        const mockUser = {
            id: userId,
            email: userId === currentUserId ? "test123@example.com" : "demo@example.com",
            timeJoined: "2025-08-04T12:21:20.540Z",
            loginMethods: [
                {
                    recipeId: "emailpassword",
                    email: userId === currentUserId ? "test123@example.com" : "demo@example.com",
                    verified: false,
                    timeJoined: "2025-08-04T12:21:20.540Z"
                }
            ],
            tenantIds: ["public"]
        };

        res.json({
            message: 'User details retrieved successfully',
            data: {
                user: mockUser,
                requestedBy: currentUserId,
                timestamp: new Date().toISOString(),
                note: "This is a demo endpoint. In production, integrate with your user database."
            }
        });
    } catch (error) {
        console.error('User details error:', error);
        res.status(500).json({
            error: 'Failed to retrieve user details',
            message: error.message
        });
    }
});

/**
 * @route   DELETE /api/protected/users/:userId
 * @desc    Delete specific user (admin endpoint)
 * @access  Protected
 */
router.delete('/users/:userId', verifySession(), async (req, res) => {
    try {
        const currentUserId = req.session.getUserId();
        const { userId } = req.params;

        console.log(`🗑️ Admin ${currentUserId} requesting deletion of user ${userId}`);

        // Prevent self-deletion
        if (currentUserId === userId) {
            return res.status(400).json({
                error: 'Cannot delete yourself',
                message: 'Use the account deletion endpoint to delete your own account'
            });
        }

        // For demo purposes, simulate user deletion
        // In a real application, you would:
        // 1. Delete user from your database
        // 2. Revoke all user sessions
        // 3. Clean up related data

        res.json({
            message: 'User deletion simulated successfully',
            data: {
                deletedUserId: userId,
                deletedBy: currentUserId,
                timestamp: new Date().toISOString(),
                note: "This is a demo endpoint. In production, implement actual user deletion logic."
            }
        });
    } catch (error) {
        console.error('User deletion error:', error);
        res.status(500).json({
            error: 'Failed to delete user',
            message: error.message
        });
    }
});

/**
 * @route   DELETE /api/protected/account
 * @desc    Delete user account
 * @access  Protected
 */
router.delete('/account', verifySession(), async (req, res) => {
    try {
        const userId = req.session.getUserId();

        // Here you would typically:
        // 1. Delete user data from your database
        // 2. Revoke all sessions
        // 3. Clean up any related data

        // For demo purposes, we'll just revoke the session
        await req.session.revokeSession();

        res.json({
            message: 'Account deletion initiated successfully',
            data: {
                userId,
                deletedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Account deletion error:', error);
        res.status(500).json({
            error: 'Failed to delete account',
            message: error.message
        });
    }
});

module.exports = router;
