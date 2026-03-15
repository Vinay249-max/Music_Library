/**
 * Albums API Tests
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

let adminToken  = '';
let createdAlbumId = '';

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
describe('Albums API Tests', function () {
  this.timeout(10000);

  // ── GET /api/albums ───────────────────────────────────────────────────────
  describe('GET /api/albums', function () {
    it('should return 401 when no token is provided', async function () {
      const res = await request(app).get('/api/albums');
      expect(res.status).to.equal(401);
    });

    it('should return 200 with an array of albums for authenticated users', async function () {
      const res = await request(app)
        .get('/api/albums')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });
  });

  // ── POST /api/albums ──────────────────────────────────────────────────────
  describe('POST /api/albums (Admin)', function () {
    it('should return 401 when no token is provided', async function () {
      const res = await request(app)
        .post('/api/albums')
        .field('albumName', 'Unauthorized Album');
      expect(res.status).to.equal(401);
    });

    it('should return 400 when albumName is missing', async function () {
      const res = await request(app)
        .post('/api/albums')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('message');
    });

    it('should create a new album and return 201', async function () {
      const res = await request(app)
        .post('/api/albums')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('albumName', '__Test Album (auto-cleanup)__');

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('_id');
      expect(res.body).to.have.property('albumName', '__Test Album (auto-cleanup)__');
      createdAlbumId = res.body._id;
    });
  });

  // ── PUT /api/albums/:id ───────────────────────────────────────────────────
  describe('PUT /api/albums/:id (Admin)', function () {
    it('should return 401 when no token is provided', async function () {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/albums/${fakeId}`)
        .send({ albumName: 'No Auth' });
      expect(res.status).to.equal(401);
    });

    it('should return 400 for a non-existent album ID', async function () {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/albums/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ albumName: 'Updated Name' });
      expect(res.status).to.be.oneOf([400, 404, 500]);
    });

    it('should update the previously created album', async function () {
      if (!createdAlbumId) return this.skip();
      const res = await request(app)
        .put(`/api/albums/${createdAlbumId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .field('albumName', '__Test Album (updated)__');

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('albumName', '__Test Album (updated)__');
    });
  });

  // ── DELETE /api/albums/:id ────────────────────────────────────────────────
  describe('DELETE /api/albums/:id (Admin)', function () {
    it('should return 401 when no token is provided', async function () {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/albums/${fakeId}`);
      expect(res.status).to.equal(401);
    });

    it('should return 500 for a non-existent album ID', async function () {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/albums/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).to.be.oneOf([404, 500]);
    });

    it('should delete the previously created album', async function () {
      if (!createdAlbumId) return this.skip();
      const res = await request(app)
        .delete(`/api/albums/${createdAlbumId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('message');
    });
  });
});
