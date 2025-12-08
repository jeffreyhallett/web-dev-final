// API Client for Trip Planner
import type { Trip, City, Activity, Accommodation, Flight, Train, Note } from '@/types';

const API_BASE = '/api';

// Generic fetch helper with error handling
async function fetchApi<T>(
   endpoint: string,
   options?: RequestInit
): Promise<T> {
   const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
         'Content-Type': 'application/json',
         ...options?.headers,
      },
      ...options,
   });

   if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || `HTTP ${response.status}`);
   }

   return response.json();
}

// ============ Trips ============
export const tripsApi = {
   list: () => fetchApi<Trip[]>('/trips'),

   get: (id: string) => fetchApi<Trip>(`/trips/${id}`),

   create: (data: { name?: string; arrivalDate?: string; departureDate?: string }) =>
      fetchApi<Trip>('/trips', {
         method: 'POST',
         body: JSON.stringify(data),
      }),

   update: (id: string, data: Partial<{ name: string; arrivalDate: string; departureDate: string }>) =>
      fetchApi<Trip>(`/trips/${id}`, {
         method: 'PUT',
         body: JSON.stringify(data),
      }),

   delete: (id: string) =>
      fetchApi<{ success: boolean; deletedId: string }>(`/trips/${id}`, {
         method: 'DELETE',
      }),
};

// ============ Cities ============
export const citiesApi = {
   list: (tripId: string) => fetchApi<City[]>(`/trips/${tripId}/cities`),

   get: (tripId: string, cityId: string) =>
      fetchApi<City>(`/trips/${tripId}/cities/${cityId}`),

   create: (tripId: string, data: { name: string; country: string; latitude?: number; longitude?: number }) =>
      fetchApi<City>(`/trips/${tripId}/cities`, {
         method: 'POST',
         body: JSON.stringify(data),
      }),

   update: (tripId: string, cityId: string, data: Partial<{ name: string; country: string; latitude: number; longitude: number }>) =>
      fetchApi<City>(`/trips/${tripId}/cities/${cityId}`, {
         method: 'PUT',
         body: JSON.stringify(data),
      }),

   delete: (tripId: string, cityId: string) =>
      fetchApi<{ success: boolean; deletedId: string }>(`/trips/${tripId}/cities/${cityId}`, {
         method: 'DELETE',
      }),
};

// ============ Activities ============
export const activitiesApi = {
   list: (tripId: string) => fetchApi<Activity[]>(`/trips/${tripId}/activities`),

   get: (tripId: string, activityId: string) =>
      fetchApi<Activity>(`/trips/${tripId}/activities/${activityId}`),

   create: (tripId: string, data: {
      name: string;
      cityId: string;
      description?: string;
      location?: string;
      scheduledTime?: string;
      inTravelPlan?: boolean;
      activityUrl?: string;
      imageUrl?: string;
   }) =>
      fetchApi<Activity>(`/trips/${tripId}/activities`, {
         method: 'POST',
         body: JSON.stringify(data),
      }),

   update: (tripId: string, activityId: string, data: Partial<{
      name: string;
      cityId: string;
      description: string;
      location: string;
      scheduledTime: string;
      inTravelPlan: boolean;
      activityUrl: string;
      imageUrl: string;
   }>) =>
      fetchApi<Activity>(`/trips/${tripId}/activities/${activityId}`, {
         method: 'PUT',
         body: JSON.stringify(data),
      }),

   delete: (tripId: string, activityId: string) =>
      fetchApi<{ success: boolean; deletedId: string }>(`/trips/${tripId}/activities/${activityId}`, {
         method: 'DELETE',
      }),
};

// ============ Accommodations ============
export const accommodationsApi = {
   list: (tripId: string) => fetchApi<Accommodation[]>(`/trips/${tripId}/accommodations`),

   get: (tripId: string, accommodationId: string) =>
      fetchApi<Accommodation>(`/trips/${tripId}/accommodations/${accommodationId}`),

   create: (tripId: string, data: {
      name: string;
      cityId: string;
      address?: string;
      checkIn?: string;
      checkOut?: string;
      bookingUrl?: string;
   }) =>
      fetchApi<Accommodation>(`/trips/${tripId}/accommodations`, {
         method: 'POST',
         body: JSON.stringify(data),
      }),

   update: (tripId: string, accommodationId: string, data: Partial<{
      name: string;
      cityId: string;
      address: string;
      checkIn: string;
      checkOut: string;
      bookingUrl: string;
   }>) =>
      fetchApi<Accommodation>(`/trips/${tripId}/accommodations/${accommodationId}`, {
         method: 'PUT',
         body: JSON.stringify(data),
      }),

   delete: (tripId: string, accommodationId: string) =>
      fetchApi<{ success: boolean; deletedId: string }>(`/trips/${tripId}/accommodations/${accommodationId}`, {
         method: 'DELETE',
      }),
};

