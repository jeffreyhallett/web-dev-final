import { NextRequest, NextResponse } from 'next/server';
import { sql, asType } from '@/lib/db';
import type { DbNote } from '@/lib/db/types';
import { dbNoteToNote } from '@/lib/db/transforms';

type RouteParams = { params: Promise<{ id: string; noteId: string }> };

// GET /api/trips/[id]/notes/[noteId] - Get a single note
export async function GET(
   request: NextRequest,
   { params }: RouteParams
) {
   try {
      const { id: tripId, noteId } = await params;

      const notes = asType<DbNote>(await sql`
         SELECT * FROM notes
         WHERE id = ${noteId} AND trip_id = ${tripId}
      `);

      if (notes.length === 0) {
         return NextResponse.json({ error: 'Note not found' }, { status: 404 });
      }

      return NextResponse.json(dbNoteToNote(notes[0]));
   } catch (error) {
      console.error('Error fetching note:', error);
      return NextResponse.json(
         { error: 'Failed to fetch note' },
         { status: 500 }
      );
   }
}

// PUT /api/trips/[id]/notes/[noteId] - Update a note
export async function PUT(
   request: NextRequest,
   { params }: RouteParams
) {
   try {
      const { id: tripId, noteId } = await params;
      const body = await request.json();

      const { content, noteDate } = body;

      const result = asType<DbNote>(await sql`
         UPDATE notes
         SET
            content = COALESCE(${content}, content),
            note_date = COALESCE(${noteDate}, note_date)
         WHERE id = ${noteId} AND trip_id = ${tripId}
         RETURNING *
      `);

      if (result.length === 0) {
         return NextResponse.json({ error: 'Note not found' }, { status: 404 });
      }

      return NextResponse.json(dbNoteToNote(result[0]));
   } catch (error) {
      console.error('Error updating note:', error);
      return NextResponse.json(
         { error: 'Failed to update note' },
         { status: 500 }
      );
   }
}

// DELETE /api/trips/[id]/notes/[noteId] - Delete a note
export async function DELETE(
   request: NextRequest,
   { params }: RouteParams
) {
   try {
      const { id: tripId, noteId } = await params;

      const result = asType<DbNote>(await sql`
         DELETE FROM notes
         WHERE id = ${noteId} AND trip_id = ${tripId}
         RETURNING *
      `);

      if (result.length === 0) {
         return NextResponse.json({ error: 'Note not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, deletedId: noteId });
   } catch (error) {
      console.error('Error deleting note:', error);
      return NextResponse.json(
         { error: 'Failed to delete note' },
         { status: 500 }
      );
   }
}
