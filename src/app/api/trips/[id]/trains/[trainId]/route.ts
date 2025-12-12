import { NextRequest, NextResponse } from 'next/server';
import { sql, asType } from '@/lib/db';
import type { DbTrain } from '@/lib/db/types';
import { dbTrainToTrain } from '@/lib/db/transforms';

type RouteParams = { params: Promise<{ id: string; trainId: string }> };

export async function GET(
   request: NextRequest,
   { params }: RouteParams
) {
   try {
      const { id: tripId, trainId } = await params;

      const trains = asType<DbTrain>(await sql`
         SELECT * FROM trains
         WHERE id = ${trainId} AND trip_id = ${tripId}
      `);

      if (trains.length === 0) {
         return NextResponse.json(
            { error: 'Train not found' },
            { status: 404 }
         );
      }

      return NextResponse.json(dbTrainToTrain(trains[0]));
   } catch (error) {
      console.error('Error fetching train:', error);
      return NextResponse.json(
         { error: 'Failed to fetch train' },
         { status: 500 }
      );
   }
}

export async function PUT(
   request: NextRequest,
   { params }: RouteParams
) {
   try {
      const { id: tripId, trainId } = await params;
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

      const result = asType<DbTrain>(await sql`
         UPDATE trains
         SET
            train_number = COALESCE(${trainNumber}, train_number),
            operator = COALESCE(${operator}, operator),
            departure_station = COALESCE(${departureStation}, departure_station),
            arrival_station = COALESCE(${arrivalStation}, arrival_station),
            departure_time = COALESCE(${departureTime}, departure_time),
            arrival_time = COALESCE(${arrivalTime}, arrival_time),
            confirmation_number = COALESCE(${confirmationNumber}, confirmation_number),
            booking_url = COALESCE(${bookingUrl}, booking_url),
            seat_info = COALESCE(${seatInfo}, seat_info),
            notes = COALESCE(${notes}, notes)
         WHERE id = ${trainId} AND trip_id = ${tripId}
         RETURNING *
      `);

      if (result.length === 0) {
         return NextResponse.json(
            { error: 'Train not found' },
            { status: 404 }
         );
      }

      return NextResponse.json(dbTrainToTrain(result[0]));
   } catch (error) {
      console.error('Error updating train:', error);
      return NextResponse.json(
         { error: 'Failed to update train' },
         { status: 500 }
      );
   }
}

export async function DELETE(
   request: NextRequest,
   { params }: RouteParams
) {
   try {
      const { id: tripId, trainId } = await params;

      const result = asType<DbTrain>(await sql`
         DELETE FROM trains
         WHERE id = ${trainId} AND trip_id = ${tripId}
         RETURNING *
      `);

      if (result.length === 0) {
         return NextResponse.json(
            { error: 'Train not found' },
            { status: 404 }
         );
      }

      return NextResponse.json({ success: true, deletedId: trainId });
   } catch (error) {
      console.error('Error deleting train:', error);
      return NextResponse.json(
         { error: 'Failed to delete train' },
         { status: 500 }
      );
   }
}
