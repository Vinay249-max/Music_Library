/**
 * Auth API Tests
 * Tools: Mocha (test runner) + Chai (assertions) + Supertest (HTTP requests)
 *
 * NOTE: These tests run against the REAL database.
 * The login/profile tests use the admin account that already exists.
 * Update EXISTING_EMAIL and EXISTING_PASSWORD below to match your real admin credentials.
 */
const request  = require('supertest');
const { expect } = require('chai');
const mongoose = require('mongoose');
const app      = require('../server');
require('dotenv').config();

// ── UPDATE THESE to match a real user already in your database ───────────────
const EXISTING_EMAIL    = 'admin@musiclibrary.com';  // seeded in seedRoles.js
const EXISTING_PASSWORD = 'Admin@1234';              // seeded in seedRoles.js

let authToken = '';

// ── Connect to DB once before all tests ─────────────────────────────────────
before(async function () {
  this.timeout(15000);
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }
});

// ── Disconnect after all tests ───────────────────────────────────────────────
after(async function () {
  await mongoose.disconnect();
});

// ── Test Suite ────────────────────────────────────────────────────────────────
describe('Auth API Tests', function () {
  this.timeout(10000);

  // ── POST /api/auth/register ──────────────────────────────────────────────
  describe('POST /api/auth/register', function () {
    it('should return 400 if required fields are missing', async function () {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@test.com' }); // missing name + password

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('message');
    });

    it('should return 400 if email is already registered', async function () {
      // Try registering with an existing email — should fail
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Duplicate', email: EXISTING_EMAIL, password: 'something123' });

      expect(res.status).to.equal(400);
    });
  });

  // ── POST /api/auth/login ─────────────────────────────────────────────────
  describe('POST /api/auth/login', function () {
    it('should return 400 for invalid credentials', async function () {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@noexist.com', password: 'wrongpass' });

      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('message');
    });

    it('should return 200 with a token on successful login', async function () {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: EXISTING_EMAIL, password: EXISTING_PASSWORD });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('token');
      expect(res.body).to.have.property('user');
      expect(res.body.user).to.have.property('role');

      // Save token for the profile test below
      authToken = res.body.token;
    });
  });

  // ── GET /api/auth/profile ────────────────────────────────────────────────
  describe('GET /api/auth/profile', function () {
    it('should return 401 if no token is provided', async function () {
      const res = await request(app).get('/api/auth/profile');
      expect(res.status).to.equal(401);
    });

    it('should return user profile when a valid token is provided', async function () {
      if (!authToken) this.skip(); // skip if login failed above

      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('email', EXISTING_EMAIL);
    });
  });
});
