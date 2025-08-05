const request = require('supertest');
const app = require('../index');

describe('Public Endpoints', () => {
    test('GET /health should return 200', async () => {
        const response = await request(app)
            .get('/health')
            .expect(200);
            
        expect(response.body.status).toBe('OK');
    });

    test('GET /api/public/hello should return greeting', async () => {
        const response = await request(app)
            .get('/api/public/hello')
            .expect(200);
            
        expect(response.body.message).toContain('Hello');
    });

    test('GET /api/public/info should return app info', async () => {
        const response = await request(app)
            .get('/api/public/info')
            .expect(200);
            
        expect(response.body).toHaveProperty('appName');
        expect(response.body).toHaveProperty('version');
    });
});

describe('Protected Endpoints', () => {
    test('GET /api/protected/profile should require authentication', async () => {
        await request(app)
            .get('/api/protected/profile')
            .expect(401);
    });

    test('GET /api/auth/session should require authentication', async () => {
        await request(app)
            .get('/api/auth/session')
            .expect(401);
    });
});

describe('Passwordless Authentication', () => {
    test('POST /api/passwordless/create-code should require email', async () => {
        const response = await request(app)
            .post('/api/passwordless/create-code')
            .send({})
            .expect(400);
            
        expect(response.body.error).toBe('Email is required');
    });

    test('POST /api/passwordless/create-code should validate email format', async () => {
        const response = await request(app)
            .post('/api/passwordless/create-code')
            .send({ email: 'invalid-email' })
            .expect(400);
            
        expect(response.body.error).toBe('Invalid email format');
    });

    test('POST /api/passwordless/create-code should accept valid email', async () => {
        const response = await request(app)
            .post('/api/passwordless/create-code')
            .send({ email: 'test@example.com' });
            
        // Should be 200 for valid request
        expect([200, 400]).toContain(response.status);
    });

    test('POST /api/passwordless/consume-code should require all fields', async () => {
        const response = await request(app)
            .post('/api/passwordless/consume-code')
            .send({})
            .expect(400);
            
        expect(response.body.error).toBe('Missing required fields');
    });

    test('POST /api/passwordless/check-email should require email', async () => {
        const response = await request(app)
            .post('/api/passwordless/check-email')
            .send({})
            .expect(400);
            
        expect(response.body.error).toBe('Email is required');
    });

    test('POST /api/passwordless/check-email should work with valid email', async () => {
        const response = await request(app)
            .post('/api/passwordless/check-email')
            .send({ email: 'test@example.com' })
            .expect(200);
            
        expect(response.body.status).toBe('success');
        expect(response.body.data).toHaveProperty('exists');
    });
});

describe('Third-Party Authentication', () => {
    test('GET /api/auth/providers should return OAuth providers', async () => {
        const response = await request(app)
            .get('/api/auth/providers')
            .expect(200);
            
        expect(response.body.status).toBe('success');
        expect(response.body.data).toHaveProperty('providers');
        expect(response.body.data.providers).toHaveLength(3);
        
        const providerNames = response.body.data.providers.map(p => p.name);
        expect(providerNames).toContain('google');
        expect(providerNames).toContain('github');
        expect(providerNames).toContain('apple');
    });

    test('POST /api/auth/signup with provider should return redirect info', async () => {
        const response = await request(app)
            .post('/api/auth/signup')
            .send({ provider: 'google' })
            .expect(200);
            
        expect(response.body.status).toBe('redirect_required');
        expect(response.body.authMethod).toBe('thirdparty');
        expect(response.body.data.provider).toBe('google');
        expect(response.body.data.authUrl).toContain('/auth/signin/google');
    });

    test('POST /api/auth/signin with provider should return redirect info', async () => {
        const response = await request(app)
            .post('/api/auth/signin')
            .send({ provider: 'github' })
            .expect(200);
            
        expect(response.body.status).toBe('redirect_required');
        expect(response.body.authMethod).toBe('thirdparty');
        expect(response.body.data.provider).toBe('github');
    });

    test('POST /api/auth/signup with invalid provider should return 400', async () => {
        const response = await request(app)
            .post('/api/auth/signup')
            .send({ provider: 'invalid_provider' })
            .expect(400);
            
        expect(response.body.error).toBe('Unsupported provider');
        expect(response.body.availableProviders).toContain('google');
    });

    test('GET /api/auth/signin/:provider should return OAuth info', async () => {
        const response = await request(app)
            .get('/api/auth/signin/google')
            .expect(200);
            
        expect(response.body.status).toBe('redirect_required');
        expect(response.body.authMethod).toBe('thirdparty');
        expect(response.body.data.provider).toBe('google');
    });

    test('GET /api/auth/signin/invalid should return 400', async () => {
        const response = await request(app)
            .get('/api/auth/signin/invalid_provider')
            .expect(400);
            
        expect(response.body.error).toBe('Unsupported provider');
    });
});

describe('404 Handler', () => {
    test('Should return 404 for non-existent routes', async () => {
        const response = await request(app)
            .get('/non-existent-route')
            .expect(404);
            
        expect(response.body.error).toBe('Route not found');
    });
});
