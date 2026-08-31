import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('GET /api/v1/health', () => {
  it('should return 200 OK with healthy status and database information', async () => {
    const res = await request(app).get('/api/v1/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('status', 'healthy');
    expect(res.body.data).toHaveProperty('environment');
    expect(res.body.data).toHaveProperty('database');
    expect(res.body.data.database.isConnected).toBe(true);
    expect(res.body.data).toHaveProperty('timestamp');
  });

  it('should return 404 for undefined endpoints', async () => {
    const res = await request(app).get('/api/v1/non-existent-endpoint');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
