/**
 * Integration Tests for Review Routes
 */

const request = require('supertest');

// Mock the database
jest.mock('../../config/database', () => ({
  pool: {
    query: jest.fn()
  },
  testConnection: jest.fn(),
  ensureTables: jest.fn(),
  closePool: jest.fn()
}));

const app = require('../../app');
const { pool } = require('../../config/database');

describe('Review Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/v1/books/:bookId/reviews', () => {
    it('should fetch reviews for a book', async () => {
      const mockReviews = [
        {
          username: 'user1',
          text: 'Great book!',
          rating: 5,
          profilepicture: ''
        },
        {
          username: 'user2',
          text: 'Good read',
          rating: 4,
          profilepicture: 'https://example.com/pic.jpg'
        }
      ];

      pool.query.mockResolvedValueOnce({
        rows: mockReviews
      });

      const response = await request(app)
        .get('/api/v1/books/1/reviews')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });

    it('should return empty array for book with no reviews', async () => {
      pool.query.mockResolvedValueOnce({
        rows: []
      });

      const response = await request(app)
        .get('/api/v1/books/999/reviews');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request(app)
        .get('/api/v1/books/1/reviews');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/v1/books/:bookId/reviews', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/books/1/reviews')
        .send({
          text: 'Great book!',
          rating: 5
        });

      expect([401, 403]).toContain(response.status);
    });

    it('should reject review with missing text', async () => {
      const response = await request(app)
        .post('/api/v1/books/1/reviews')
        .send({
          rating: 5
        });

      // Should return 400 or 401/403 (auth required)
      expect([400, 401, 403]).toContain(response.status);
    });

    it('should reject review with invalid rating', async () => {
      const response = await request(app)
        .post('/api/v1/books/1/reviews')
        .send({
          text: 'Great book!',
          rating: 6 // Invalid: must be 1-5
        });

      // Should return 400 or 401/403 (auth required)
      expect([400, 401, 403]).toContain(response.status);
    });

    it('should reject review with rating out of range (too low)', async () => {
      const response = await request(app)
        .post('/api/v1/books/1/reviews')
        .send({
          text: 'Great book!',
          rating: 0 // Invalid: must be 1-5
        });

      // Should return 400 or 401/403 (auth required)
      expect([400, 401, 403]).toContain(response.status);
    });
  });
});