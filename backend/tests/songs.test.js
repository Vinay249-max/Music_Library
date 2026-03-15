/**
 * Songs API Tests
 * Tools: Mocha (test runner) + Chai (assertions) + Supertest (HTTP requests)
 *
 * Uses the seeded admin account → no new user creation needed.
 */
const request    = require('supertest');
const { expect } = require('chai');
const mongoose   = require('mongoose');
const app        = require('../server');
require('dotenv').config();

// ── Seeded admin credentials (from seedRoles.js) ─────────────────────────────
const ADMIN_EMAIL    = 'admin@musiclibrary.com';
const ADMIN_PASSWORD = 'Admin@1234';

let adminToken = '';

// ── Connect to DB before all tests ──────────────────────────────────────────
before(async function () {
  this.timeout(15000);
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }
});

// ── Login as admin before tests to get token ────────────────────────────────
before(async function () {
  this.timeout(10000);
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

  adminToken = res.body.token || '';
});

// ── Disconnect after all tests ───────────────────────────────────────────────
after(async function () {
  await mongoose.disconnect();
});

// ── Test Suite ────────────────────────────────────────────────────────────────
describe('Songs API Tests', function () {
  this.timeout(10000);

  // ── GET /api/songs ───────────────────────────────────────────────────────
  describe('GET /api/songs', function () {
    it('should return 401 when no token is provided', async function () {
      const res = await request(app).get('/api/songs');
      expect(res.status).to.equal(401);
    });

    it('should return an array of songs for an authenticated user', async function () {
      const res = await request(app)
        .get('/api/songs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });

    it('should support search query parameter', async function () {
      const res = await request(app)
        .get('/api/songs?search=a')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });
  });

  // ── POST /api/songs (Admin only) ─────────────────────────────────────────
  describe('POST /api/songs (Admin only)', function () {
    it('should return 400 when admin tries to add a song without a file', async function () {
      // Admin IS allowed to POST but needs a file — expect 400 (missing file), not 403
      const res = await request(app)
        .post('/api/songs')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('songName', 'Test Song')
        .field('albumId',  new mongoose.Types.ObjectId().toString())
        .field('directorId', new mongoose.Types.ObjectId().toString());

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('message');
    });
  });

  // ── GET /api/songs/:id ───────────────────────────────────────────────────
  describe('GET /api/songs/:id', function () {
    it('should return 404 for a non-existent song ID', async function () {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/songs/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(404);
    });

    it('should return 404 or 500 for an invalid song ID format', async function () {
      const res = await request(app)
        .get('/api/songs/not-a-valid-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.be.oneOf([404, 500]);
    });
  });
});
