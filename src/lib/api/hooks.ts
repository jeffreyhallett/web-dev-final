'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Trip, City, Activity, Accommodation, Flight, Train, Note } from '@/types';
import {
   tripsApi,
   citiesApi,
   activitiesApi,
   accommodationsApi,
   flightsApi,
   trainsApi,
   notesApi,
   recommendationsApi,
   RecommendationsResponse,
   setApiUserEmail,
} from './client';
import { useUser } from '@/lib/context/UserContext';

interface UseQueryResult<T> {
   data: T | null;
   isLoading: boolean;
   error: Error | null;
   refetch: () => Promise<void>;
}

interface UseMutationResult<TData, TVariables> {
   mutate: (variables: TVariables) => Promise<TData>;
   isLoading: boolean;
   error: Error | null;
}

export function useTrips(): UseQueryResult<Trip[]> {
   const { email } = useUser();
   const [data, setData] = useState<Trip[] | null>(null);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState<Error | null>(null);

   const fetchData = useCallback(async () => {
      setIsLoading(true);
      setError(null);
      setApiUserEmail(email);
      try {
         const trips = await tripsApi.list();
         setData(trips);
      } catch (err) {
         setError(err instanceof Error ? err : new Error('Failed to fetch trips'));
      } finally {
         setIsLoading(false);
      }
   }, [email]);

   useEffect(() => {
      fetchData();
   }, [fetchData]);

   return { data, isLoading, error, refetch: fetchData };
}

export function useTrip(tripId: string | null): UseQueryResult<Trip> {
   const [data, setData] = useState<Trip | null>(null);
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<Error | null>(null);

   const fetchData = useCallback(async () => {
      if (!tripId) {
         setData(null);
         return;
      }
      setIsLoading(true);
      setError(null);
      try {
         const trip = await tripsApi.get(tripId);
         setData(trip);
      } catch (err) {
         setError(err instanceof Error ? err : new Error('Failed to fetch trip'));
      } finally {
         setIsLoading(false);
      }
   }, [tripId]);

   useEffect(() => {
      fetchData();
   }, [fetchData]);

   return { data, isLoading, error, refetch: fetchData };
}

export function useCreateTrip(): UseMutationResult<Trip, Parameters<typeof tripsApi.create>[0]> {
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<Error | null>(null);

   const mutate = async (variables: Parameters<typeof tripsApi.create>[0]) => {
      setIsLoading(true);
      setError(null);
      try {
         const result = await tripsApi.create(variables);
         return result;
      } catch (err) {
         const error = err instanceof Error ? err : new Error('Failed to create trip');
         setError(error);
         throw error;
      } finally {
         setIsLoading(false);
      }
   };

   return { mutate, isLoading, error };
}

export function useUpdateTrip(): UseMutationResult<Trip, { id: string; data: Parameters<typeof tripsApi.update>[1] }> {
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<Error | null>(null);

   const mutate = async ({ id, data }: { id: string; data: Parameters<typeof tripsApi.update>[1] }) => {
      setIsLoading(true);
      setError(null);
      try {
         const result = await tripsApi.update(id, data);
         return result;
      } catch (err) {
         const error = err instanceof Error ? err : new Error('Failed to update trip');
         setError(error);
         throw error;
      } finally {
         setIsLoading(false);
      }
   };

   return { mutate, isLoading, error };
}

export function useDeleteTrip(): UseMutationResult<{ success: boolean; deletedId: string }, string> {
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<Error | null>(null);

   const mutate = async (id: string) => {
      setIsLoading(true);
      setError(null);
      try {
         const result = await tripsApi.delete(id);
         return result;
      } catch (err) {
         const error = err instanceof Error ? err : new Error('Failed to delete trip');
         setError(error);
         throw error;
      } finally {
         setIsLoading(false);
      }
   };

   return { mutate, isLoading, error };
}

