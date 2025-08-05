const express = require('express');
const Passwordless = require("supertokens-node/recipe/passwordless");
const { verifySession } = require("supertokens-node/recipe/session/framework/express");
const router = express.Router();

/**
 * @route POST /api/passwordless/create-code
 * @desc Create a passwordless login code (OTP/Magic Link)
 * @access Public
 */
router.post('/create-code', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                error: 'Email is required',
                message: 'Please provide an email address'
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

        console.log(`🔐 Creating passwordless code for: ${email}`);

        // Create the passwordless code
        const response = await Passwordless.createCode({
            email: email,
            userContext: {}
        });

        if (response.status === "OK") {
            res.status(200).json({
                status: 'success',
                message: 'Login code sent successfully',
                data: {
                    deviceId: response.deviceId,
                    preAuthSessionId: response.preAuthSessionId,
                    flowType: "USER_INPUT_CODE_AND_MAGIC_LINK"
                }
            });
        } else {
            res.status(400).json({
                error: 'Failed to create code',
                message: 'Could not generate login code. Please try again.',
                details: response
            });
        }
    } catch (error) {
        console.error('Error creating passwordless code:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to create login code'
        });
    }
});

/**
 * @route POST /api/passwordless/consume-code
 * @desc Verify and consume a passwordless login code
 * @access Public
 */
router.post('/consume-code', async (req, res) => {
    try {
        const { deviceId, preAuthSessionId, userInputCode } = req.body;

        if (!deviceId || !preAuthSessionId || !userInputCode) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'deviceId, preAuthSessionId, and userInputCode are required'
            });
        }

        console.log(`🔐 Consuming passwordless code for device: ${deviceId}`);

        // Consume the code
        const response = await Passwordless.consumeCode({
            deviceId,
            preAuthSessionId,
            userInputCode,
            userContext: {}
        });

        if (response.status === "OK") {
            res.status(200).json({
                status: 'success',
                message: response.createdNewUser ? 'Account created and signed in successfully' : 'Signed in successfully',
                data: {
                    user: {
                        id: response.user.id,
                        email: response.user.email,
                        timeJoined: response.user.timeJoined
                    },
                    createdNewUser: response.createdNewUser
                }
            });
        } else if (response.status === "INCORRECT_USER_INPUT_CODE_ERROR") {
            res.status(400).json({
                error: 'Invalid code',
                message: 'The code you entered is incorrect. Please try again.',
                details: {
                    failedCodeInputAttemptCount: response.failedCodeInputAttemptCount,
                    maximumCodeInputAttempts: response.maximumCodeInputAttempts
                }
            });
        } else if (response.status === "EXPIRED_USER_INPUT_CODE_ERROR") {
            res.status(400).json({
                error: 'Code expired',
                message: 'The code has expired. Please request a new one.',
                details: {
                    failedCodeInputAttemptCount: response.failedCodeInputAttemptCount,
                    maximumCodeInputAttempts: response.maximumCodeInputAttempts
                }
            });
        } else if (response.status === "RESTART_FLOW_ERROR") {
            res.status(400).json({
                error: 'Flow restart required',
                message: 'Please restart the login process and request a new code.'
            });
        } else {
            res.status(400).json({
                error: 'Login failed',
                message: 'Could not complete login. Please try again.',
                details: response
            });
        }
    } catch (error) {
        console.error('Error consuming passwordless code:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to verify login code'
        });
    }
});

/**
 * @route POST /api/passwordless/resend-code
 * @desc Resend a passwordless login code
 * @access Public
 */
router.post('/resend-code', async (req, res) => {
    try {
        const { deviceId, preAuthSessionId } = req.body;

        if (!deviceId || !preAuthSessionId) {
            return res.status(400).json({
                error: 'Missing required fields',
                message: 'deviceId and preAuthSessionId are required'
            });
        }

        console.log(`🔄 Resending passwordless code for device: ${deviceId}`);

        // Resend the code
        const response = await Passwordless.resendCode({
            deviceId,
            preAuthSessionId,
            userContext: {}
        });

        if (response.status === "OK") {
            res.status(200).json({
                status: 'success',
                message: 'Login code resent successfully'
            });
        } else if (response.status === "RESTART_FLOW_ERROR") {
            res.status(400).json({
                error: 'Flow restart required',
                message: 'Please restart the login process and request a new code.'
            });
        } else {
            res.status(400).json({
                error: 'Resend failed',
                message: 'Could not resend code. Please try again.',
                details: response
            });
        }
    } catch (error) {
        console.error('Error resending passwordless code:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to resend login code'
        });
    }
});

/**
 * @route GET /api/passwordless/user-info
 * @desc Get current user information (passwordless)
 * @access Protected
 */
router.get('/user-info', verifySession(), async (req, res) => {
    try {
        const userId = req.session.getUserId();
        
        // Get user info from Passwordless recipe
        const userInfo = await Passwordless.getUserById({ userId });
        
        if (userInfo) {
            res.status(200).json({
                status: 'success',
                data: {
                    id: userInfo.id,
                    email: userInfo.email,
                    phoneNumber: userInfo.phoneNumber,
                    timeJoined: userInfo.timeJoined
                }
            });
        } else {
            res.status(404).json({
                error: 'User not found',
                message: 'User information could not be retrieved'
            });
        }
    } catch (error) {
        console.error('Error getting user info:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to retrieve user information'
        });
    }
});

/**
 * @route GET /api/passwordless/check-email
 * @desc Check if email exists in the system
 * @access Public
 */
router.post('/check-email', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                error: 'Email is required',
                message: 'Please provide an email address'
            });
        }

        // Get user by email
        const user = await Passwordless.getUserByEmail({ email });
        
        res.status(200).json({
            status: 'success',
            data: {
                exists: user !== undefined,
                email: email
            }
        });
    } catch (error) {
        console.error('Error checking email:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: 'Failed to check email'
        });
    }
});

module.exports = router;
