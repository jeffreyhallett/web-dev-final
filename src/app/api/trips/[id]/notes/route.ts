import { NextRequest, NextResponse } from 'next/server';
import { sql, asType } from '@/lib/db';
import type { DbNote } from '@/lib/db/types';
import { dbNoteToNote } from '@/lib/db/transforms';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/trips/[id]/notes - Get all notes for a trip
export async function GET(
   request: NextRequest,
   { params }: RouteParams
) {
   try {
      const { id: tripId } = await params;

      const notes = asType<DbNote>(await sql`
         SELECT * FROM notes
         WHERE trip_id = ${tripId}
         ORDER BY note_date, created_at
      `);

      return NextResponse.json(notes.map(dbNoteToNote));
   } catch (error) {
      console.error('Error fetching notes:', error);
      return NextResponse.json(
         { error: 'Failed to fetch notes' },
         { status: 500 }
      );
   }
}

// POST /api/trips/[id]/notes - Create a new note
export async function POST(
   request: NextRequest,
   { params }: RouteParams
) {
   try {
      const { id: tripId } = await params;
      const body = await request.json();

      const { content, noteDate } = body;

      // Validate required fields
      if (!content) {
         return NextResponse.json(
            { error: 'Content is required' },
            { status: 400 }
         );
      }

      const result = asType<DbNote>(await sql`
         INSERT INTO notes (trip_id, content, note_date)
         VALUES (${tripId}, ${content}, ${noteDate || null})
         RETURNING *
      `);

      if (result.length === 0) {
         return NextResponse.json(
            { error: 'Failed to create note' },
            { status: 500 }
         );
      }

      return NextResponse.json(dbNoteToNote(result[0]), { status: 201 });
   } catch (error) {
      console.error('Error creating note:', error);
      return NextResponse.json(
         { error: 'Failed to create note' },
         { status: 500 }
      );
   }
}
