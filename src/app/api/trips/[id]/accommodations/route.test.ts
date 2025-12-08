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

const createRouteParams = (id: string) => ({
   params: Promise.resolve({ id }),
});

describe('GET /api/trips/[id]/accommodations', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('should return accommodations for a trip', async () => {
      mockSql.mockResolvedValueOnce([sampleDbAccommodation]);
      mockSql.mockResolvedValueOnce([sampleDbCity]);

      const request = new NextRequest('http://localhost/api/trips/123/accommodations');
      const response = await GET(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(1);
      expect(data[0].name).toBe('Hotel Le Marais');
   });

   it('should filter accommodations by cityId', async () => {
      mockSql.mockResolvedValueOnce([sampleDbAccommodation]);
      mockSql.mockResolvedValueOnce([sampleDbCity]);

      const request = new NextRequest(
         'http://localhost/api/trips/123/accommodations?cityId=660e8400-e29b-41d4-a716-446655440001'
      );
      const response = await GET(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
   });

   it('should return empty array when no accommodations exist', async () => {
      mockSql.mockResolvedValueOnce([]);
      mockSql.mockResolvedValueOnce([]);

      const request = new NextRequest('http://localhost/api/trips/123/accommodations');
      const response = await GET(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
   });

   it('should return 500 on database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/trips/123/accommodations');
      const response = await GET(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch accommodations');
   });
});

describe('POST /api/trips/[id]/accommodations', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('should create a new accommodation', async () => {
      mockSql.mockResolvedValueOnce([sampleDbAccommodation]);
      mockSql.mockResolvedValueOnce([sampleDbCity]);

      const request = new NextRequest('http://localhost/api/trips/123/accommodations', {
         method: 'POST',
         body: JSON.stringify({
            name: 'Hotel Le Marais',
            address: '123 Rue du Temple, Paris',
            checkIn: '2024-06-01',
            checkOut: '2024-06-05',
            cityId: sampleDbCity.id,
         }),
      });

      const response = await POST(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe('Hotel Le Marais');
   });

   it('should create accommodation without city', async () => {
      const accommodationWithoutCity = { ...sampleDbAccommodation, city_id: null };
      mockSql.mockResolvedValueOnce([accommodationWithoutCity]);

      const request = new NextRequest('http://localhost/api/trips/123/accommodations', {
         method: 'POST',
         body: JSON.stringify({
            name: 'General Hotel',
         }),
      });

      const response = await POST(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(201);
   });

   it('should return 400 when name is missing', async () => {
      const request = new NextRequest('http://localhost/api/trips/123/accommodations', {
         method: 'POST',
         body: JSON.stringify({ address: '123 Street' }),
      });

      const response = await POST(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Name is required');
   });

   it('should return 500 on database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/trips/123/accommodations', {
         method: 'POST',
         body: JSON.stringify({ name: 'Test Hotel' }),
      });

      const response = await POST(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create accommodation');
   });
});
