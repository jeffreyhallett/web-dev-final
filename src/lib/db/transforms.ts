// Transform functions between database rows and frontend types
import type { Trip, City, Activity, Accommodation, Flight, Train, Note } from '@/types';
import type {
   DbTrip,
   DbTripCity,
   DbActivity,
   DbAccommodation,
   DbFlight,
   DbTrain,
   DbNote,
} from './types';

// Helper to extract just the date portion from a timestamp
function toDateOnly(timestamp: string | null | undefined): string {
   if (!timestamp) return '';
   return timestamp.split('T')[0];
}

// City transforms
export function dbCityToCity(dbCity: DbTripCity): City {
   return {
      id: dbCity.id,
      name: dbCity.name,
      country: dbCity.country,
      latitude: Number(dbCity.latitude),
      longitude: Number(dbCity.longitude),
   };
}

// Activity transforms
export function dbActivityToActivity(
   dbActivity: DbActivity,
   city: City | null
): Activity {
   return {
      id: dbActivity.id,
      name: dbActivity.name,
      description: dbActivity.description || '',
      location: dbActivity.location || '',
      time: dbActivity.scheduled_time || '',
      city: city || { id: '', name: '', country: '', latitude: 0, longitude: 0 },
      inTravelPlan: dbActivity.in_travel_plan,
      url: dbActivity.activity_url || undefined,
      imageUrl: dbActivity.image_url || undefined,
   };
}

// Accommodation transforms
export function dbAccommodationToAccommodation(
   dbAccommodation: DbAccommodation,
   city: City | null
): Accommodation {
   return {
      id: dbAccommodation.id,
      name: dbAccommodation.name,
      address: dbAccommodation.address || '',
      checkIn: toDateOnly(dbAccommodation.check_in),
      checkOut: toDateOnly(dbAccommodation.check_out),
      city: city || { id: '', name: '', country: '', latitude: 0, longitude: 0 },
      url: dbAccommodation.booking_url || undefined,
   };
}

// Flight transforms
export function dbFlightToFlight(dbFlight: DbFlight): Flight {
   return {
      id: dbFlight.id,
      number: dbFlight.flight_number || undefined,
      times: {
         departure: toDateOnly(dbFlight.departure_time) || undefined,
         arrival: toDateOnly(dbFlight.arrival_time) || undefined,
      },
      airline: dbFlight.airline || undefined,
      departureAirport: dbFlight.departure_airport,
      arrivalAirport: dbFlight.arrival_airport,
   };
}

// Train transforms
export function dbTrainToTrain(dbTrain: DbTrain): Train {
   return {
      id: dbTrain.id,
      number: dbTrain.train_number || undefined,
      times: {
         departure: toDateOnly(dbTrain.departure_time) || undefined,
         arrival: toDateOnly(dbTrain.arrival_time) || undefined,
      },
      operator: dbTrain.operator || undefined,
      departureStation: dbTrain.departure_station,
      arrivalStation: dbTrain.arrival_station,
   };
}

// Note transforms
export function dbNoteToNote(dbNote: DbNote): Note {
   return {
      id: dbNote.id,
      content: dbNote.content,
      date: toDateOnly(dbNote.note_date),
   };
}

// Full trip assembly
export function assembleTrip(
   dbTrip: DbTrip,
   dbCities: DbTripCity[],
   dbActivities: DbActivity[],
   dbAccommodations: DbAccommodation[],
   dbFlights: DbFlight[],
   dbTrains: DbTrain[],
   dbNotes: DbNote[]
): Trip {
   // Convert cities first (needed for activities and accommodations)
   const cities = dbCities.map(dbCityToCity);
   const cityMap = new Map(cities.map((c) => [c.id, c]));

   return {
      id: dbTrip.id,
      userId: dbTrip.user_id,
      name: dbTrip.name || undefined,
      cities,
      dates: {
         arrival: toDateOnly(dbTrip.arrival_date),
         departure: toDateOnly(dbTrip.departure_date),
      },
      activities: dbActivities.map((a) =>
         dbActivityToActivity(a, a.city_id ? cityMap.get(a.city_id) || null : null)
      ),
      accommodation: dbAccommodations.map((a) =>
         dbAccommodationToAccommodation(
            a,
            a.city_id ? cityMap.get(a.city_id) || null : null
         )
      ),
      transportation: {
         flights: dbFlights.map(dbFlightToFlight),
         trainRides: dbTrains.map(dbTrainToTrain),
      },
      notes: dbNotes.map(dbNoteToNote),
   };
}
