import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('Authentication & User Endpoints (/api/v1/auth & /api/v1/user)', () => {
  const validUser = {
    email: 'muslim.user@example.com',
    password: 'SecurePassword123',
  };

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user successfully and return user, preferences, and tokens', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(validUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('id');
      expect(res.body.data.user.email).toBe(validUser.email);
      expect(res.body.data.user).not.toHaveProperty('passwordHash');
      expect(res.body.data.user).not.toHaveProperty('password');
      expect(res.body.data.preferences).toHaveProperty('madhhab', 'hanafi');
      expect(res.body.data.tokens).toHaveProperty('accessToken');
      expect(res.body.data.tokens).toHaveProperty('refreshToken');
    });

    it('should reject registration if email already exists', async () => {
      // First registration
      await request(app).post('/api/v1/auth/register').send(validUser);

      // Duplicate registration attempt
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(validUser);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('EMAIL_EXISTS');
    });

    it('should reject registration with invalid email format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'invalid-email', password: 'Password123' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject registration with weak password (missing number/uppercase)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ email: 'test@example.com', password: 'weak' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should authenticate user with valid credentials and return tokens', async () => {
      // Register user first
      await request(app).post('/api/v1/auth/register').send(validUser);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send(validUser);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(validUser.email);
      expect(res.body.data.tokens).toHaveProperty('accessToken');
      expect(res.body.data.tokens).toHaveProperty('refreshToken');
    });

    it('should reject login with incorrect password', async () => {
      await request(app).post('/api/v1/auth/register').send(validUser);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: validUser.email, password: 'WrongPassword999' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should reject login for non-existent email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'Password123' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should reject requests without authorization token', async () => {
      const res = await request(app).get('/api/v1/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should return profile and preferences for authenticated user', async () => {
      const regRes = await request(app).post('/api/v1/auth/register').send(validUser);
      const token = regRes.body.data.tokens.accessToken;

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(validUser.email);
      expect(res.body.data.preferences).toBeDefined();
    });

    it('should reject requests with invalid or tampered token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid.tampered.token');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_TOKEN');
    });
  });

  describe('POST /api/v1/auth/refresh and /api/v1/auth/logout', () => {
    it('should rotate refresh token and issue new access token', async () => {
      const regRes = await request(app).post('/api/v1/auth/register').send(validUser);
      const oldRefreshToken = regRes.body.data.tokens.refreshToken;

      const refreshRes = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: oldRefreshToken });

      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body.success).toBe(true);
      expect(refreshRes.body.data.tokens).toHaveProperty('accessToken');
      expect(refreshRes.body.data.tokens).toHaveProperty('refreshToken');
      expect(refreshRes.body.data.tokens.refreshToken).not.toBe(oldRefreshToken);

      // Attempting to reuse old refresh token should be rejected (Token Reuse Detection)
      const reuseRes = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: oldRefreshToken });

      expect(reuseRes.status).toBe(401);
      expect(reuseRes.body.error.code).toBe('TOKEN_REUSE_DETECTED');
    });

    it('should revoke refresh token on logout', async () => {
      const regRes = await request(app).post('/api/v1/auth/register').send(validUser);
      const refreshToken = regRes.body.data.tokens.refreshToken;

      const logoutRes = await request(app)
        .post('/api/v1/auth/logout')
        .send({ refreshToken });

      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body.success).toBe(true);

      // Refreshing with logged-out token should fail
      const tryRefresh = await request(app)
        .post('/api/v1/auth/refresh')
        .send({ refreshToken });

      expect(tryRefresh.status).toBe(401);
    });
  });

  describe('GET & PATCH /api/v1/user/preferences', () => {
    it('should fetch and update user preferences', async () => {
      const regRes = await request(app).post('/api/v1/auth/register').send(validUser);
      const token = regRes.body.data.tokens.accessToken;

      // Update preferences (change madhhab to shafii, timeFormat to 24h)
      const patchRes = await request(app)
        .patch('/api/v1/user/preferences')
        .set('Authorization', `Bearer ${token}`)
        .send({
          madhhab: 'shafii',
          timeFormat: '24h',
          calculationMethod: 'MWL',
          location: {
            city: 'London',
            country: 'United Kingdom',
            timezone: 'Europe/London',
          },
        });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.success).toBe(true);
      expect(patchRes.body.data.preferences.madhhab).toBe('shafii');
      expect(patchRes.body.data.preferences.timeFormat).toBe('24h');
      expect(patchRes.body.data.preferences.calculationMethod).toBe('MWL');
      expect(patchRes.body.data.preferences.location.city).toBe('London');

      // Verify persistence via GET /api/v1/user/preferences
      const getRes = await request(app)
        .get('/api/v1/user/preferences')
        .set('Authorization', `Bearer ${token}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.preferences.madhhab).toBe('shafii');
      expect(getRes.body.data.preferences.location.city).toBe('London');
    });
  });
});
