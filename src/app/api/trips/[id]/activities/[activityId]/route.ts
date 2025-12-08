import { NextRequest, NextResponse } from 'next/server';
import { sql, asType } from '@/lib/db';
import type { DbActivity, DbTripCity } from '@/lib/db/types';
import { dbActivityToActivity, dbCityToCity } from '@/lib/db/transforms';

type RouteParams = { params: Promise<{ id: string; activityId: string }> };

// Helper to get activity with city
async function getActivityWithCity(tripId: string, activityId: string) {
   const activities = asType<DbActivity>(await sql`
      SELECT * FROM activities
      WHERE id = ${activityId} AND trip_id = ${tripId}
   `);

   if (activities.length === 0) {
      return null;
   }

   const activity = activities[0];
   let city = null;

   if (activity.city_id) {
      const cities = asType<DbTripCity>(await sql`
         SELECT * FROM trip_cities WHERE id = ${activity.city_id}
      `);
      if (cities.length > 0) {
         city = dbCityToCity(cities[0]);
      }
   }

   return dbActivityToActivity(activity, city);
}

// GET /api/trips/[id]/activities/[activityId] - Get a single activity
export async function GET(
   request: NextRequest,
   { params }: RouteParams
) {
   try {
      const { id: tripId, activityId } = await params;

      const activity = await getActivityWithCity(tripId, activityId);

      if (!activity) {
         return NextResponse.json(
            { error: 'Activity not found' },
            { status: 404 }
         );
      }

      return NextResponse.json(activity);
   } catch (error) {
      console.error('Error fetching activity:', error);
      return NextResponse.json(
         { error: 'Failed to fetch activity' },
         { status: 500 }
      );
   }
}

// PUT /api/trips/[id]/activities/[activityId] - Update an activity
export async function PUT(
   request: NextRequest,
   { params }: RouteParams
) {
   try {
      const { id: tripId, activityId } = await params;
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

      const result = asType<DbActivity>(await sql`
         UPDATE activities
         SET
            name = COALESCE(${name}, name),
            description = COALESCE(${description}, description),
            location = COALESCE(${location}, location),
            scheduled_time = COALESCE(${scheduledTime}, scheduled_time),
            duration_minutes = COALESCE(${durationMinutes}, duration_minutes),
            image_url = COALESCE(${imageUrl}, image_url),
            activity_url = COALESCE(${activityUrl}, activity_url),
            in_travel_plan = COALESCE(${inTravelPlan}, in_travel_plan),
            city_id = COALESCE(${cityId}, city_id),
            order_index = COALESCE(${orderIndex}, order_index)
         WHERE id = ${activityId} AND trip_id = ${tripId}
         RETURNING *
      `);

      if (result.length === 0) {
         return NextResponse.json(
            { error: 'Activity not found' },
            { status: 404 }
         );
      }

      const activity = result[0];
      let city = null;

      if (activity.city_id) {
         const cities = asType<DbTripCity>(await sql`
            SELECT * FROM trip_cities WHERE id = ${activity.city_id}
         `);
         if (cities.length > 0) {
            city = dbCityToCity(cities[0]);
         }
      }

      return NextResponse.json(dbActivityToActivity(activity, city));
   } catch (error) {
      console.error('Error updating activity:', error);
      return NextResponse.json(
         { error: 'Failed to update activity' },
         { status: 500 }
      );
   }
}

// DELETE /api/trips/[id]/activities/[activityId] - Delete an activity
export async function DELETE(
   request: NextRequest,
   { params }: RouteParams
) {
   try {
      const { id: tripId, activityId } = await params;

      const result = asType<DbActivity>(await sql`
         DELETE FROM activities
         WHERE id = ${activityId} AND trip_id = ${tripId}
         RETURNING *
      `);

      if (result.length === 0) {
         return NextResponse.json(
            { error: 'Activity not found' },
            { status: 404 }
         );
      }

      return NextResponse.json({ success: true, deletedId: activityId });
   } catch (error) {
      console.error('Error deleting activity:', error);
      return NextResponse.json(
         { error: 'Failed to delete activity' },
         { status: 500 }
      );
   }
}
