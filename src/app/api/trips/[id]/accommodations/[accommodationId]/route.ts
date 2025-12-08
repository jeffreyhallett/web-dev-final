import { NextRequest, NextResponse } from 'next/server';
import { sql, asType } from '@/lib/db';
import type { DbAccommodation, DbTripCity } from '@/lib/db/types';
import { dbAccommodationToAccommodation, dbCityToCity } from '@/lib/db/transforms';

type RouteParams = {
   params: Promise<{ id: string; accommodationId: string }>;
};

// Helper to get accommodation with city
async function getAccommodationWithCity(
   tripId: string,
   accommodationId: string
) {
   const accommodations = asType<DbAccommodation>(await sql`
      SELECT * FROM accommodations
      WHERE id = ${accommodationId} AND trip_id = ${tripId}
   `);

   if (accommodations.length === 0) {
      return null;
   }

   const accommodation = accommodations[0];
   let city = null;

   if (accommodation.city_id) {
      const cities = asType<DbTripCity>(await sql`
         SELECT * FROM trip_cities WHERE id = ${accommodation.city_id}
      `);
      if (cities.length > 0) {
         city = dbCityToCity(cities[0]);
      }
   }

   return dbAccommodationToAccommodation(accommodation, city);
}

// GET /api/trips/[id]/accommodations/[accommodationId] - Get a single accommodation
export async function GET(
   request: NextRequest,
   { params }: RouteParams
) {
   try {
      const { id: tripId, accommodationId } = await params;

      const accommodation = await getAccommodationWithCity(
         tripId,
         accommodationId
      );

      if (!accommodation) {
         return NextResponse.json(
            { error: 'Accommodation not found' },
            { status: 404 }
         );
      }

      return NextResponse.json(accommodation);
   } catch (error) {
      console.error('Error fetching accommodation:', error);
      return NextResponse.json(
         { error: 'Failed to fetch accommodation' },
         { status: 500 }
      );
   }
}

// PUT /api/trips/[id]/accommodations/[accommodationId] - Update an accommodation
export async function PUT(
   request: NextRequest,
   { params }: RouteParams
) {
   try {
      const { id: tripId, accommodationId } = await params;
      const body = await request.json();

      const {
         name,
         address,
         checkIn,
         checkOut,
         confirmationNumber,
         bookingUrl,
         notes,
         cityId,
      } = body;

      const result = asType<DbAccommodation>(await sql`
         UPDATE accommodations
         SET
            name = COALESCE(${name}, name),
            address = COALESCE(${address}, address),
            check_in = COALESCE(${checkIn}, check_in),
            check_out = COALESCE(${checkOut}, check_out),
            confirmation_number = COALESCE(${confirmationNumber}, confirmation_number),
            booking_url = COALESCE(${bookingUrl}, booking_url),
            notes = COALESCE(${notes}, notes),
            city_id = COALESCE(${cityId}, city_id)
         WHERE id = ${accommodationId} AND trip_id = ${tripId}
         RETURNING *
      `);

      if (result.length === 0) {
         return NextResponse.json(
            { error: 'Accommodation not found' },
            { status: 404 }
         );
      }

      const accommodation = result[0];
      let city = null;

      if (accommodation.city_id) {
         const cities = asType<DbTripCity>(await sql`
            SELECT * FROM trip_cities WHERE id = ${accommodation.city_id}
         `);
         if (cities.length > 0) {
            city = dbCityToCity(cities[0]);
         }
      }

      return NextResponse.json(dbAccommodationToAccommodation(accommodation, city));
   } catch (error) {
      console.error('Error updating accommodation:', error);
      return NextResponse.json(
         { error: 'Failed to update accommodation' },
         { status: 500 }
      );
   }
}

// DELETE /api/trips/[id]/accommodations/[accommodationId] - Delete an accommodation
export async function DELETE(
   request: NextRequest,
   { params }: RouteParams
) {
   try {
      const { id: tripId, accommodationId } = await params;

      const result = asType<DbAccommodation>(await sql`
         DELETE FROM accommodations
         WHERE id = ${accommodationId} AND trip_id = ${tripId}
         RETURNING *
      `);

      if (result.length === 0) {
         return NextResponse.json(
            { error: 'Accommodation not found' },
            { status: 404 }
         );
      }

      return NextResponse.json({ success: true, deletedId: accommodationId });
   } catch (error) {
      console.error('Error deleting accommodation:', error);
      return NextResponse.json(
         { error: 'Failed to delete accommodation' },
         { status: 500 }
      );
   }
}
