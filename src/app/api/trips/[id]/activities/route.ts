import { NextRequest, NextResponse } from 'next/server';
import { sql, asType } from '@/lib/db';
import type { DbActivity, DbTripCity } from '@/lib/db/types';
import { dbActivityToActivity, dbCityToCity } from '@/lib/db/transforms';

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(
   request: NextRequest,
   { params }: RouteParams
) {
   try {
      const { id: tripId } = await params;
      const { searchParams } = new URL(request.url);
      const cityId = searchParams.get('cityId');

      let activities: DbActivity[];
      if (cityId) {
         activities = asType<DbActivity>(await sql`
            SELECT * FROM activities
            WHERE trip_id = ${tripId} AND city_id = ${cityId}
            ORDER BY order_index, scheduled_time
         `);
      } else {
         activities = asType<DbActivity>(await sql`
            SELECT * FROM activities
            WHERE trip_id = ${tripId}
            ORDER BY order_index, scheduled_time
         `);
      }

      const cities = asType<DbTripCity>(await sql`
         SELECT * FROM trip_cities
         WHERE trip_id = ${tripId}
      `);
      const cityMap = new Map(cities.map((c) => [c.id, dbCityToCity(c)]));

      const result = activities.map((a) =>
         dbActivityToActivity(a, a.city_id ? cityMap.get(a.city_id) || null : null)
      );

      return NextResponse.json(result);
   } catch (error) {
      console.error('Error fetching activities:', error);
      return NextResponse.json(
         { error: 'Failed to fetch activities' },
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
         name,
         description,
         location,
         scheduledTime,
         durationMinutes,
         imageUrl,
         activityUrl,
         inTravelPlan,
         cityId,
         orderIndex,
      } = body;

      if (!name) {
         return NextResponse.json(
            { error: 'Name is required' },
            { status: 400 }
         );
      }

      let nextOrderIndex = orderIndex;
      if (nextOrderIndex === undefined) {
         const maxOrderResult = asType<{ max_order: number | null }>(await sql`
            SELECT MAX(order_index) as max_order
            FROM activities
            WHERE trip_id = ${tripId}
         `);
         nextOrderIndex = (maxOrderResult[0]?.max_order ?? -1) + 1;
      }

      const result = asType<DbActivity>(await sql`
         INSERT INTO activities (
            trip_id,
            city_id,
            name,
            description,
            location,
            scheduled_time,
            duration_minutes,
            image_url,
            activity_url,
            in_travel_plan,
            order_index
         )
         VALUES (
            ${tripId},
            ${cityId || null},
            ${name},
            ${description || null},
            ${location || null},
            ${scheduledTime || null},
            ${durationMinutes || null},
            ${imageUrl || null},
            ${activityUrl || null},
            ${inTravelPlan || false},
            ${nextOrderIndex}
         )
         RETURNING *
      `);

      if (result.length === 0) {
         return NextResponse.json(
            { error: 'Failed to create activity' },
            { status: 500 }
         );
      }

      let city = null;
      if (result[0].city_id) {
         const cities = asType<DbTripCity>(await sql`
            SELECT * FROM trip_cities WHERE id = ${result[0].city_id}
         `);
         if (cities.length > 0) {
            city = dbCityToCity(cities[0]);
         }
      }

      return NextResponse.json(dbActivityToActivity(result[0], city), {
         status: 201,
      });
   } catch (error) {
      console.error('Error creating activity:', error);
      return NextResponse.json(
         { error: 'Failed to create activity' },
         { status: 500 }
      );
   }
}
