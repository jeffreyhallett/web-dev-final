import { NextRequest, NextResponse } from 'next/server';
import { sql, asType } from '@/lib/db';
import type { DbFlight } from '@/lib/db/types';
import { dbFlightToFlight } from '@/lib/db/transforms';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/trips/[id]/flights - Get all flights for a trip
export async function GET(
   request: NextRequest,
   { params }: RouteParams
) {
   try {
      const { id: tripId } = await params;

      const flights = asType<DbFlight>(await sql`
         SELECT * FROM flights
         WHERE trip_id = ${tripId}
         ORDER BY departure_time
      `);

      return NextResponse.json(flights.map(dbFlightToFlight));
   } catch (error) {
      console.error('Error fetching flights:', error);
      return NextResponse.json(
         { error: 'Failed to fetch flights' },
         { status: 500 }
      );
   }
}

// POST /api/trips/[id]/flights - Create a new flight
export async function POST(
   request: NextRequest,
   { params }: RouteParams
) {
   try {
      const { id: tripId } = await params;
      const body = await request.json();

      const {
         flightNumber,
         airline,
         departureAirport,
         arrivalAirport,
         departureTime,
         arrivalTime,
         confirmationNumber,
         bookingUrl,
         notes,
      } = body;

      // Validate required fields
      if (!departureAirport || !arrivalAirport) {
         return NextResponse.json(
            { error: 'Departure and arrival airports are required' },
            { status: 400 }
         );
      }

      const result = asType<DbFlight>(await sql`
         INSERT INTO flights (
            trip_id,
            flight_number,
            airline,
            departure_airport,
            arrival_airport,
            departure_time,
            arrival_time,
            confirmation_number,
            booking_url,
            notes
         )
         VALUES (
            ${tripId},
            ${flightNumber || null},
            ${airline || null},
            ${departureAirport},
            ${arrivalAirport},
            ${departureTime || null},
            ${arrivalTime || null},
            ${confirmationNumber || null},
            ${bookingUrl || null},
            ${notes || null}
         )
         RETURNING *
      `);

      if (result.length === 0) {
         return NextResponse.json(
            { error: 'Failed to create flight' },
            { status: 500 }
         );
      }

      return NextResponse.json(dbFlightToFlight(result[0]), { status: 201 });
   } catch (error) {
      console.error('Error creating flight:', error);
      return NextResponse.json(
         { error: 'Failed to create flight' },
         { status: 500 }
      );
   }
}
