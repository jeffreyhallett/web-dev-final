import { NextRequest, NextResponse } from 'next/server';
import { sql, asType } from '@/lib/db';
import type { DbTrip, DbTripCity, DbActivity, DbAccommodation, DbFlight, DbTrain, DbNote } from '@/lib/db/types';
import { assembleTrip } from '@/lib/db/transforms';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/trips/[id] - Get a single trip with all related data
export async function GET(
   request: NextRequest,
   { params }: RouteParams
) {
   try {
      const { id } = await params;

      // Get the trip
      const trips = asType<DbTrip>(await sql`
         SELECT * FROM trips WHERE id = ${id}
      `);

      if (trips.length === 0) {
         return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
      }

      const trip = trips[0];

      // Fetch all related data in parallel
      const [cities, activities, accommodations, flights, trains, notes] =
         await Promise.all([
            sql`
               SELECT * FROM trip_cities
               WHERE trip_id = ${id}
               ORDER BY order_index
            `.then((r) => asType<DbTripCity>(r)),
            sql`
               SELECT * FROM activities
               WHERE trip_id = ${id}
               ORDER BY order_index, scheduled_time
            `.then((r) => asType<DbActivity>(r)),
            sql`
               SELECT * FROM accommodations
               WHERE trip_id = ${id}
               ORDER BY check_in
            `.then((r) => asType<DbAccommodation>(r)),
            sql`
               SELECT * FROM flights
               WHERE trip_id = ${id}
               ORDER BY departure_time
            `.then((r) => asType<DbFlight>(r)),
            sql`
               SELECT * FROM trains
               WHERE trip_id = ${id}
               ORDER BY departure_time
            `.then((r) => asType<DbTrain>(r)),
            sql`
               SELECT * FROM notes
               WHERE trip_id = ${id}
               ORDER BY note_date, created_at
            `.then((r) => asType<DbNote>(r)),
         ]);

      const assembledTrip = assembleTrip(
         trip,
         cities,
         activities,
         accommodations,
         flights,
         trains,
         notes
      );

      return NextResponse.json(assembledTrip);
   } catch (error) {
      console.error('Error fetching trip:', error);
      return NextResponse.json(
         { error: 'Failed to fetch trip' },
         { status: 500 }
      );
   }
}

// PUT /api/trips/[id] - Update a trip
export async function PUT(
   request: NextRequest,
   { params }: RouteParams
) {
   try {
      const { id } = await params;
      const body = await request.json();

      const { name, arrivalDate, departureDate } = body;

      const result = asType<DbTrip>(await sql`
         UPDATE trips
         SET
            name = COALESCE(${name}, name),
            arrival_date = COALESCE(${arrivalDate}, arrival_date),
            departure_date = COALESCE(${departureDate}, departure_date)
         WHERE id = ${id}
         RETURNING *
      `);

      if (result.length === 0) {
         return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
      }

      const updatedTrip = result[0];

      // Fetch related data to return complete trip
      const [cities, activities, accommodations, flights, trains, notes] =
         await Promise.all([
            sql`
               SELECT * FROM trip_cities
               WHERE trip_id = ${id}
               ORDER BY order_index
            `.then((r) => asType<DbTripCity>(r)),
            sql`
               SELECT * FROM activities
               WHERE trip_id = ${id}
               ORDER BY order_index, scheduled_time
            `.then((r) => asType<DbActivity>(r)),
            sql`
               SELECT * FROM accommodations
               WHERE trip_id = ${id}
               ORDER BY check_in
            `.then((r) => asType<DbAccommodation>(r)),
            sql`
               SELECT * FROM flights
               WHERE trip_id = ${id}
               ORDER BY departure_time
            `.then((r) => asType<DbFlight>(r)),
            sql`
               SELECT * FROM trains
               WHERE trip_id = ${id}
               ORDER BY departure_time
            `.then((r) => asType<DbTrain>(r)),
            sql`
               SELECT * FROM notes
               WHERE trip_id = ${id}
               ORDER BY note_date, created_at
            `.then((r) => asType<DbNote>(r)),
         ]);

      const assembledTrip = assembleTrip(
         updatedTrip,
         cities,
         activities,
         accommodations,
         flights,
         trains,
         notes
      );

      return NextResponse.json(assembledTrip);
   } catch (error) {
      console.error('Error updating trip:', error);
      return NextResponse.json(
         { error: 'Failed to update trip' },
         { status: 500 }
      );
   }
}

// DELETE /api/trips/[id] - Delete a trip
export async function DELETE(
   request: NextRequest,
   { params }: RouteParams
) {
   try {
      const { id } = await params;

      const result = asType<DbTrip>(await sql`
         DELETE FROM trips
         WHERE id = ${id}
         RETURNING *
      `);

      if (result.length === 0) {
         return NextResponse.json({ error: 'Trip not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, deletedId: id });
   } catch (error) {
      console.error('Error deleting trip:', error);
      return NextResponse.json(
         { error: 'Failed to delete trip' },
         { status: 500 }
      );
   }
}
