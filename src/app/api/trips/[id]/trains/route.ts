import { NextRequest, NextResponse } from 'next/server';
import { sql, asType } from '@/lib/db';
import type { DbTrain } from '@/lib/db/types';
import { dbTrainToTrain } from '@/lib/db/transforms';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(
   request: NextRequest,
   { params }: RouteParams
) {
   try {
      const { id: tripId } = await params;

      const trains = asType<DbTrain>(await sql`
         SELECT * FROM trains
         WHERE trip_id = ${tripId}
         ORDER BY departure_time
      `);

      return NextResponse.json(trains.map(dbTrainToTrain));
   } catch (error) {
      console.error('Error fetching trains:', error);
      return NextResponse.json(
         { error: 'Failed to fetch trains' },
         { status: 500 }
      );
   }
}

export async function POST(
   request: NextRequest,
   { params }: RouteParams
) {
   try {
      const { id: tripId } = await params;
      const body = await request.json();

      const {
         trainNumber,
         operator,
         departureStation,
         arrivalStation,
         departureTime,
         arrivalTime,
         confirmationNumber,
         bookingUrl,
         seatInfo,
         notes,
      } = body;

      if (!departureStation || !arrivalStation) {
         return NextResponse.json(
            { error: 'Departure and arrival stations are required' },
            { status: 400 }
         );
      }

      const result = asType<DbTrain>(await sql`
         INSERT INTO trains (
            trip_id,
            train_number,
            operator,
            departure_station,
            arrival_station,
            departure_time,
            arrival_time,
            confirmation_number,
            booking_url,
            seat_info,
            notes
         )
         VALUES (
            ${tripId},
            ${trainNumber || null},
            ${operator || null},
            ${departureStation},
            ${arrivalStation},
            ${departureTime || null},
            ${arrivalTime || null},
            ${confirmationNumber || null},
            ${bookingUrl || null},
            ${seatInfo || null},
            ${notes || null}
         )
         RETURNING *
      `);

      if (result.length === 0) {
         return NextResponse.json(
            { error: 'Failed to create train' },
            { status: 500 }
         );
      }

      return NextResponse.json(dbTrainToTrain(result[0]), { status: 201 });
   } catch (error) {
      console.error('Error creating train:', error);
      return NextResponse.json(
         { error: 'Failed to create train' },
         { status: 500 }
      );
   }
}