// ============ Flights ============
export const flightsApi = {
   list: (tripId: string) => fetchApi<Flight[]>(`/trips/${tripId}/flights`),

   get: (tripId: string, flightId: string) =>
      fetchApi<Flight>(`/trips/${tripId}/flights/${flightId}`),

   create: (tripId: string, data: {
      departureAirport: string;
      arrivalAirport: string;
      flightNumber?: string;
      airline?: string;
      departureTime?: string;
      arrivalTime?: string;
      confirmationNumber?: string;
      bookingUrl?: string;
      notes?: string;
   }) =>
      fetchApi<Flight>(`/trips/${tripId}/flights`, {
         method: 'POST',
         body: JSON.stringify(data),
      }),

   update: (tripId: string, flightId: string, data: Partial<{
      departureAirport: string;
      arrivalAirport: string;
      flightNumber: string;
      airline: string;
      departureTime: string;
      arrivalTime: string;
      confirmationNumber: string;
      bookingUrl: string;
      notes: string;
   }>) =>
      fetchApi<Flight>(`/trips/${tripId}/flights/${flightId}`, {
         method: 'PUT',
         body: JSON.stringify(data),
      }),

   delete: (tripId: string, flightId: string) =>
      fetchApi<{ success: boolean; deletedId: string }>(`/trips/${tripId}/flights/${flightId}`, {
         method: 'DELETE',
      }),
};

// ============ Trains ============
export const trainsApi = {
   list: (tripId: string) => fetchApi<Train[]>(`/trips/${tripId}/trains`),

   get: (tripId: string, trainId: string) =>
      fetchApi<Train>(`/trips/${tripId}/trains/${trainId}`),

   create: (tripId: string, data: {
      departureStation: string;
      arrivalStation: string;
      trainNumber?: string;
      operator?: string;
      departureTime?: string;
      arrivalTime?: string;
      confirmationNumber?: string;
      bookingUrl?: string;
      seatInfo?: string;
      notes?: string;
   }) =>
      fetchApi<Train>(`/trips/${tripId}/trains`, {
         method: 'POST',
         body: JSON.stringify(data),
      }),

   update: (tripId: string, trainId: string, data: Partial<{
      departureStation: string;
      arrivalStation: string;
      trainNumber: string;
      operator: string;
      departureTime: string;
      arrivalTime: string;
      confirmationNumber: string;
      bookingUrl: string;
      seatInfo: string;
      notes: string;
   }>) =>
      fetchApi<Train>(`/trips/${tripId}/trains/${trainId}`, {
         method: 'PUT',
         body: JSON.stringify(data),
      }),

   delete: (tripId: string, trainId: string) =>
      fetchApi<{ success: boolean; deletedId: string }>(`/trips/${tripId}/trains/${trainId}`, {
         method: 'DELETE',
      }),
};

// ============ Notes ============
export const notesApi = {
   list: (tripId: string) => fetchApi<Note[]>(`/trips/${tripId}/notes`),

   get: (tripId: string, noteId: string) =>
      fetchApi<Note>(`/trips/${tripId}/notes/${noteId}`),

   create: (tripId: string, data: { content: string; noteDate?: string }) =>
      fetchApi<Note>(`/trips/${tripId}/notes`, {
         method: 'POST',
         body: JSON.stringify(data),
      }),

   update: (tripId: string, noteId: string, data: Partial<{ content: string; noteDate: string }>) =>
      fetchApi<Note>(`/trips/${tripId}/notes/${noteId}`, {
         method: 'PUT',
         body: JSON.stringify(data),
      }),

   delete: (tripId: string, noteId: string) =>
      fetchApi<{ success: boolean; deletedId: string }>(`/trips/${tripId}/notes/${noteId}`, {
         method: 'DELETE',
      }),
};
