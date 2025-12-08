import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const { mockSql } = vi.hoisted(() => ({
   mockSql: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
   sql: mockSql,
   asType: <T>(result: Record<string, unknown>[]): T[] => result as T[],
}));

import { GET, PUT, DELETE } from './route';

// Sample data
const sampleDbTrip = {
   id: '550e8400-e29b-41d4-a716-446655440001',
   user_id: '00000000-0000-0000-0000-000000000001',
   name: 'European Adventure',
   arrival_date: '2024-06-01',
   departure_date: '2024-06-15',
   created_at: new Date('2024-01-01'),
   updated_at: new Date('2024-01-01'),
};

const createRouteParams = (id: string) => ({
   params: Promise.resolve({ id }),
});

describe('GET /api/trips/[id]', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('should return a trip with related data', async () => {
      // Mock trip query
      mockSql.mockResolvedValueOnce([sampleDbTrip]);
      // Mock cities, activities, accommodations, flights, trains, notes
      mockSql.mockResolvedValueOnce([]);
      mockSql.mockResolvedValueOnce([]);
      mockSql.mockResolvedValueOnce([]);
      mockSql.mockResolvedValueOnce([]);
      mockSql.mockResolvedValueOnce([]);
      mockSql.mockResolvedValueOnce([]);

      const request = new NextRequest('http://localhost/api/trips/123');
      const response = await GET(request, createRouteParams(sampleDbTrip.id));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(sampleDbTrip.id);
      expect(data.name).toBe(sampleDbTrip.name);
   });

   it('should return 404 when trip not found', async () => {
      mockSql.mockResolvedValueOnce([]);

      const request = new NextRequest('http://localhost/api/trips/nonexistent');
      const response = await GET(request, createRouteParams('nonexistent'));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Trip not found');
   });

   it('should return 500 on database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/trips/123');
      const response = await GET(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch trip');
   });
});

describe('PUT /api/trips/[id]', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('should update a trip', async () => {
      const updatedTrip = { ...sampleDbTrip, name: 'Updated Trip Name' };
      // Mock update query
      mockSql.mockResolvedValueOnce([updatedTrip]);
      // Mock related data queries
      mockSql.mockResolvedValueOnce([]);
      mockSql.mockResolvedValueOnce([]);
      mockSql.mockResolvedValueOnce([]);
      mockSql.mockResolvedValueOnce([]);
      mockSql.mockResolvedValueOnce([]);
      mockSql.mockResolvedValueOnce([]);

      const request = new NextRequest('http://localhost/api/trips/123', {
         method: 'PUT',
         body: JSON.stringify({ name: 'Updated Trip Name' }),
      });

      const response = await PUT(request, createRouteParams(sampleDbTrip.id));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe('Updated Trip Name');
   });

   it('should return 404 when trip not found', async () => {
      mockSql.mockResolvedValueOnce([]);

      const request = new NextRequest('http://localhost/api/trips/nonexistent', {
         method: 'PUT',
         body: JSON.stringify({ name: 'Updated Trip' }),
      });

      const response = await PUT(request, createRouteParams('nonexistent'));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Trip not found');
   });

   it('should return 500 on database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/trips/123', {
         method: 'PUT',
         body: JSON.stringify({ name: 'Test' }),
      });

      const response = await PUT(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to update trip');
   });
});

describe('DELETE /api/trips/[id]', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('should delete a trip', async () => {
      mockSql.mockResolvedValueOnce([sampleDbTrip]);

      const request = new NextRequest('http://localhost/api/trips/123', {
         method: 'DELETE',
      });

      const response = await DELETE(request, createRouteParams(sampleDbTrip.id));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.deletedId).toBe(sampleDbTrip.id);
   });

   it('should return 404 when trip not found', async () => {
      mockSql.mockResolvedValueOnce([]);

      const request = new NextRequest('http://localhost/api/trips/nonexistent', {
         method: 'DELETE',
      });

      const response = await DELETE(request, createRouteParams('nonexistent'));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Trip not found');
   });

   it('should return 500 on database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/trips/123', {
         method: 'DELETE',
      });

      const response = await DELETE(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to delete trip');
   });
});