export function useCreateCity(): UseMutationResult<City, { tripId: string; data: Parameters<typeof citiesApi.create>[1] }> {
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<Error | null>(null);

   const mutate = async ({ tripId, data }: { tripId: string; data: Parameters<typeof citiesApi.create>[1] }) => {
      setIsLoading(true);
      setError(null);
      try {
         const result = await citiesApi.create(tripId, data);
         return result;
      } catch (err) {
         const error = err instanceof Error ? err : new Error('Failed to create city');
         setError(error);
         throw error;
      } finally {
         setIsLoading(false);
      }
   };

   return { mutate, isLoading, error };
}

export function useDeleteCity(): UseMutationResult<{ success: boolean; deletedId: string }, { tripId: string; cityId: string }> {
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<Error | null>(null);

   const mutate = async ({ tripId, cityId }: { tripId: string; cityId: string }) => {
      setIsLoading(true);
      setError(null);
      try {
         const result = await citiesApi.delete(tripId, cityId);
         return result;
      } catch (err) {
         const error = err instanceof Error ? err : new Error('Failed to delete city');
         setError(error);
         throw error;
      } finally {
         setIsLoading(false);
      }
   };

   return { mutate, isLoading, error };
}

export function useCreateActivity(): UseMutationResult<Activity, { tripId: string; data: Parameters<typeof activitiesApi.create>[1] }> {
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<Error | null>(null);

   const mutate = async ({ tripId, data }: { tripId: string; data: Parameters<typeof activitiesApi.create>[1] }) => {
      setIsLoading(true);
      setError(null);
      try {
         const result = await activitiesApi.create(tripId, data);
         return result;
      } catch (err) {
         const error = err instanceof Error ? err : new Error('Failed to create activity');
         setError(error);
         throw error;
      } finally {
         setIsLoading(false);
      }
   };

   return { mutate, isLoading, error };
}

export function useUpdateActivity(): UseMutationResult<Activity, { tripId: string; activityId: string; data: Parameters<typeof activitiesApi.update>[2] }> {
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<Error | null>(null);

   const mutate = async ({ tripId, activityId, data }: { tripId: string; activityId: string; data: Parameters<typeof activitiesApi.update>[2] }) => {
      setIsLoading(true);
      setError(null);
      try {
         const result = await activitiesApi.update(tripId, activityId, data);
         return result;
      } catch (err) {
         const error = err instanceof Error ? err : new Error('Failed to update activity');
         setError(error);
         throw error;
      } finally {
         setIsLoading(false);
      }
   };

   return { mutate, isLoading, error };
}

export function useDeleteActivity(): UseMutationResult<{ success: boolean; deletedId: string }, { tripId: string; activityId: string }> {
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<Error | null>(null);

   const mutate = async ({ tripId, activityId }: { tripId: string; activityId: string }) => {
      setIsLoading(true);
      setError(null);
      try {
         const result = await activitiesApi.delete(tripId, activityId);
         return result;
      } catch (err) {
         const error = err instanceof Error ? err : new Error('Failed to delete activity');
         setError(error);
         throw error;
      } finally {
         setIsLoading(false);
      }
   };

   return { mutate, isLoading, error };
}

export function useCreateAccommodation(): UseMutationResult<Accommodation, { tripId: string; data: Parameters<typeof accommodationsApi.create>[1] }> {
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<Error | null>(null);

   const mutate = async ({ tripId, data }: { tripId: string; data: Parameters<typeof accommodationsApi.create>[1] }) => {
      setIsLoading(true);
      setError(null);
      try {
         const result = await accommodationsApi.create(tripId, data);
         return result;
      } catch (err) {
         const error = err instanceof Error ? err : new Error('Failed to create accommodation');
         setError(error);
         throw error;
      } finally {
         setIsLoading(false);
      }
   };

   return { mutate, isLoading, error };
}

