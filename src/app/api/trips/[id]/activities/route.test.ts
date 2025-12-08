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
const sampleDbActivity = {
   id: '770e8400-e29b-41d4-a716-446655440001',
   trip_id: '550e8400-e29b-41d4-a716-446655440001',
   city_id: '660e8400-e29b-41d4-a716-446655440001',
   name: 'Eiffel Tower Visit',
   description: 'Visit the iconic Eiffel Tower',
   location: 'Champ de Mars, 5 Avenue Anatole France',
   scheduled_time: '2024-06-02T10:00:00',
   duration_minutes: 180,
   image_url: null,
   activity_url: null,
   in_travel_plan: true,
   order_index: 0,
   created_at: new Date('2024-01-01'),
   updated_at: new Date('2024-01-01'),
};

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

describe('GET /api/trips/[id]/activities', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('should return activities for a trip', async () => {
      mockSql.mockResolvedValueOnce([sampleDbActivity]);
      mockSql.mockResolvedValueOnce([sampleDbCity]);

      const request = new NextRequest('http://localhost/api/trips/123/activities');
      const response = await GET(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(1);
      expect(data[0].name).toBe('Eiffel Tower Visit');
   });

   it('should filter activities by cityId', async () => {
      mockSql.mockResolvedValueOnce([sampleDbActivity]);
      mockSql.mockResolvedValueOnce([sampleDbCity]);

      const request = new NextRequest(
         'http://localhost/api/trips/123/activities?cityId=660e8400-e29b-41d4-a716-446655440001'
      );
      const response = await GET(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
   });

   it('should return empty array when no activities exist', async () => {
      mockSql.mockResolvedValueOnce([]);
      mockSql.mockResolvedValueOnce([]);

      const request = new NextRequest('http://localhost/api/trips/123/activities');
      const response = await GET(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
   });

   it('should return 500 on database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/trips/123/activities');
      const response = await GET(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch activities');
   });
});

describe('POST /api/trips/[id]/activities', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('should create a new activity', async () => {
      mockSql.mockResolvedValueOnce([{ max_order: 0 }]);
      mockSql.mockResolvedValueOnce([sampleDbActivity]);
      mockSql.mockResolvedValueOnce([sampleDbCity]);

      const request = new NextRequest('http://localhost/api/trips/123/activities', {
         method: 'POST',
         body: JSON.stringify({
            name: 'Eiffel Tower Visit',
            description: 'Visit the iconic Eiffel Tower',
            cityId: sampleDbCity.id,
         }),
      });

      const response = await POST(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe('Eiffel Tower Visit');
   });

   it('should create activity without city', async () => {
      const activityWithoutCity = { ...sampleDbActivity, city_id: null };
      mockSql.mockResolvedValueOnce([{ max_order: 0 }]);
      mockSql.mockResolvedValueOnce([activityWithoutCity]);

      const request = new NextRequest('http://localhost/api/trips/123/activities', {
         method: 'POST',
         body: JSON.stringify({
            name: 'General Activity',
         }),
      });

      const response = await POST(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe('Eiffel Tower Visit');
   });

   it('should return 400 when name is missing', async () => {
      const request = new NextRequest('http://localhost/api/trips/123/activities', {
         method: 'POST',
         body: JSON.stringify({ description: 'No name provided' }),
      });

      const response = await POST(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Name is required');
   });

   it('should return 500 on database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/trips/123/activities', {
         method: 'POST',
         body: JSON.stringify({ name: 'Test Activity' }),
      });

      const response = await POST(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create activity');
   });
});
