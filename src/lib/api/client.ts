import type { Trip, City, Activity, Accommodation, Flight, Train, Note } from '@/types';

const API_BASE = '/api';

let currentUserEmail = 'default@example.com';

export function setApiUserEmail(email: string) {
   currentUserEmail = email;
}

export function getApiUserEmail() {
   return currentUserEmail;
}

async function fetchApi<T>(
   endpoint: string,
   options?: RequestInit
): Promise<T> {
   const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
         'Content-Type': 'application/json',
         'x-user-email': currentUserEmail,
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
      confirmationNumber?: string;
      notes?: string;
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
      confirmationNumber: string;
      notes: string;
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

export interface RecommendedActivity {
   name: string;
   description: string;
   location: string;
   category: 'sightseeing' | 'food' | 'culture' | 'nature' | 'entertainment' | 'shopping' | 'nightlife';
   estimatedDuration?: string;
   tip?: string;
}

export interface RecommendationsResponse {
   recommendations: RecommendedActivity[];
   city: string;
   country: string;
}

export const recommendationsApi = {
   get: (data: { city: string; country: string; existingActivities?: string[] }) =>
      fetchApi<RecommendationsResponse>('/recommendations', {
         method: 'POST',
         body: JSON.stringify(data),
      }),
};
