/**
 * Directors API Tests
 * Tools: Mocha + Chai + Supertest
 *
 * Runs against the REAL database using the seeded admin account.
 * Write tests (POST/PUT/DELETE) create their own data and clean up after themselves.
 */
const request    = require('supertest');
const { expect } = require('chai');
const mongoose   = require('mongoose');
const app        = require('../server');
require('dotenv').config();

const ADMIN_EMAIL    = 'admin@musiclibrary.com';
const ADMIN_PASSWORD = 'Admin@1234';

let adminToken       = '';
let createdDirectorId = '';

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
describe('Directors API Tests', function () {
  this.timeout(10000);

  // ── GET /api/directors ────────────────────────────────────────────────────
  describe('GET /api/directors', function () {
    it('should return 401 when no token is provided', async function () {
      const res = await request(app).get('/api/directors');
      expect(res.status).to.equal(401);
    });

    it('should return 200 with an array of directors for authenticated users', async function () {
      const res = await request(app)
        .get('/api/directors')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });
  });

  // ── POST /api/directors ───────────────────────────────────────────────────
  describe('POST /api/directors (Admin)', function () {
    it('should return 401 when no token is provided', async function () {
      const res = await request(app)
        .post('/api/directors')
        .field('directorName', 'Unauthorized Director');
      expect(res.status).to.equal(401);
    });

    it('should return 400 when directorName is missing', async function () {
      const res = await request(app)
        .post('/api/directors')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('directorBio', 'Some bio');
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('message');
    });

    it('should create a new director and return 201', async function () {
      const res = await request(app)
        .post('/api/directors')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('directorName', '__Test Director (auto-cleanup)__');

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('_id');
      expect(res.body).to.have.property('directorName', '__Test Director (auto-cleanup)__');
      createdDirectorId = res.body._id;
    });
  });

  // ── GET /api/directors/:id ────────────────────────────────────────────────
  describe('GET /api/directors/:id', function () {
    it('should return 404 for a non-existent director ID', async function () {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/directors/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(404);
    });

    it('should return the created director by ID', async function () {
      if (!createdDirectorId) return this.skip();
      const res = await request(app)
        .get(`/api/directors/${createdDirectorId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('_id', createdDirectorId);
    });
  });

  // ── GET /api/directors/:id/songs ──────────────────────────────────────────
  describe('GET /api/directors/:id/songs', function () {
    it('should return an array of songs (possibly empty) for the created director', async function () {
      if (!createdDirectorId) return this.skip();
      const res = await request(app)
        .get(`/api/directors/${createdDirectorId}/songs`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });
  });

  // ── PUT /api/directors/:id ────────────────────────────────────────────────
  describe('PUT /api/directors/:id (Admin)', function () {
    it('should return 401 when no token is provided', async function () {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/directors/${fakeId}`)
        .send({ directorName: 'No Auth' });
      expect(res.status).to.equal(401);
    });

    it('should update the previously created director', async function () {
      if (!createdDirectorId) return this.skip();
      const res = await request(app)
        .put(`/api/directors/${createdDirectorId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ directorName: '__Test Director (updated)__', directorBio: 'Updated bio' });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('directorName', '__Test Director (updated)__');
    });
  });

  // ── DELETE /api/directors/:id ─────────────────────────────────────────────
  describe('DELETE /api/directors/:id (Admin)', function () {
    it('should return 401 when no token is provided', async function () {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/directors/${fakeId}`);
      expect(res.status).to.equal(401);
    });

    it('should return error for a non-existent director ID', async function () {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/directors/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).to.be.oneOf([404, 500]);
    });

    it('should delete the previously created director', async function () {
      if (!createdDirectorId) return this.skip();
      const res = await request(app)
        .delete(`/api/directors/${createdDirectorId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('message');
    });
  });
});
