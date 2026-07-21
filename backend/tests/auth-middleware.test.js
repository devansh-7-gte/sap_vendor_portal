const request = require('supertest');
const buildTestApp = require('./testApp');
const { registerVendor } = require('./helpers');

const app = buildTestApp();

describe('x-vendor-id dev fallback (protect middleware)', () => {
  let vendor;

  beforeEach(async () => {
    ({ vendor } = await registerVendor(app));
  });

  it('authenticates via x-vendor-id when no JWT is sent and NODE_ENV is not production', async () => {
    const res = await request(app).get('/api/rfqs').set('x-vendor-id', vendor.vendorId);
    expect(res.status).toBe(200);
  });

  it('rejects x-vendor-id (with no JWT) once NODE_ENV=production, since the fallback is dev/test-only', async () => {
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      const res = await request(app).get('/api/rfqs').set('x-vendor-id', vendor.vendorId);
      expect(res.status).toBe(401);
    } finally {
      process.env.NODE_ENV = original;
    }
  });

  it('rejects requests with neither a JWT nor x-vendor-id', async () => {
    const res = await request(app).get('/api/rfqs');
    expect(res.status).toBe(401);
  });
});
