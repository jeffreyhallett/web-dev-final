import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock the database module - use vi.hoisted so it's available when vi.mock is hoisted
const { mockSql } = vi.hoisted(() => ({
   mockSql: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
   sql: mockSql,
   asType: <T>(result: Record<string, unknown>[]): T[] => result as T[],
}));

import { GET, POST } from './route';

// Sample data
const sampleDbUser = {
   id: '00000000-0000-0000-0000-000000000001',
   email: 'default@example.com',
   name: 'default',
   created_at: new Date('2024-01-01'),
   updated_at: new Date('2024-01-01'),
};

const sampleDbTrip = {
   id: '550e8400-e29b-41d4-a716-446655440001',
   user_id: '00000000-0000-0000-0000-000000000001',
   name: 'European Adventure',
   arrival_date: '2024-06-01',
   departure_date: '2024-06-15',
   created_at: new Date('2024-01-01'),
   updated_at: new Date('2024-01-01'),
};

describe('GET /api/trips', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('should return empty array when no trips exist', async () => {
      // Mock user lookup
      mockSql.mockResolvedValueOnce([sampleDbUser]);
      // Mock trips query - returns empty
      mockSql.mockResolvedValueOnce([]);

      const request = new NextRequest('http://localhost/api/trips');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
   });

   it('should return trips with related data', async () => {
      // Mock user lookup
      mockSql.mockResolvedValueOnce([sampleDbUser]);
      // Mock trips query
      mockSql.mockResolvedValueOnce([sampleDbTrip]);
      // Mock cities, activities, accommodations, flights, trains, notes
      mockSql.mockResolvedValueOnce([]);
      mockSql.mockResolvedValueOnce([]);
      mockSql.mockResolvedValueOnce([]);
      mockSql.mockResolvedValueOnce([]);
      mockSql.mockResolvedValueOnce([]);
      mockSql.mockResolvedValueOnce([]);

      const request = new NextRequest('http://localhost/api/trips');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(1);
      expect(data[0].id).toBe(sampleDbTrip.id);
      expect(data[0].name).toBe(sampleDbTrip.name);
   });

   it('should use custom user ID from header', async () => {
      // Mock user lookup
      mockSql.mockResolvedValueOnce([sampleDbUser]);
      // Mock trips query - returns empty
      mockSql.mockResolvedValueOnce([]);

      const request = new NextRequest('http://localhost/api/trips', {
         headers: { 'x-user-id': 'custom-user-id-123' },
      });
      await GET(request);

      // Check that the SQL was called
      expect(mockSql).toHaveBeenCalled();
   });

   it('should return 500 on database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/trips');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch trips');
   });
});

describe('POST /api/trips', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('should create a new trip', async () => {
      // Mock user lookup
      mockSql.mockResolvedValueOnce([sampleDbUser]);
      // Mock trip creation
      mockSql.mockResolvedValueOnce([sampleDbTrip]);

      const request = new NextRequest('http://localhost/api/trips', {
         method: 'POST',
         body: JSON.stringify({
            name: 'European Adventure',
            arrivalDate: '2024-06-01',
            departureDate: '2024-06-15',
         }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBe(sampleDbTrip.id);
      expect(data.name).toBe(sampleDbTrip.name);
      expect(data.cities).toEqual([]);
      expect(data.activities).toEqual([]);
   });

   it('should create trip with minimal data', async () => {
      const minimalTrip = {
         ...sampleDbTrip,
         name: null,
         arrival_date: null,
         departure_date: null,
      };
      // Mock user lookup
      mockSql.mockResolvedValueOnce([sampleDbUser]);
      // Mock trip creation
      mockSql.mockResolvedValueOnce([minimalTrip]);

      const request = new NextRequest('http://localhost/api/trips', {
         method: 'POST',
         body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBeDefined();
   });

   it('should return 500 on database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/trips', {
         method: 'POST',
         body: JSON.stringify({ name: 'Test Trip' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create trip');
   });
});