export function useUpdateAccommodation(): UseMutationResult<Accommodation, { tripId: string; accommodationId: string; data: Parameters<typeof accommodationsApi.update>[2] }> {
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<Error | null>(null);

   const mutate = async ({ tripId, accommodationId, data }: { tripId: string; accommodationId: string; data: Parameters<typeof accommodationsApi.update>[2] }) => {
      setIsLoading(true);
      setError(null);
      try {
         const result = await accommodationsApi.update(tripId, accommodationId, data);
         return result;
      } catch (err) {
         const error = err instanceof Error ? err : new Error('Failed to update accommodation');
         setError(error);
         throw error;
      } finally {
         setIsLoading(false);
      }
   };

   return { mutate, isLoading, error };
}

export function useDeleteAccommodation(): UseMutationResult<{ success: boolean; deletedId: string }, { tripId: string; accommodationId: string }> {
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<Error | null>(null);

   const mutate = async ({ tripId, accommodationId }: { tripId: string; accommodationId: string }) => {
      setIsLoading(true);
      setError(null);
      try {
         const result = await accommodationsApi.delete(tripId, accommodationId);
         return result;
      } catch (err) {
         const error = err instanceof Error ? err : new Error('Failed to delete accommodation');
         setError(error);
         throw error;
      } finally {
         setIsLoading(false);
      }
   };

   return { mutate, isLoading, error };
}

export function useCreateNote(): UseMutationResult<Note, { tripId: string; data: Parameters<typeof notesApi.create>[1] }> {
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<Error | null>(null);

   const mutate = async ({ tripId, data }: { tripId: string; data: Parameters<typeof notesApi.create>[1] }) => {
      setIsLoading(true);
      setError(null);
      try {
         const result = await notesApi.create(tripId, data);
         return result;
      } catch (err) {
         const error = err instanceof Error ? err : new Error('Failed to create note');
         setError(error);
         throw error;
      } finally {
         setIsLoading(false);
      }
   };

   return { mutate, isLoading, error };
}

export function useUpdateNote(): UseMutationResult<Note, { tripId: string; noteId: string; data: Parameters<typeof notesApi.update>[2] }> {
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<Error | null>(null);

   const mutate = async ({ tripId, noteId, data }: { tripId: string; noteId: string; data: Parameters<typeof notesApi.update>[2] }) => {
      setIsLoading(true);
      setError(null);
      try {
         const result = await notesApi.update(tripId, noteId, data);
         return result;
      } catch (err) {
         const error = err instanceof Error ? err : new Error('Failed to update note');
         setError(error);
         throw error;
      } finally {
         setIsLoading(false);
      }
   };

   return { mutate, isLoading, error };
}

export function useDeleteNote(): UseMutationResult<{ success: boolean; deletedId: string }, { tripId: string; noteId: string }> {
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<Error | null>(null);

   const mutate = async ({ tripId, noteId }: { tripId: string; noteId: string }) => {
      setIsLoading(true);
      setError(null);
      try {
         const result = await notesApi.delete(tripId, noteId);
         return result;
      } catch (err) {
         const error = err instanceof Error ? err : new Error('Failed to delete note');
         setError(error);
         throw error;
      } finally {
         setIsLoading(false);
      }
   };

   return { mutate, isLoading, error };
}

export function useCreateFlight(): UseMutationResult<Flight, { tripId: string; data: Parameters<typeof flightsApi.create>[1] }> {
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<Error | null>(null);

   const mutate = async ({ tripId, data }: { tripId: string; data: Parameters<typeof flightsApi.create>[1] }) => {
      setIsLoading(true);
      setError(null);
      try {
         const result = await flightsApi.create(tripId, data);
         return result;
      } catch (err) {
         const error = err instanceof Error ? err : new Error('Failed to create flight');
         setError(error);
         throw error;
      } finally {
         setIsLoading(false);
      }
   };

   return { mutate, isLoading, error };
}

