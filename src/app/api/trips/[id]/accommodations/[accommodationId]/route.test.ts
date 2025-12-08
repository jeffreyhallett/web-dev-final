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
const sampleDbAccommodation = {
   id: '880e8400-e29b-41d4-a716-446655440001',
   trip_id: '550e8400-e29b-41d4-a716-446655440001',
   city_id: '660e8400-e29b-41d4-a716-446655440001',
   name: 'Hotel Le Marais',
   address: '123 Rue du Temple, Paris',
   check_in: '2024-06-01',
   check_out: '2024-06-05',
   confirmation_number: 'HLM-67890',
   booking_url: 'https://booking.com/hotel',
   notes: 'Late check-in requested',
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

const createRouteParams = (id: string, accommodationId: string) => ({
   params: Promise.resolve({ id, accommodationId }),
});

describe('GET /api/trips/[id]/accommodations/[accommodationId]', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('should return an accommodation with city', async () => {
      mockSql.mockResolvedValueOnce([sampleDbAccommodation]);
      mockSql.mockResolvedValueOnce([sampleDbCity]);

      const request = new NextRequest('http://localhost/api/trips/123/accommodations/456');
      const response = await GET(
         request,
         createRouteParams(sampleDbAccommodation.trip_id, sampleDbAccommodation.id)
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe('Hotel Le Marais');
   });

   it('should return 404 when accommodation not found', async () => {
      mockSql.mockResolvedValueOnce([]);

      const request = new NextRequest(
         'http://localhost/api/trips/123/accommodations/nonexistent'
      );
      const response = await GET(request, createRouteParams('123', 'nonexistent'));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Accommodation not found');
   });

   it('should return 500 on database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/trips/123/accommodations/456');
      const response = await GET(request, createRouteParams('123', '456'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch accommodation');
   });
});

describe('PUT /api/trips/[id]/accommodations/[accommodationId]', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('should update an accommodation', async () => {
      const updatedAccommodation = { ...sampleDbAccommodation, name: 'Grand Hotel Paris' };
      mockSql.mockResolvedValueOnce([updatedAccommodation]);
      mockSql.mockResolvedValueOnce([sampleDbCity]);

      const request = new NextRequest('http://localhost/api/trips/123/accommodations/456', {
         method: 'PUT',
         body: JSON.stringify({ name: 'Grand Hotel Paris' }),
      });

      const response = await PUT(
         request,
         createRouteParams(sampleDbAccommodation.trip_id, sampleDbAccommodation.id)
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe('Grand Hotel Paris');
   });

   it('should return 404 when accommodation not found', async () => {
      mockSql.mockResolvedValueOnce([]);

      const request = new NextRequest(
         'http://localhost/api/trips/123/accommodations/nonexistent',
         {
            method: 'PUT',
            body: JSON.stringify({ name: 'Updated' }),
         }
      );

      const response = await PUT(request, createRouteParams('123', 'nonexistent'));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Accommodation not found');
   });

   it('should return 500 on database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/trips/123/accommodations/456', {
         method: 'PUT',
         body: JSON.stringify({ name: 'Test' }),
      });

      const response = await PUT(request, createRouteParams('123', '456'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to update accommodation');
   });
});

describe('DELETE /api/trips/[id]/accommodations/[accommodationId]', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('should delete an accommodation', async () => {
      mockSql.mockResolvedValueOnce([sampleDbAccommodation]);

      const request = new NextRequest('http://localhost/api/trips/123/accommodations/456', {
         method: 'DELETE',
      });

      const response = await DELETE(
         request,
         createRouteParams(sampleDbAccommodation.trip_id, sampleDbAccommodation.id)
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.deletedId).toBe(sampleDbAccommodation.id);
   });

   it('should return 404 when accommodation not found', async () => {
      mockSql.mockResolvedValueOnce([]);

      const request = new NextRequest(
         'http://localhost/api/trips/123/accommodations/nonexistent',
         {
            method: 'DELETE',
         }
      );

      const response = await DELETE(request, createRouteParams('123', 'nonexistent'));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Accommodation not found');
   });

   it('should return 500 on database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/trips/123/accommodations/456', {
         method: 'DELETE',
      });

      const response = await DELETE(request, createRouteParams('123', '456'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to delete accommodation');
   });
});
