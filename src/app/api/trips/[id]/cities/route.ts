import { NextRequest, NextResponse } from 'next/server';
import { sql, asType } from '@/lib/db';
import type { DbTripCity } from '@/lib/db/types';
import { dbCityToCity } from '@/lib/db/transforms';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(
   request: NextRequest,
   { params }: RouteParams
) {
   try {
      const { id } = await params;

      const cities = asType<DbTripCity>(await sql`
         SELECT * FROM trip_cities
         WHERE trip_id = ${id}
         ORDER BY order_index
      `);

      return NextResponse.json(cities.map(dbCityToCity));
   } catch (error) {
      console.error('Error fetching cities:', error);
      return NextResponse.json(
         { error: 'Failed to fetch cities' },
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

      const { name, country, latitude, longitude, orderIndex } = body;

      if (!name || !country || latitude === undefined || longitude === undefined) {
         return NextResponse.json(
            { error: 'Name, country, latitude, and longitude are required' },
            { status: 400 }
         );
      }

      let nextOrderIndex = orderIndex;
      if (nextOrderIndex === undefined) {
         const maxOrderResult = asType<{ max_order: number | null }>(await sql`
            SELECT MAX(order_index) as max_order
            FROM trip_cities
            WHERE trip_id = ${tripId}
         `);
         nextOrderIndex = (maxOrderResult[0]?.max_order ?? -1) + 1;
      }

      const result = asType<DbTripCity>(await sql`
         INSERT INTO trip_cities (trip_id, name, country, latitude, longitude, order_index)
         VALUES (${tripId}, ${name}, ${country}, ${latitude}, ${longitude}, ${nextOrderIndex})
         RETURNING *
      `);

      if (result.length === 0) {
         return NextResponse.json(
            { error: 'Failed to create city' },
            { status: 500 }
         );
      }

      return NextResponse.json(dbCityToCity(result[0]), { status: 201 });
   } catch (error) {
      console.error('Error creating city:', error);
      return NextResponse.json(
         { error: 'Failed to create city' },
         { status: 500 }
      );
   }
}
