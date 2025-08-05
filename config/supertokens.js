const supertokens = require("supertokens-node");
const Session = require("supertokens-node/recipe/session");
const EmailPassword = require("supertokens-node/recipe/emailpassword");
const Passwordless = require("supertokens-node/recipe/passwordless");
const ThirdParty = require("supertokens-node/recipe/thirdparty");

require('dotenv').config();

function initSuperTokens() {
    console.log('🔧 Initializing SuperTokens with configuration:');
    console.log(`   API Domain: ${process.env.API_DOMAIN || `http://localhost:${process.env.PORT || 8080}`}`);
    console.log(`   Website Domain: ${process.env.APP_WEBSITE_URL || "http://localhost:3000"}`);
    console.log(`   SuperTokens URI: ${process.env.SUPERTOKENS_CONNECTION_URI || "https://try.supertokens.com"}`);
    
    supertokens.init({
        framework: "express",
        supertokens: {
            connectionURI: process.env.SUPERTOKENS_CONNECTION_URI || "https://try.supertokens.com",
            apiKey: process.env.SUPERTOKENS_API_KEY || "",
        },
        appInfo: {
            appName: process.env.APP_NAME || "SuperTokens Node Backend",
            apiDomain: process.env.API_DOMAIN || `http://localhost:${process.env.PORT || 8080}`,
            websiteDomain: process.env.APP_WEBSITE_URL || "http://localhost:3000",
            apiBasePath: "/auth",
            websiteBasePath: "/auth"
        },
        recipeList: [
            EmailPassword.init({
                signUpFeature: {
                    formFields: [{
                        id: "email",
                        validate: async (value) => {
                            if (typeof value !== "string") {
                                return "Please provide a valid email";
                            }
                            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                            if (!emailRegex.test(value)) {
                                return "Please provide a valid email";
                            }
                            return undefined;
                        }
                    }, {
                        id: "password",
                        validate: async (value) => {
                            if (typeof value !== "string") {
                                return "Please provide a valid password";
                            }
                            if (value.length < 8) {
                                return "Password must be at least 8 characters long";
                            }
                            return undefined;
                        }
                    }]
                },
                override: {
                    apis: (originalImplementation) => {
                        return {
                            ...originalImplementation,
                            signUpPOST: async function (input) {
                                if (originalImplementation.signUpPOST === undefined) {
                                    throw Error("Should never come here");
                                }

                                let response = await originalImplementation.signUpPOST(input);

                                if (response.status === "OK") {
                                    // User was created successfully
                                    console.log(`New user created: ${response.user.email}`);
                                }

                                return response;
                            },
                            signInPOST: async function (input) {
                                if (originalImplementation.signInPOST === undefined) {
                                    throw Error("Should never come here");
                                }

                                let response = await originalImplementation.signInPOST(input);

                                if (response.status === "OK") {
                                    // User signed in successfully
                                    console.log(`User signed in: ${response.user.email}`);
                                }

                                return response;
                            }
                        }
                    }
                }
            }),
            // Passwordless authentication (Magic Links + OTP)
            Passwordless.init({
                flowType: "USER_INPUT_CODE_AND_MAGIC_LINK", // Supports both OTP and magic links
                contactMethod: "EMAIL", // Use email for passwordless login
                createAndSendCustomEmail: (input, userContext) => {
                    console.log(`📧 Sending passwordless email to: ${input.email}`);
                    console.log(`🔗 Magic link: ${input.urlWithLinkCode}`);
                    console.log(`🔢 User input code: ${input.userInputCode}`);
                    
                    // For development, we'll use the default implementation
                    // In production, you can customize this to use your own email service
                    return undefined; // Use default email sending
                },
                override: {
                    functions: (originalImplementation) => {
                        return {
                            ...originalImplementation,
                            createCodePOST: async function (input) {
                                console.log(`🔐 Creating passwordless code for: ${input.email || input.phoneNumber}`);
                                return originalImplementation.createCodePOST(input);
                            },
                            consumeCodePOST: async function (input) {
                                let response = await originalImplementation.consumeCodePOST(input);
                                if (response.status === "OK") {
                                    if (response.createdNewUser) {
                                        console.log(`🆕 New passwordless user created: ${response.user.email || response.user.phoneNumber}`);
                                    } else {
                                        console.log(`🔐 Passwordless user signed in: ${response.user.email || response.user.phoneNumber}`);
                                    }
                                }
                                return response;
                            }
                        }
                    }
                }
            }),
            // Third-party authentication (Google, GitHub, Apple, etc.)
            ThirdParty.init({
                signInAndUpFeature: {
                    providers: [
                        // Google OAuth
                        {
                            config: {
                                thirdPartyId: "google",
                                clients: [{
                                    clientId: process.env.GOOGLE_CLIENT_ID || "your-google-client-id",
                                    clientSecret: process.env.GOOGLE_CLIENT_SECRET || "your-google-client-secret"
                                }]
                            }
                        },
                        // GitHub OAuth
                        {
                            config: {
                                thirdPartyId: "github",
                                clients: [{
                                    clientId: process.env.GITHUB_CLIENT_ID || "your-github-client-id",
                                    clientSecret: process.env.GITHUB_CLIENT_SECRET || "your-github-client-secret"
                                }]
                            }
                        },
                        // Apple OAuth
                        {
                            config: {
                                thirdPartyId: "apple",
                                clients: [{
                                    clientId: process.env.APPLE_CLIENT_ID || "your-apple-client-id",
                                    additionalConfig: {
                                        keyId: process.env.APPLE_KEY_ID || "your-apple-key-id",
                                        privateKey: process.env.APPLE_PRIVATE_KEY || "your-apple-private-key",
                                        teamId: process.env.APPLE_TEAM_ID || "your-apple-team-id"
                                    }
                                }]
                            }
                        }
                    ]
                },
                override: {
                    functions: (originalImplementation) => {
                        return {
                            ...originalImplementation,
                            signInUpPOST: async function (input) {
                                let response = await originalImplementation.signInUpPOST(input);
                                if (response.status === "OK") {
                                    if (response.createdNewUser) {
                                        console.log(`🆕 New third-party user created: ${response.user.email} via ${input.provider.id}`);
                                    } else {
                                        console.log(`🔐 Third-party user signed in: ${response.user.email} via ${input.provider.id}`);
                                    }
                                }
                                return response;
                            }
                        }
                    }
                }
            }),
            Session.init({
                cookieSecure: process.env.NODE_ENV === "production",
                cookieSameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                sessionExpiredStatusCode: 401,
                // Increase session timeouts for better UX
                accessTokenValidity: 3600, // 1 hour
                refreshTokenValidity: 60 * 60 * 24 * 100, // ~100 days
                override: {
                    functions: (originalImplementation) => {
                        return {
                            ...originalImplementation,
                            createNewSession: async function (input) {
                                console.log(`🔐 Creating new session for user: ${input.userId}`);
                                return originalImplementation.createNewSession(input);
                            }
                        }
                    }
                }
            })
        ]
    });
}

module.exports = { initSuperTokens };
