import { NextRequest, NextResponse } from 'next/server';
import { sql, asType } from '@/lib/db';
import type { DbTrip, DbTripCity, DbActivity, DbAccommodation, DbFlight, DbTrain, DbNote } from '@/lib/db/types';
import { assembleTrip } from '@/lib/db/transforms';

// For now, we'll use a hardcoded user ID or accept it from headers
// In production, this would come from authentication
function getUserId(request: NextRequest): string {
   return request.headers.get('x-user-id') || '00000000-0000-0000-0000-000000000001';
}

// GET /api/trips - Get all trips for the current user
export async function GET(request: NextRequest) {
   try {
      const userId = getUserId(request);

      // Get all trips for the user
      const trips = asType<DbTrip>(await sql`
         SELECT * FROM trips
         WHERE user_id = ${userId}
         ORDER BY arrival_date DESC NULLS LAST, created_at DESC
      `);

      if (trips.length === 0) {
         return NextResponse.json([]);
      }

      // Get all trip IDs for batch querying
      const tripIds = trips.map((t) => t.id);

      // Batch fetch all related data
      const [cities, activities, accommodations, flights, trains, notes] =
         await Promise.all([
            sql`
               SELECT * FROM trip_cities
               WHERE trip_id = ANY(${tripIds})
               ORDER BY order_index
            `.then((r) => asType<DbTripCity>(r)),
            sql`
               SELECT * FROM activities
               WHERE trip_id = ANY(${tripIds})
               ORDER BY order_index, scheduled_time
            `.then((r) => asType<DbActivity>(r)),
            sql`
               SELECT * FROM accommodations
               WHERE trip_id = ANY(${tripIds})
               ORDER BY check_in
            `.then((r) => asType<DbAccommodation>(r)),
            sql`
               SELECT * FROM flights
               WHERE trip_id = ANY(${tripIds})
               ORDER BY departure_time
            `.then((r) => asType<DbFlight>(r)),
            sql`
               SELECT * FROM trains
               WHERE trip_id = ANY(${tripIds})
               ORDER BY departure_time
            `.then((r) => asType<DbTrain>(r)),
            sql`
               SELECT * FROM notes
               WHERE trip_id = ANY(${tripIds})
               ORDER BY note_date, created_at
            `.then((r) => asType<DbNote>(r)),
         ]);

      // Assemble trips with their related data
      const assembledTrips = trips.map((trip) =>
         assembleTrip(
            trip,
            cities.filter((c) => c.trip_id === trip.id),
            activities.filter((a) => a.trip_id === trip.id),
            accommodations.filter((a) => a.trip_id === trip.id),
            flights.filter((f) => f.trip_id === trip.id),
            trains.filter((t) => t.trip_id === trip.id),
            notes.filter((n) => n.trip_id === trip.id)
         )
      );

      return NextResponse.json(assembledTrips);
   } catch (error) {
      console.error('Error fetching trips:', error);
      return NextResponse.json(
         { error: 'Failed to fetch trips' },
         { status: 500 }
      );
   }
}

// POST /api/trips - Create a new trip
export async function POST(request: NextRequest) {
   try {
      const userId = getUserId(request);
      const body = await request.json();

      const { name, arrivalDate, departureDate } = body;

      const result = asType<DbTrip>(await sql`
         INSERT INTO trips (user_id, name, arrival_date, departure_date)
         VALUES (${userId}, ${name || null}, ${arrivalDate || null}, ${departureDate || null})
         RETURNING *
      `);

      const newTrip = result[0];

      // Return the trip in frontend format
      return NextResponse.json(
         {
            id: newTrip.id,
            userId: newTrip.user_id,
            name: newTrip.name || undefined,
            cities: [],
            dates: {
               arrival: newTrip.arrival_date || '',
               departure: newTrip.departure_date || '',
            },
            activities: [],
            accommodation: [],
            transportation: {
               flights: [],
               trainRides: [],
            },
            notes: [],
         },
         { status: 201 }
      );
   } catch (error) {
      console.error('Error creating trip:', error);
      return NextResponse.json(
         { error: 'Failed to create trip' },
         { status: 500 }
      );
   }
}
