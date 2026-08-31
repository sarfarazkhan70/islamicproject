import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { User } from '../src/models/User.js';

describe('Security & Isolation Tests', () => {
  const userA = { email: 'userA@example.com', password: 'PasswordA123' };
  const userB = { email: 'userB@example.com', password: 'PasswordB123' };

  it('should enforce user data isolation so User A cannot access or mutate User B data', async () => {
    // Register User A
    const resA = await request(app).post('/api/v1/auth/register').send(userA);
    const tokenA = resA.body.data.tokens.accessToken;

    // Register User B
    const resB = await request(app).post('/api/v1/auth/register').send(userB);
    const tokenB = resB.body.data.tokens.accessToken;

    // User A updates preferences
    await request(app)
      .patch('/api/v1/user/preferences')
      .set('Authorization', `Bearer ${tokenA}`)
      .send({ madhhab: 'hanafi', timeFormat: '24h' });

    // User B updates preferences
    await request(app)
      .patch('/api/v1/user/preferences')
      .set('Authorization', `Bearer ${tokenB}`)
      .send({ madhhab: 'shafii', timeFormat: '12h' });

    // Verify User A preferences are isolated
    const getA = await request(app)
      .get('/api/v1/user/preferences')
      .set('Authorization', `Bearer ${tokenA}`);

    expect(getA.body.data.preferences.madhhab).toBe('hanafi');
    expect(getA.body.data.preferences.timeFormat).toBe('24h');

    // Verify User B preferences are isolated
    const getB = await request(app)
      .get('/api/v1/user/preferences')
      .set('Authorization', `Bearer ${tokenB}`);

    expect(getB.body.data.preferences.madhhab).toBe('shafii');
    expect(getB.body.data.preferences.timeFormat).toBe('12h');
  });

  it('should never expose passwordHash in database queries without explicit select', async () => {
    await request(app).post('/api/v1/auth/register').send(userA);
    const userDoc = await User.findOne({ email: userA.email });

    expect(userDoc).toBeDefined();
    expect(userDoc?.passwordHash).toBeUndefined();
  });

  it('should include Helmet security headers on responses', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.headers).toHaveProperty('x-content-type-options', 'nosniff');
    expect(res.headers).toHaveProperty('x-frame-options', 'SAMEORIGIN');
  });

  it('should format error responses consistently without exposing internal stack traces', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'bad-email', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toHaveProperty('code');
    expect(res.body.error).toHaveProperty('message');
    expect(res.body).not.toHaveProperty('stack');
  });
});
