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

const createRouteParams = (id: string, activityId: string) => ({
   params: Promise.resolve({ id, activityId }),
});

describe('GET /api/trips/[id]/activities/[activityId]', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('should return an activity with city', async () => {
      mockSql.mockResolvedValueOnce([sampleDbActivity]);
      mockSql.mockResolvedValueOnce([sampleDbCity]);

      const request = new NextRequest('http://localhost/api/trips/123/activities/456');
      const response = await GET(
         request,
         createRouteParams(sampleDbActivity.trip_id, sampleDbActivity.id)
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe('Eiffel Tower Visit');
   });

   it('should return 404 when activity not found', async () => {
      mockSql.mockResolvedValueOnce([]);

      const request = new NextRequest('http://localhost/api/trips/123/activities/nonexistent');
      const response = await GET(request, createRouteParams('123', 'nonexistent'));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Activity not found');
   });

   it('should return 500 on database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/trips/123/activities/456');
      const response = await GET(request, createRouteParams('123', '456'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch activity');
   });
});

describe('PUT /api/trips/[id]/activities/[activityId]', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('should update an activity', async () => {
      const updatedActivity = { ...sampleDbActivity, name: 'Louvre Museum Visit' };
      mockSql.mockResolvedValueOnce([updatedActivity]);
      mockSql.mockResolvedValueOnce([sampleDbCity]);

      const request = new NextRequest('http://localhost/api/trips/123/activities/456', {
         method: 'PUT',
         body: JSON.stringify({ name: 'Louvre Museum Visit' }),
      });

      const response = await PUT(
         request,
         createRouteParams(sampleDbActivity.trip_id, sampleDbActivity.id)
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe('Louvre Museum Visit');
   });

   it('should return 404 when activity not found', async () => {
      mockSql.mockResolvedValueOnce([]);

      const request = new NextRequest('http://localhost/api/trips/123/activities/nonexistent', {
         method: 'PUT',
         body: JSON.stringify({ name: 'Updated' }),
      });

      const response = await PUT(request, createRouteParams('123', 'nonexistent'));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Activity not found');
   });

   it('should return 500 on database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/trips/123/activities/456', {
         method: 'PUT',
         body: JSON.stringify({ name: 'Test' }),
      });

      const response = await PUT(request, createRouteParams('123', '456'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to update activity');
   });
});

describe('DELETE /api/trips/[id]/activities/[activityId]', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('should delete an activity', async () => {
      mockSql.mockResolvedValueOnce([sampleDbActivity]);

      const request = new NextRequest('http://localhost/api/trips/123/activities/456', {
         method: 'DELETE',
      });

      const response = await DELETE(
         request,
         createRouteParams(sampleDbActivity.trip_id, sampleDbActivity.id)
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.deletedId).toBe(sampleDbActivity.id);
   });

   it('should return 404 when activity not found', async () => {
      mockSql.mockResolvedValueOnce([]);

      const request = new NextRequest('http://localhost/api/trips/123/activities/nonexistent', {
         method: 'DELETE',
      });

      const response = await DELETE(request, createRouteParams('123', 'nonexistent'));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Activity not found');
   });

   it('should return 500 on database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/trips/123/activities/456', {
         method: 'DELETE',
      });

      const response = await DELETE(request, createRouteParams('123', '456'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to delete activity');
   });
});
