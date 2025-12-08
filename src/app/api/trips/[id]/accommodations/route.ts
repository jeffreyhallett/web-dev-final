import { NextRequest, NextResponse } from 'next/server';
import { sql, asType } from '@/lib/db';
import type { DbAccommodation, DbTripCity } from '@/lib/db/types';
import { dbAccommodationToAccommodation, dbCityToCity } from '@/lib/db/transforms';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/trips/[id]/accommodations - Get all accommodations for a trip
export async function GET(
   request: NextRequest,
   { params }: RouteParams
) {
   try {
      const { id: tripId } = await params;
      const { searchParams } = new URL(request.url);
      const cityId = searchParams.get('cityId');

      // Build query based on optional cityId filter
      let accommodations: DbAccommodation[];
      if (cityId) {
         accommodations = asType<DbAccommodation>(await sql`
            SELECT * FROM accommodations
            WHERE trip_id = ${tripId} AND city_id = ${cityId}
            ORDER BY check_in
         `);
      } else {
         accommodations = asType<DbAccommodation>(await sql`
            SELECT * FROM accommodations
            WHERE trip_id = ${tripId}
            ORDER BY check_in
         `);
      }

      // Get all cities for the trip to build city map
      const cities = asType<DbTripCity>(await sql`
         SELECT * FROM trip_cities
         WHERE trip_id = ${tripId}
      `);
      const cityMap = new Map(cities.map((c) => [c.id, dbCityToCity(c)]));

      const result = accommodations.map((a) =>
         dbAccommodationToAccommodation(
            a,
            a.city_id ? cityMap.get(a.city_id) || null : null
         )
      );

      return NextResponse.json(result);
   } catch (error) {
      console.error('Error fetching accommodations:', error);
      return NextResponse.json(
         { error: 'Failed to fetch accommodations' },
         { status: 500 }
      );
   }
}

// POST /api/trips/[id]/accommodations - Create a new accommodation
export async function POST(
   request: NextRequest,
   { params }: RouteParams
) {
   try {
      const { id: tripId } = await params;
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

      // Validate required fields
      if (!name) {
         return NextResponse.json(
            { error: 'Name is required' },
            { status: 400 }
         );
      }

      const result = asType<DbAccommodation>(await sql`
         INSERT INTO accommodations (
            trip_id,
            city_id,
            name,
            address,
            check_in,
            check_out,
            confirmation_number,
            booking_url,
            notes
         )
         VALUES (
            ${tripId},
            ${cityId || null},
            ${name},
            ${address || null},
            ${checkIn || null},
            ${checkOut || null},
            ${confirmationNumber || null},
            ${bookingUrl || null},
            ${notes || null}
         )
         RETURNING *
      `);

      if (result.length === 0) {
         return NextResponse.json(
            { error: 'Failed to create accommodation' },
            { status: 500 }
         );
      }

      // Get the city if referenced
      let city = null;
      if (result[0].city_id) {
         const cities = asType<DbTripCity>(await sql`
            SELECT * FROM trip_cities WHERE id = ${result[0].city_id}
         `);
         if (cities.length > 0) {
            city = dbCityToCity(cities[0]);
         }
      }

      return NextResponse.json(dbAccommodationToAccommodation(result[0], city), {
         status: 201,
      });
   } catch (error) {
      console.error('Error creating accommodation:', error);
      return NextResponse.json(
         { error: 'Failed to create accommodation' },
         { status: 500 }
      );
   }
}
