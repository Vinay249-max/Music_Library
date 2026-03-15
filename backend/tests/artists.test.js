/**
 * Artists API Tests
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

let adminToken     = '';
let createdArtistId = '';

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
describe('Artists API Tests', function () {
  this.timeout(10000);

  // ── GET /api/artists ──────────────────────────────────────────────────────
  describe('GET /api/artists', function () {
    it('should return 401 when no token is provided', async function () {
      const res = await request(app).get('/api/artists');
      expect(res.status).to.equal(401);
    });

    it('should return 200 with an array of artists for authenticated users', async function () {
      const res = await request(app)
        .get('/api/artists')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });
  });

  // ── POST /api/artists ─────────────────────────────────────────────────────
  describe('POST /api/artists (Admin)', function () {
    it('should return 401 when no token is provided', async function () {
      const res = await request(app)
        .post('/api/artists')
        .field('artistName', 'Unauthorized Artist');
      expect(res.status).to.equal(401);
    });

    it('should return 400 when artistName is missing', async function () {
      const res = await request(app)
        .post('/api/artists')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('artistBio', 'Some bio');
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('message');
    });

    it('should create a new artist and return 201', async function () {
      const res = await request(app)
        .post('/api/artists')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('artistName', '__Test Artist (auto-cleanup)__');

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('_id');
      expect(res.body).to.have.property('artistName', '__Test Artist (auto-cleanup)__');
      createdArtistId = res.body._id;
    });
  });

  // ── GET /api/artists/:id ──────────────────────────────────────────────────
  describe('GET /api/artists/:id', function () {
    it('should return 404 for a non-existent artist ID', async function () {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/artists/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(404);
    });

    it('should return the created artist by ID', async function () {
      if (!createdArtistId) return this.skip();
      const res = await request(app)
        .get(`/api/artists/${createdArtistId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('_id', createdArtistId);
    });
  });

  // ── GET /api/artists/:id/songs ────────────────────────────────────────────
  describe('GET /api/artists/:id/songs', function () {
    it('should return an array of songs (possibly empty) for the created artist', async function () {
      if (!createdArtistId) return this.skip();
      const res = await request(app)
        .get(`/api/artists/${createdArtistId}/songs`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });
  });

  // ── PUT /api/artists/:id ──────────────────────────────────────────────────
  describe('PUT /api/artists/:id (Admin)', function () {
    it('should return 401 when no token is provided', async function () {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/artists/${fakeId}`)
        .send({ artistName: 'No Auth' });
      expect(res.status).to.equal(401);
    });

    it('should update the previously created artist', async function () {
      if (!createdArtistId) return this.skip();
      const res = await request(app)
        .put(`/api/artists/${createdArtistId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ artistName: '__Test Artist (updated)__', artistBio: 'Updated bio' });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('artistName', '__Test Artist (updated)__');
    });
  });

  // ── DELETE /api/artists/:id ───────────────────────────────────────────────
  describe('DELETE /api/artists/:id (Admin)', function () {
    it('should return 401 when no token is provided', async function () {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/artists/${fakeId}`);
      expect(res.status).to.equal(401);
    });

    it('should return 500 for a non-existent artist ID', async function () {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/artists/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).to.be.oneOf([404, 500]);
    });

    it('should delete the previously created artist', async function () {
      if (!createdArtistId) return this.skip();
      const res = await request(app)
        .delete(`/api/artists/${createdArtistId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('message');
    });
  });
});
