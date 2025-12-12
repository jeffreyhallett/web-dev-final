import { NextRequest, NextResponse } from 'next/server';
import { sql, asType } from '@/lib/db';
import type { DbTripCity } from '@/lib/db/types';
import { dbCityToCity } from '@/lib/db/transforms';

type RouteParams = { params: Promise<{ id: string; cityId: string }> };

export async function GET(
   request: NextRequest,
   { params }: RouteParams
) {
   try {
      const { id: tripId, cityId } = await params;

      const cities = asType<DbTripCity>(await sql`
         SELECT * FROM trip_cities
         WHERE id = ${cityId} AND trip_id = ${tripId}
      `);

      if (cities.length === 0) {
         return NextResponse.json({ error: 'City not found' }, { status: 404 });
      }

      return NextResponse.json(dbCityToCity(cities[0]));
   } catch (error) {
      console.error('Error fetching city:', error);
      return NextResponse.json(
         { error: 'Failed to fetch city' },
         { status: 500 }
      );
   }
}

export async function PUT(
   request: NextRequest,
   { params }: RouteParams
) {
   try {
      const { id: tripId, cityId } = await params;
      const body = await request.json();

      const { name, country, latitude, longitude, orderIndex } = body;

      const result = asType<DbTripCity>(await sql`
         UPDATE trip_cities
         SET
            name = COALESCE(${name}, name),
            country = COALESCE(${country}, country),
            latitude = COALESCE(${latitude}, latitude),
            longitude = COALESCE(${longitude}, longitude),
            order_index = COALESCE(${orderIndex}, order_index)
         WHERE id = ${cityId} AND trip_id = ${tripId}
         RETURNING *
      `);

      if (result.length === 0) {
         return NextResponse.json({ error: 'City not found' }, { status: 404 });
      }

      return NextResponse.json(dbCityToCity(result[0]));
   } catch (error) {
      console.error('Error updating city:', error);
      return NextResponse.json(
         { error: 'Failed to update city' },
         { status: 500 }
      );
   }
}

export async function DELETE(
   request: NextRequest,
   { params }: RouteParams
) {
   try {
      const { id: tripId, cityId } = await params;

      const result = asType<DbTripCity>(await sql`
         DELETE FROM trip_cities
         WHERE id = ${cityId} AND trip_id = ${tripId}
         RETURNING *
      `);

      if (result.length === 0) {
         return NextResponse.json({ error: 'City not found' }, { status: 404 });
      }

      return NextResponse.json({ success: true, deletedId: cityId });
   } catch (error) {
      console.error('Error deleting city:', error);
      return NextResponse.json(
         { error: 'Failed to delete city' },
         { status: 500 }
      );
   }
}
