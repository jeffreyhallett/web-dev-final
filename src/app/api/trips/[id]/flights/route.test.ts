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

const createRouteParams = (id: string) => ({
   params: Promise.resolve({ id }),
});

describe('GET /api/trips/[id]/flights', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('should return flights for a trip', async () => {
      mockSql.mockResolvedValueOnce([sampleDbFlight]);

      const request = new NextRequest('http://localhost/api/trips/123/flights');
      const response = await GET(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(1);
      expect(data[0].number).toBe('AF123');
      expect(data[0].airline).toBe('Air France');
   });

   it('should return empty array when no flights exist', async () => {
      mockSql.mockResolvedValueOnce([]);

      const request = new NextRequest('http://localhost/api/trips/123/flights');
      const response = await GET(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
   });

   it('should return 500 on database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/trips/123/flights');
      const response = await GET(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch flights');
   });
});

describe('POST /api/trips/[id]/flights', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('should create a new flight', async () => {
      mockSql.mockResolvedValueOnce([sampleDbFlight]);

      const request = new NextRequest('http://localhost/api/trips/123/flights', {
         method: 'POST',
         body: JSON.stringify({
            flightNumber: 'AF123',
            airline: 'Air France',
            departureAirport: 'JFK',
            arrivalAirport: 'CDG',
            departureTime: '2024-06-01T20:00:00Z',
            arrivalTime: '2024-06-02T09:00:00Z',
         }),
      });

      const response = await POST(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.number).toBe('AF123');
      expect(data.airline).toBe('Air France');
   });

   it('should create flight with minimal data', async () => {
      mockSql.mockResolvedValueOnce([sampleDbFlight]);

      const request = new NextRequest('http://localhost/api/trips/123/flights', {
         method: 'POST',
         body: JSON.stringify({
            departureAirport: 'JFK',
            arrivalAirport: 'CDG',
         }),
      });

      const response = await POST(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(201);
   });

   it('should return 400 when airports are missing', async () => {
      const request = new NextRequest('http://localhost/api/trips/123/flights', {
         method: 'POST',
         body: JSON.stringify({ flightNumber: 'AF123' }),
      });

      const response = await POST(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Departure and arrival airports are required');
   });

   it('should return 500 on database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/trips/123/flights', {
         method: 'POST',
         body: JSON.stringify({
            departureAirport: 'JFK',
            arrivalAirport: 'CDG',
         }),
      });

      const response = await POST(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create flight');
   });
});
