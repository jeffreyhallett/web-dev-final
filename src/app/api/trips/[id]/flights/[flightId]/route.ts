import { NextRequest, NextResponse } from 'next/server';
import { sql, asType } from '@/lib/db';
import type { DbFlight } from '@/lib/db/types';
import { dbFlightToFlight } from '@/lib/db/transforms';

type RouteParams = { params: Promise<{ id: string; flightId: string }> };

// GET /api/trips/[id]/flights/[flightId] - Get a single flight
export async function GET(
   request: NextRequest,
   { params }: RouteParams
) {
   try {
      const { id: tripId, flightId } = await params;

      const flights = asType<DbFlight>(await sql`
         SELECT * FROM flights
         WHERE id = ${flightId} AND trip_id = ${tripId}
      `);

      if (flights.length === 0) {
         return NextResponse.json(
            { error: 'Flight not found' },
            { status: 404 }
         );
      }

      return NextResponse.json(dbFlightToFlight(flights[0]));
   } catch (error) {
      console.error('Error fetching flight:', error);
      return NextResponse.json(
         { error: 'Failed to fetch flight' },
         { status: 500 }
      );
   }
}

// PUT /api/trips/[id]/flights/[flightId] - Update a flight
export async function PUT(
   request: NextRequest,
   { params }: RouteParams
) {
   try {
      const { id: tripId, flightId } = await params;
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

      const result = asType<DbFlight>(await sql`
         UPDATE flights
         SET
            flight_number = COALESCE(${flightNumber}, flight_number),
            airline = COALESCE(${airline}, airline),
            departure_airport = COALESCE(${departureAirport}, departure_airport),
            arrival_airport = COALESCE(${arrivalAirport}, arrival_airport),
            departure_time = COALESCE(${departureTime}, departure_time),
            arrival_time = COALESCE(${arrivalTime}, arrival_time),
            confirmation_number = COALESCE(${confirmationNumber}, confirmation_number),
            booking_url = COALESCE(${bookingUrl}, booking_url),
            notes = COALESCE(${notes}, notes)
         WHERE id = ${flightId} AND trip_id = ${tripId}
         RETURNING *
      `);

      if (result.length === 0) {
         return NextResponse.json(
            { error: 'Flight not found' },
            { status: 404 }
         );
      }

      return NextResponse.json(dbFlightToFlight(result[0]));
   } catch (error) {
      console.error('Error updating flight:', error);
      return NextResponse.json(
         { error: 'Failed to update flight' },
         { status: 500 }
      );
   }
}

// DELETE /api/trips/[id]/flights/[flightId] - Delete a flight
export async function DELETE(
   request: NextRequest,
   { params }: RouteParams
) {
   try {
      const { id: tripId, flightId } = await params;

      const result = asType<DbFlight>(await sql`
         DELETE FROM flights
         WHERE id = ${flightId} AND trip_id = ${tripId}
         RETURNING *
      `);

      if (result.length === 0) {
         return NextResponse.json(
            { error: 'Flight not found' },
            { status: 404 }
         );
      }

      return NextResponse.json({ success: true, deletedId: flightId });
   } catch (error) {
      console.error('Error deleting flight:', error);
      return NextResponse.json(
         { error: 'Failed to delete flight' },
         { status: 500 }
      );
   }
}
