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

const createRouteParams = (id: string, trainId: string) => ({
   params: Promise.resolve({ id, trainId }),
});

describe('GET /api/trips/[id]/trains/[trainId]', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('should return a train', async () => {
      mockSql.mockResolvedValueOnce([sampleDbTrain]);

      const request = new NextRequest('http://localhost/api/trips/123/trains/456');
      const response = await GET(
         request,
         createRouteParams(sampleDbTrain.trip_id, sampleDbTrain.id)
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.number).toBe('TGV9876');
      expect(data.operator).toBe('SNCF');
   });

   it('should return 404 when train not found', async () => {
      mockSql.mockResolvedValueOnce([]);

      const request = new NextRequest('http://localhost/api/trips/123/trains/nonexistent');
      const response = await GET(request, createRouteParams('123', 'nonexistent'));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Train not found');
   });

   it('should return 500 on database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/trips/123/trains/456');
      const response = await GET(request, createRouteParams('123', '456'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch train');
   });
});

describe('PUT /api/trips/[id]/trains/[trainId]', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('should update a train', async () => {
      const updatedTrain = { ...sampleDbTrain, operator: 'Trenitalia' };
      mockSql.mockResolvedValueOnce([updatedTrain]);

      const request = new NextRequest('http://localhost/api/trips/123/trains/456', {
         method: 'PUT',
         body: JSON.stringify({ operator: 'Trenitalia' }),
      });

      const response = await PUT(
         request,
         createRouteParams(sampleDbTrain.trip_id, sampleDbTrain.id)
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.operator).toBe('Trenitalia');
   });

   it('should return 404 when train not found', async () => {
      mockSql.mockResolvedValueOnce([]);

      const request = new NextRequest('http://localhost/api/trips/123/trains/nonexistent', {
         method: 'PUT',
         body: JSON.stringify({ operator: 'Updated' }),
      });

      const response = await PUT(request, createRouteParams('123', 'nonexistent'));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Train not found');
   });

   it('should return 500 on database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/trips/123/trains/456', {
         method: 'PUT',
         body: JSON.stringify({ operator: 'Test' }),
      });

      const response = await PUT(request, createRouteParams('123', '456'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to update train');
   });
});

describe('DELETE /api/trips/[id]/trains/[trainId]', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('should delete a train', async () => {
      mockSql.mockResolvedValueOnce([sampleDbTrain]);

      const request = new NextRequest('http://localhost/api/trips/123/trains/456', {
         method: 'DELETE',
      });

      const response = await DELETE(
         request,
         createRouteParams(sampleDbTrain.trip_id, sampleDbTrain.id)
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.deletedId).toBe(sampleDbTrain.id);
   });

   it('should return 404 when train not found', async () => {
      mockSql.mockResolvedValueOnce([]);

      const request = new NextRequest('http://localhost/api/trips/123/trains/nonexistent', {
         method: 'DELETE',
      });

      const response = await DELETE(request, createRouteParams('123', 'nonexistent'));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Train not found');
   });

   it('should return 500 on database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/trips/123/trains/456', {
         method: 'DELETE',
      });

      const response = await DELETE(request, createRouteParams('123', '456'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to delete train');
   });
});
