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
const sampleDbNote = {
   id: 'bb0e8400-e29b-41d4-a716-446655440001',
   trip_id: '550e8400-e29b-41d4-a716-446655440001',
   content: 'Remember to bring passport and travel adapters',
   note_date: '2024-06-01',
   created_at: new Date('2024-01-01'),
   updated_at: new Date('2024-01-01'),
};

const createRouteParams = (id: string, noteId: string) => ({
   params: Promise.resolve({ id, noteId }),
});

describe('GET /api/trips/[id]/notes/[noteId]', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('should return a note', async () => {
      mockSql.mockResolvedValueOnce([sampleDbNote]);

      const request = new NextRequest('http://localhost/api/trips/123/notes/456');
      const response = await GET(
         request,
         createRouteParams(sampleDbNote.trip_id, sampleDbNote.id)
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toBe('Remember to bring passport and travel adapters');
   });

   it('should return 404 when note not found', async () => {
      mockSql.mockResolvedValueOnce([]);

      const request = new NextRequest('http://localhost/api/trips/123/notes/nonexistent');
      const response = await GET(request, createRouteParams('123', 'nonexistent'));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Note not found');
   });

   it('should return 500 on database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/trips/123/notes/456');
      const response = await GET(request, createRouteParams('123', '456'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch note');
   });
});

describe('PUT /api/trips/[id]/notes/[noteId]', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('should update a note', async () => {
      const updatedNote = { ...sampleDbNote, content: 'Updated note content' };
      mockSql.mockResolvedValueOnce([updatedNote]);

      const request = new NextRequest('http://localhost/api/trips/123/notes/456', {
         method: 'PUT',
         body: JSON.stringify({ content: 'Updated note content' }),
      });

      const response = await PUT(
         request,
         createRouteParams(sampleDbNote.trip_id, sampleDbNote.id)
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.content).toBe('Updated note content');
   });

   it('should return 404 when note not found', async () => {
      mockSql.mockResolvedValueOnce([]);

      const request = new NextRequest('http://localhost/api/trips/123/notes/nonexistent', {
         method: 'PUT',
         body: JSON.stringify({ content: 'Updated' }),
      });

      const response = await PUT(request, createRouteParams('123', 'nonexistent'));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Note not found');
   });

   it('should return 500 on database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/trips/123/notes/456', {
         method: 'PUT',
         body: JSON.stringify({ content: 'Test' }),
      });

      const response = await PUT(request, createRouteParams('123', '456'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to update note');
   });
});

describe('DELETE /api/trips/[id]/notes/[noteId]', () => {
   beforeEach(() => {
      vi.clearAllMocks();
   });

   it('should delete a note', async () => {
      mockSql.mockResolvedValueOnce([sampleDbNote]);

      const request = new NextRequest('http://localhost/api/trips/123/notes/456', {
         method: 'DELETE',
      });

      const response = await DELETE(
         request,
         createRouteParams(sampleDbNote.trip_id, sampleDbNote.id)
      );
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.deletedId).toBe(sampleDbNote.id);
   });

   it('should return 404 when note not found', async () => {
      mockSql.mockResolvedValueOnce([]);

      const request = new NextRequest('http://localhost/api/trips/123/notes/nonexistent', {
         method: 'DELETE',
      });

      const response = await DELETE(request, createRouteParams('123', 'nonexistent'));
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Note not found');
   });

   it('should return 500 on database error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const request = new NextRequest('http://localhost/api/trips/123/notes/456', {
         method: 'DELETE',
      });

      const response = await DELETE(request, createRouteParams('123', '456'));
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to delete note');
   });
});