export function useUpdateFlight(): UseMutationResult<Flight, { tripId: string; flightId: string; data: Parameters<typeof flightsApi.update>[2] }> {
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<Error | null>(null);

   const mutate = async ({ tripId, flightId, data }: { tripId: string; flightId: string; data: Parameters<typeof flightsApi.update>[2] }) => {
      setIsLoading(true);
      setError(null);
      try {
         const result = await flightsApi.update(tripId, flightId, data);
         return result;
      } catch (err) {
         const error = err instanceof Error ? err : new Error('Failed to update flight');
         setError(error);
         throw error;
      } finally {
         setIsLoading(false);
      }
   };

   return { mutate, isLoading, error };
}

export function useDeleteFlight(): UseMutationResult<{ success: boolean; deletedId: string }, { tripId: string; flightId: string }> {
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<Error | null>(null);

   const mutate = async ({ tripId, flightId }: { tripId: string; flightId: string }) => {
      setIsLoading(true);
      setError(null);
      try {
         const result = await flightsApi.delete(tripId, flightId);
         return result;
      } catch (err) {
         const error = err instanceof Error ? err : new Error('Failed to delete flight');
         setError(error);
         throw error;
      } finally {
         setIsLoading(false);
      }
   };

   return { mutate, isLoading, error };
}

export function useCreateTrain(): UseMutationResult<Train, { tripId: string; data: Parameters<typeof trainsApi.create>[1] }> {
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<Error | null>(null);

   const mutate = async ({ tripId, data }: { tripId: string; data: Parameters<typeof trainsApi.create>[1] }) => {
      setIsLoading(true);
      setError(null);
      try {
         const result = await trainsApi.create(tripId, data);
         return result;
      } catch (err) {
         const error = err instanceof Error ? err : new Error('Failed to create train');
         setError(error);
         throw error;
      } finally {
         setIsLoading(false);
      }
   };

   return { mutate, isLoading, error };
}

export function useUpdateTrain(): UseMutationResult<Train, { tripId: string; trainId: string; data: Parameters<typeof trainsApi.update>[2] }> {
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<Error | null>(null);

   const mutate = async ({ tripId, trainId, data }: { tripId: string; trainId: string; data: Parameters<typeof trainsApi.update>[2] }) => {
      setIsLoading(true);
      setError(null);
      try {
         const result = await trainsApi.update(tripId, trainId, data);
         return result;
      } catch (err) {
         const error = err instanceof Error ? err : new Error('Failed to update train');
         setError(error);
         throw error;
      } finally {
         setIsLoading(false);
      }
   };

   return { mutate, isLoading, error };
}

export function useDeleteTrain(): UseMutationResult<{ success: boolean; deletedId: string }, { tripId: string; trainId: string }> {
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<Error | null>(null);

   const mutate = async ({ tripId, trainId }: { tripId: string; trainId: string }) => {
      setIsLoading(true);
      setError(null);
      try {
         const result = await trainsApi.delete(tripId, trainId);
         return result;
      } catch (err) {
         const error = err instanceof Error ? err : new Error('Failed to delete train');
         setError(error);
         throw error;
      } finally {
         setIsLoading(false);
      }
   };

   return { mutate, isLoading, error };
}

export function useRecommendations(
   city: string | null,
   country: string | null,
   existingActivities: string[]
): UseQueryResult<RecommendationsResponse> & { fetch: () => Promise<void> } {
   const [data, setData] = useState<RecommendationsResponse | null>(null);
   const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState<Error | null>(null);

   const fetchData = useCallback(async () => {
      if (!city || !country) {
         setData(null);
         return;
      }
      setIsLoading(true);
      setError(null);
      try {
         const recommendations = await recommendationsApi.get({
            city,
            country,
            existingActivities,
         });
         setData(recommendations);
      } catch (err) {
         setError(err instanceof Error ? err : new Error('Failed to fetch recommendations'));
      } finally {
         setIsLoading(false);
      }
   }, [city, country, existingActivities]);

   return { data, isLoading, error, refetch: fetchData, fetch: fetchData };
}
