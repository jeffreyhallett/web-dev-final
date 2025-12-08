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
const sampleDbTrain = {
   id: 'aa0e8400-e29b-41d4-a716-446655440001',
   trip_id: '550e8400-e29b-41d4-a716-446655440001',
   train_number: 'TGV9876',
   operator: 'SNCF',
   departure_station: 'Paris Gare de Lyon',
   arrival_station: 'Roma Termini',
   departure_time: '2024-06-05T08:00:00Z',
   arrival_time: '2024-06-05T18:30:00Z',
   confirmation_number: 'SNCF-XYZ789',
   booking_url: 'https://sncf.com/booking',
   seat_info: 'Car 12, Seat 45A',
   notes: 'First class ticket',
   created_at: new Date('2024-01-01'),
   updated_at: new Date('2024-01-01'),
};

const createRouteParams = (id: string) => ({
   params: Promise.resolve({ id }),
});

describe('GET /api/trips/[id]/trains', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('should return trains for a trip', async () => {
      mockSql.mockResolvedValueOnce([sampleDbTrain]);

      const request = new NextRequest('http://localhost/api/trips/123/trains');
      const response = await GET(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(1);
      expect(data[0].number).toBe('TGV9876');
      expect(data[0].operator).toBe('SNCF');
   });

   it('should return empty array when no trains exist', async () => {
      mockSql.mockResolvedValueOnce([]);

      const request = new NextRequest('http://localhost/api/trips/123/trains');
      const response = await GET(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
   });

   it('should return 500 on database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/trips/123/trains');
      const response = await GET(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch trains');
   });
});

describe('POST /api/trips/[id]/trains', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('should create a new train', async () => {
      mockSql.mockResolvedValueOnce([sampleDbTrain]);

      const request = new NextRequest('http://localhost/api/trips/123/trains', {
         method: 'POST',
         body: JSON.stringify({
            trainNumber: 'TGV9876',
            operator: 'SNCF',
            departureStation: 'Paris Gare de Lyon',
            arrivalStation: 'Roma Termini',
            departureTime: '2024-06-05T08:00:00Z',
            arrivalTime: '2024-06-05T18:30:00Z',
         }),
      });

      const response = await POST(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.number).toBe('TGV9876');
      expect(data.operator).toBe('SNCF');
   });

   it('should create train with minimal data', async () => {
      mockSql.mockResolvedValueOnce([sampleDbTrain]);

      const request = new NextRequest('http://localhost/api/trips/123/trains', {
         method: 'POST',
         body: JSON.stringify({
            departureStation: 'Paris Gare de Lyon',
            arrivalStation: 'Roma Termini',
         }),
      });

      const response = await POST(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(201);
   });

   it('should return 400 when stations are missing', async () => {
      const request = new NextRequest('http://localhost/api/trips/123/trains', {
         method: 'POST',
         body: JSON.stringify({ trainNumber: 'TGV9876' }),
      });

      const response = await POST(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Departure and arrival stations are required');
   });

   it('should return 500 on database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/trips/123/trains', {
         method: 'POST',
         body: JSON.stringify({
            departureStation: 'Paris',
            arrivalStation: 'Rome',
         }),
      });

      const response = await POST(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create train');
   });
});
