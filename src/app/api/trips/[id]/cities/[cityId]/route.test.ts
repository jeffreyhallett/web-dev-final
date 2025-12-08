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

const createRouteParams = (id: string, cityId: string) => ({
   params: Promise.resolve({ id, cityId }),
});

describe('GET /api/trips/[id]/cities/[cityId]', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('should return a city', async () => {
      mockSql.mockResolvedValueOnce([sampleDbCity]);

      const request = new NextRequest('http://localhost/api/trips/123/cities/456');
      const response = await GET(
         request,
         createRouteParams(sampleDbCity.trip_id, sampleDbCity.id)
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe('Paris');
      expect(data.country).toBe('France');
   });

   it('should return 404 when city not found', async () => {
      mockSql.mockResolvedValueOnce([]);

      const request = new NextRequest('http://localhost/api/trips/123/cities/nonexistent');
      const response = await GET(request, createRouteParams('123', 'nonexistent'));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('City not found');
   });

   it('should return 500 on database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/trips/123/cities/456');
      const response = await GET(request, createRouteParams('123', '456'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch city');
   });
});

describe('PUT /api/trips/[id]/cities/[cityId]', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('should update a city', async () => {
      const updatedCity = { ...sampleDbCity, name: 'Lyon' };
      mockSql.mockResolvedValueOnce([updatedCity]);

      const request = new NextRequest('http://localhost/api/trips/123/cities/456', {
         method: 'PUT',
         body: JSON.stringify({ name: 'Lyon' }),
      });

      const response = await PUT(
         request,
         createRouteParams(sampleDbCity.trip_id, sampleDbCity.id)
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe('Lyon');
   });

   it('should return 404 when city not found', async () => {
      mockSql.mockResolvedValueOnce([]);

      const request = new NextRequest('http://localhost/api/trips/123/cities/nonexistent', {
         method: 'PUT',
         body: JSON.stringify({ name: 'Lyon' }),
      });

      const response = await PUT(request, createRouteParams('123', 'nonexistent'));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('City not found');
   });

   it('should return 500 on database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/trips/123/cities/456', {
         method: 'PUT',
         body: JSON.stringify({ name: 'Lyon' }),
      });

      const response = await PUT(request, createRouteParams('123', '456'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to update city');
   });
});

describe('DELETE /api/trips/[id]/cities/[cityId]', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('should delete a city', async () => {
      mockSql.mockResolvedValueOnce([sampleDbCity]);

      const request = new NextRequest('http://localhost/api/trips/123/cities/456', {
         method: 'DELETE',
      });

      const response = await DELETE(
         request,
         createRouteParams(sampleDbCity.trip_id, sampleDbCity.id)
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.deletedId).toBe(sampleDbCity.id);
   });

   it('should return 404 when city not found', async () => {
      mockSql.mockResolvedValueOnce([]);

      const request = new NextRequest('http://localhost/api/trips/123/cities/nonexistent', {
         method: 'DELETE',
      });

      const response = await DELETE(request, createRouteParams('123', 'nonexistent'));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('City not found');
   });

   it('should return 500 on database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/trips/123/cities/456', {
         method: 'DELETE',
      });

      const response = await DELETE(request, createRouteParams('123', '456'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to delete city');
   });
});
