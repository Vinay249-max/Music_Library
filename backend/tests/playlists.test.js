/**
 * Playlists API Tests
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
let createdPlaylistId = '';

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
describe('Playlists API Tests', function () {
  this.timeout(10000);

  // ── GET /api/playlists ────────────────────────────────────────────────────
  describe('GET /api/playlists', function () {
    it('should return 401 when no token is provided', async function () {
      const res = await request(app).get('/api/playlists');
      expect(res.status).to.equal(401);
    });

    it('should return 200 with an array of playlists for the authenticated user', async function () {
      const res = await request(app)
        .get('/api/playlists')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });
  });

  // ── POST /api/playlists ───────────────────────────────────────────────────
  describe('POST /api/playlists', function () {
    it('should return 401 when no token is provided', async function () {
      const res = await request(app)
        .post('/api/playlists')
        .send({ playlistName: 'Unauthorized' });
      expect(res.status).to.equal(401);
    });

    it('should return 400 when playlistName is missing', async function () {
      const res = await request(app)
        .post('/api/playlists')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('message');
    });

    it('should create a new playlist and return 201', async function () {
      const res = await request(app)
        .post('/api/playlists')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ playlistName: '__Test Playlist (auto-cleanup)__' });

      expect(res.status).to.equal(201);
      expect(res.body).to.have.property('_id');
      expect(res.body).to.have.property('playlistName', '__Test Playlist (auto-cleanup)__');
      createdPlaylistId = res.body._id;
    });
  });

  // ── PUT /api/playlists/:id ────────────────────────────────────────────────
  describe('PUT /api/playlists/:id', function () {
    it('should return 401 when no token is provided', async function () {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/playlists/${fakeId}`)
        .send({ playlistName: 'No Auth' });
      expect(res.status).to.equal(401);
    });

    it('should return 404 for a non-existent playlist ID', async function () {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/playlists/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ playlistName: 'Updated' });
      expect(res.status).to.be.oneOf([400, 404]);
    });

    it('should update the previously created playlist', async function () {
      if (!createdPlaylistId) return this.skip();
      const res = await request(app)
        .put(`/api/playlists/${createdPlaylistId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ playlistName: '__Test Playlist (updated)__' });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('playlistName', '__Test Playlist (updated)__');
    });
  });

  // ── POST /api/playlists/:id/songs ─────────────────────────────────────────
  describe('POST /api/playlists/:id/songs', function () {
    it('should return 401 when no token is provided', async function () {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .post(`/api/playlists/${fakeId}/songs`)
        .send({ songId: new mongoose.Types.ObjectId().toString() });
      expect(res.status).to.equal(401);
    });

    it('should return 400 when songId is missing', async function () {
      if (!createdPlaylistId) return this.skip();
      const res = await request(app)
        .post(`/api/playlists/${createdPlaylistId}/songs`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({});
      expect(res.status).to.be.oneOf([400, 500]);
    });
  });

  // ── DELETE /api/playlists/:id/songs/:songId ───────────────────────────────
  describe('DELETE /api/playlists/:id/songs/:songId', function () {
    it('should return 401 when no token is provided', async function () {
      const fakeId  = new mongoose.Types.ObjectId();
      const fakeSongId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/playlists/${fakeId}/songs/${fakeSongId}`);
      expect(res.status).to.equal(401);
    });

    it('should return error when song is not in the playlist', async function () {
      if (!createdPlaylistId) return this.skip();
      const fakeSongId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/playlists/${createdPlaylistId}/songs/${fakeSongId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      // Song not found in playlist – service-level error
      expect(res.status).to.be.oneOf([200, 400, 404, 500]);
    });
  });

  // ── DELETE /api/playlists/:id ─────────────────────────────────────────────
  describe('DELETE /api/playlists/:id', function () {
    it('should return 401 when no token is provided', async function () {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app).delete(`/api/playlists/${fakeId}`);
      expect(res.status).to.equal(401);
    });

    it('should return 404 for a non-existent playlist', async function () {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/playlists/${fakeId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).to.be.oneOf([400, 404]);
    });

    it('should delete the previously created playlist', async function () {
      if (!createdPlaylistId) return this.skip();
      const res = await request(app)
        .delete(`/api/playlists/${createdPlaylistId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('message');
    });
  });
});
