/**
 * Notifications API Tests
 * Tools: Mocha + Chai + Supertest
 *
 * Runs against the REAL database using the seeded admin account.
 * These tests are read-only (no data is created or deleted).
 */
const request    = require('supertest');
const { expect } = require('chai');
const mongoose   = require('mongoose');
const app        = require('../server');
require('dotenv').config();

const ADMIN_EMAIL    = 'admin@musiclibrary.com';
const ADMIN_PASSWORD = 'Admin@1234';

let adminToken = '';

// ── DB setup ─────────────────────────────────────────────────────────────────
before(async function () {
  this.timeout(15000);
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI);
  }
});

before(async function () {
  this.timeout(10000);
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });
  adminToken = res.body.token || '';
});

after(async function () {
  await mongoose.disconnect();
});

// ── Test Suite ────────────────────────────────────────────────────────────────
describe('Notifications API Tests', function () {
  this.timeout(10000);

  // ── GET /api/notifications ────────────────────────────────────────────────
  describe('GET /api/notifications', function () {
    it('should return 401 when no token is provided', async function () {
      const res = await request(app).get('/api/notifications');
      expect(res.status).to.equal(401);
    });

    it('should return 200 with an array of notifications for authenticated users', async function () {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });

    it('each notification should have an _id and message field', async function () {
      const res = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      if (res.body.length > 0) {
        expect(res.body[0]).to.have.property('_id');
        expect(res.body[0]).to.have.property('message');
      }
    });
  });

  // ── PATCH /api/notifications/:id/read ────────────────────────────────────
  describe('PATCH /api/notifications/:id/read', function () {
    it('should return 401 when no token is provided', async function () {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).patch(`/api/notifications/${fakeId}/read`);
      expect(res.status).to.equal(401);
    });

    it('should return 500 for a non-existent notification ID', async function () {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .patch(`/api/notifications/${fakeId}/read`)
        .set('Authorization', `Bearer ${adminToken}`);
      // Service will throw if notification not found – 500 is expected
      expect(res.status).to.be.oneOf([404, 500]);
    });

    it('should mark an existing notification as read (if any exist)', async function () {
      // First, get all notifications and pick the first one
      const listRes = await request(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${adminToken}`);

      if (listRes.body.length === 0) return this.skip(); // no notifications to mark

      const notifId = listRes.body[0]._id;
      const res = await request(app)
        .patch(`/api/notifications/${notifId}/read`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('_id', notifId);
    });
  });
});
