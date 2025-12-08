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
const sampleDbFlight = {
   id: '990e8400-e29b-41d4-a716-446655440001',
   trip_id: '550e8400-e29b-41d4-a716-446655440001',
   flight_number: 'AF123',
   airline: 'Air France',
   departure_airport: 'JFK',
   arrival_airport: 'CDG',
   departure_time: '2024-06-01T20:00:00Z',
   arrival_time: '2024-06-02T09:00:00Z',
   confirmation_number: 'AF-ABCD12',
   booking_url: 'https://airfrance.com/booking',
   notes: 'Window seat requested',
   created_at: new Date('2024-01-01'),
   updated_at: new Date('2024-01-01'),
};

const createRouteParams = (id: string, flightId: string) => ({
   params: Promise.resolve({ id, flightId }),
});

describe('GET /api/trips/[id]/flights/[flightId]', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('should return a flight', async () => {
      mockSql.mockResolvedValueOnce([sampleDbFlight]);

      const request = new NextRequest('http://localhost/api/trips/123/flights/456');
      const response = await GET(
         request,
         createRouteParams(sampleDbFlight.trip_id, sampleDbFlight.id)
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.number).toBe('AF123');
      expect(data.airline).toBe('Air France');
   });

   it('should return 404 when flight not found', async () => {
      mockSql.mockResolvedValueOnce([]);

      const request = new NextRequest('http://localhost/api/trips/123/flights/nonexistent');
      const response = await GET(request, createRouteParams('123', 'nonexistent'));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Flight not found');
   });

   it('should return 500 on database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/trips/123/flights/456');
      const response = await GET(request, createRouteParams('123', '456'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch flight');
   });
});

describe('PUT /api/trips/[id]/flights/[flightId]', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('should update a flight', async () => {
      const updatedFlight = { ...sampleDbFlight, airline: 'Delta' };
      mockSql.mockResolvedValueOnce([updatedFlight]);

      const request = new NextRequest('http://localhost/api/trips/123/flights/456', {
         method: 'PUT',
         body: JSON.stringify({ airline: 'Delta' }),
      });

      const response = await PUT(
         request,
         createRouteParams(sampleDbFlight.trip_id, sampleDbFlight.id)
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.airline).toBe('Delta');
   });

   it('should return 404 when flight not found', async () => {
      mockSql.mockResolvedValueOnce([]);

      const request = new NextRequest('http://localhost/api/trips/123/flights/nonexistent', {
         method: 'PUT',
         body: JSON.stringify({ airline: 'Updated' }),
      });

      const response = await PUT(request, createRouteParams('123', 'nonexistent'));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Flight not found');
   });

   it('should return 500 on database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/trips/123/flights/456', {
         method: 'PUT',
         body: JSON.stringify({ airline: 'Test' }),
      });

      const response = await PUT(request, createRouteParams('123', '456'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to update flight');
   });
});

describe('DELETE /api/trips/[id]/flights/[flightId]', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('should delete a flight', async () => {
      mockSql.mockResolvedValueOnce([sampleDbFlight]);

      const request = new NextRequest('http://localhost/api/trips/123/flights/456', {
         method: 'DELETE',
      });

      const response = await DELETE(
         request,
         createRouteParams(sampleDbFlight.trip_id, sampleDbFlight.id)
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.deletedId).toBe(sampleDbFlight.id);
   });

   it('should return 404 when flight not found', async () => {
      mockSql.mockResolvedValueOnce([]);

      const request = new NextRequest('http://localhost/api/trips/123/flights/nonexistent', {
         method: 'DELETE',
      });

      const response = await DELETE(request, createRouteParams('123', 'nonexistent'));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Flight not found');
   });

   it('should return 500 on database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/trips/123/flights/456', {
         method: 'DELETE',
      });

      const response = await DELETE(request, createRouteParams('123', '456'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to delete flight');
   });
});
