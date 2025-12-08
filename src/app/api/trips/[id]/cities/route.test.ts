import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const { mockSql } = vi.hoisted(() => ({
   mockSql: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
   sql: mockSql,
   asType: <T>(result: Record<string, unknown>[]): T[] => result as T[],
}));

import { GET, POST } from './route';

// Sample data
const sampleDbCity = {
   id: '660e8400-e29b-41d4-a716-446655440001',
   trip_id: '550e8400-e29b-41d4-a716-446655440001',
   name: 'Paris',
   country: 'France',
   latitude: 48.8566,
   longitude: 2.3522,
   order_index: 0,
   created_at: new Date('2024-01-01'),
   updated_at: new Date('2024-01-01'),
};

const createRouteParams = (id: string) => ({
   params: Promise.resolve({ id }),
});

describe('GET /api/trips/[id]/cities', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('should return cities for a trip', async () => {
      mockSql.mockResolvedValueOnce([sampleDbCity]);

      const request = new NextRequest('http://localhost/api/trips/123/cities');
      const response = await GET(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(1);
      expect(data[0].name).toBe('Paris');
      expect(data[0].country).toBe('France');
   });

   it('should return empty array when no cities exist', async () => {
      mockSql.mockResolvedValueOnce([]);

      const request = new NextRequest('http://localhost/api/trips/123/cities');
      const response = await GET(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
   });

   it('should return 500 on database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/trips/123/cities');
      const response = await GET(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch cities');
   });
});

describe('POST /api/trips/[id]/cities', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('should create a new city', async () => {
      // Mock max order query
      mockSql.mockResolvedValueOnce([{ max_order: 0 }]);
      // Mock insert query
      mockSql.mockResolvedValueOnce([sampleDbCity]);

      const request = new NextRequest('http://localhost/api/trips/123/cities', {
         method: 'POST',
         body: JSON.stringify({
            name: 'Paris',
            country: 'France',
            latitude: 48.8566,
            longitude: 2.3522,
         }),
      });

      const response = await POST(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe('Paris');
      expect(data.country).toBe('France');
   });

   it('should create city with provided orderIndex', async () => {
      mockSql.mockResolvedValueOnce([sampleDbCity]);

      const request = new NextRequest('http://localhost/api/trips/123/cities', {
         method: 'POST',
         body: JSON.stringify({
            name: 'Paris',
            country: 'France',
            latitude: 48.8566,
            longitude: 2.3522,
            orderIndex: 5,
         }),
      });

      const response = await POST(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(201);
   });

   it('should return 400 when required fields missing', async () => {
      const request = new NextRequest('http://localhost/api/trips/123/cities', {
         method: 'POST',
         body: JSON.stringify({ name: 'Paris' }), // Missing country, lat, lng
      });

      const response = await POST(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Name, country, latitude, and longitude are required');
   });

   it('should return 500 on database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/trips/123/cities', {
         method: 'POST',
         body: JSON.stringify({
            name: 'Paris',
            country: 'France',
            latitude: 48.8566,
            longitude: 2.3522,
         }),
      });

      const response = await POST(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create city');
   });
});
