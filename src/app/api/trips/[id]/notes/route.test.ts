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
const sampleDbNote = {
   id: 'bb0e8400-e29b-41d4-a716-446655440001',
   trip_id: '550e8400-e29b-41d4-a716-446655440001',
   content: 'Remember to bring passport and travel adapters',
   note_date: '2024-06-01',
   created_at: new Date('2024-01-01'),
   updated_at: new Date('2024-01-01'),
};

const createRouteParams = (id: string) => ({
   params: Promise.resolve({ id }),
});

describe('GET /api/trips/[id]/notes', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('should return notes for a trip', async () => {
      mockSql.mockResolvedValueOnce([sampleDbNote]);

      const request = new NextRequest('http://localhost/api/trips/123/notes');
      const response = await GET(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(1);
      expect(data[0].content).toBe('Remember to bring passport and travel adapters');
   });

   it('should return empty array when no notes exist', async () => {
      mockSql.mockResolvedValueOnce([]);

      const request = new NextRequest('http://localhost/api/trips/123/notes');
      const response = await GET(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
   });

   it('should return 500 on database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/trips/123/notes');
      const response = await GET(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch notes');
   });
});

describe('POST /api/trips/[id]/notes', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('should create a new note', async () => {
      mockSql.mockResolvedValueOnce([sampleDbNote]);

      const request = new NextRequest('http://localhost/api/trips/123/notes', {
         method: 'POST',
         body: JSON.stringify({
            content: 'Remember to bring passport and travel adapters',
            noteDate: '2024-06-01',
         }),
      });

      const response = await POST(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.content).toBe('Remember to bring passport and travel adapters');
   });

   it('should create note without date', async () => {
      const noteWithoutDate = { ...sampleDbNote, note_date: null };
      mockSql.mockResolvedValueOnce([noteWithoutDate]);

      const request = new NextRequest('http://localhost/api/trips/123/notes', {
         method: 'POST',
         body: JSON.stringify({
            content: 'General note without date',
         }),
      });

      const response = await POST(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(201);
   });

   it('should return 400 when content is missing', async () => {
      const request = new NextRequest('http://localhost/api/trips/123/notes', {
         method: 'POST',
         body: JSON.stringify({ noteDate: '2024-06-01' }),
      });

      const response = await POST(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Content is required');
   });

   it('should return 500 on database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/trips/123/notes', {
         method: 'POST',
         body: JSON.stringify({ content: 'Test note' }),
      });

      const response = await POST(request, createRouteParams('123'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create note');
   });
});
