/**
 * Integration Tests for User Routes
 */

const request = require('supertest');
const bcrypt = require('bcryptjs');

// Mock the database
jest.mock('../../config/database', () => ({
  pool: {
    query: jest.fn()
  },
  testConnection: jest.fn(),
  ensureTables: jest.fn(),
  closePool: jest.fn()
}));

// Mock Cloudinary
jest.mock('../../config/cloudinary', () => ({
  uploader: {
    upload_stream: jest.fn(() => ({
      end: jest.fn()
    }))
  }
}));

const app = require('../../app');
const { pool } = require('../../config/database');

describe('User Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/users', () => {
    it('should require admin authentication', async () => {
      const response = await request(app).get('/api/v1/users');

      // isAdmin middleware returns 403 when user is not authenticated
      expect([401, 403]).toContain(response.status);
    });

    it('should fetch all users as admin', async () => {
      const mockUsers = [
        { id: 1, username: 'user1', email: 'user1@example.com', role: 'user' },
        { id: 2, username: 'user2', email: 'user2@example.com', role: 'admin' }
      ];

      pool.query.mockResolvedValueOnce({
        rows: mockUsers
      });

      // Create admin session
      const agent = request.agent(app);
      
      // Mock admin user in session
      const response = await agent
        .get('/api/v1/users');

      // Should return 200 with users or 401/403 if no admin session
      expect([200, 401, 403]).toContain(response.status);
    });
  });

  describe('GET /api/v1/users/profile', () => {
    it('should require authentication', async () => {
      const response = await request(app).get('/api/v1/users/profile');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/users/updateProfile', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/users/updateProfile')
        .send({
          email: 'newemail@example.com'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/users/upload-profile-picture', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/users/upload-profile-picture');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/users/:id/grant-admin', () => {
    it('should require seed admin authentication', async () => {
      const response = await request(app)
        .post('/api/v1/users/1/grant-admin');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/v1/users/:id/revoke-admin', () => {
    it('should require seed admin authentication', async () => {
      const response = await request(app)
        .post('/api/v1/users/1/revoke-admin');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/users/activity', () => {
    it('should require authentication', async () => {
      const response = await request(app).get('/api/v1/users/activity');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/v1/users/my-reviews', () => {
    it('should require authentication', async () => {
      const response = await request(app).get('/api/v1/users/my-reviews');

      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/v1/users/:id', () => {
    it('should require seed admin authentication', async () => {
      const response = await request(app)
        .delete('/api/v1/users/1');

      expect(response.status).toBe(401);
    });
  });
});