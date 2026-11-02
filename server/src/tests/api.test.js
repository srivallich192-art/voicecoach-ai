import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';

describe('API Integration Endpoints', () => {
  it('GET /api/health returns 200 with health status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('healthy');
    expect(res.body.error).toBeNull();
  });

  it('GET /api/config/roles returns domain options and coaching configuration', async () => {
    const res = await request(app).get('/api/config/roles');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.domains)).toBe(true);
    expect(res.body.data.domains.length).toBeGreaterThan(5);
    expect(res.body.data.coachingConfig.pace.idealMin).toBe(110);
  });

  it('Protected routes reject unauthenticated requests with 401', async () => {
    const res = await request(app).get('/api/profile');
    expect(res.status).toBe(401);
    expect(res.body.data).toBeNull();
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('Unmatched routes return 404 with structured error envelope', async () => {
    const res = await request(app).get('/api/unknown-endpoint-xyz');
    expect(res.status).toBe(404);
    expect(res.body.data).toBeNull();
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

