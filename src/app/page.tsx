'use client';

import TripList from '@/components/trip/tripList';
import { Trip, City, Activity } from '@/types';
import { useState, useCallback } from 'react';
import TripView from '@/components/city/tripView';
import Header from '@/components/layout/header';
import { TrashIcon } from '@heroicons/react/24/outline';
import {
   useTrips,
   useTrip,
   useCreateTrip,
   useDeleteTrip,
   useCreateCity,
   useUpdateAccommodation,
   useCreateAccommodation,
   useUpdateNote,
   useCreateNote,
} from '@/lib/api';

export default function HomePage() {
   const [view, setView] = useState<'list' | 'map'>('list');
   const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
   const [selectedCityId, setSelectedCityId] = useState<string | null>(null);

   // Fetch trips from API
   const { data: trips, isLoading: tripsLoading, error: tripsError, refetch: refetchTrips } = useTrips();

   // Fetch selected trip details
   const { data: selectedTrip, refetch: refetchTrip } = useTrip(selectedTripId);

   // Mutations
   const { mutate: createTrip } = useCreateTrip();
   const { mutate: deleteTrip } = useDeleteTrip();
   const { mutate: createCity } = useCreateCity();
   const { mutate: createAccommodation } = useCreateAccommodation();
   const { mutate: updateAccommodation } = useUpdateAccommodation();
   const { mutate: createNote } = useCreateNote();
   const { mutate: updateNote } = useUpdateNote();

   // Derived values
   const selectedCity = selectedTrip?.cities.find(c => c.id === selectedCityId);

   // Handler to select a trip
   const handleSelectTrip = useCallback((tripId: string) => {
      setSelectedTripId(tripId);
   }, []);

   // Handler to add a city to the current trip
   const handleAddCity = useCallback(async (city: City) => {
      if (!selectedTripId) return;

      try {
         await createCity({
            tripId: selectedTripId,
            data: {
               name: city.name,
               country: city.country,
               latitude: city.latitude,
               longitude: city.longitude,
            },
         });
         await refetchTrip();
      } catch (error) {
         console.error('Failed to add city:', error);
      }
   }, [selectedTripId, createCity, refetchTrip]);

   // Handler to update activities within a trip
   const handleUpdateActivities = useCallback((newActivities: Activity[]) => {
      // Activities are managed through individual API calls in TripView
      // This handler is kept for component compatibility
      refetchTrip();
   }, [refetchTrip]);

   // Handler to update trip (partial updates - for accommodation and notes)
   const handleUpdateTrip = useCallback(async (updates: Partial<Trip>) => {
      if (!selectedTripId || !selectedTrip) return;

      try {
         // Handle accommodation updates
         if (updates.accommodation) {
            for (const acc of updates.accommodation) {
               if (acc.id && !acc.id.startsWith('temp-')) {
                  // Update existing accommodation
                  await updateAccommodation({
                     tripId: selectedTripId,
                     accommodationId: acc.id,
                     data: {
                        name: acc.name,
                        address: acc.address,
                        checkIn: acc.checkIn,
                        checkOut: acc.checkOut,
                        cityId: acc.city.id,
                        bookingUrl: acc.url,
                     },
                  });
               } else if (acc.name) {
                  // Create new accommodation
                  await createAccommodation({
                     tripId: selectedTripId,
                     data: {
                        name: acc.name,
                        cityId: acc.city.id,
                        address: acc.address,
                        checkIn: acc.checkIn,
                        checkOut: acc.checkOut,
                        bookingUrl: acc.url,
                     },
                  });
               }
            }
         }

         // Handle notes updates
         if (updates.notes) {
            for (const note of updates.notes) {
               if (note.id && !note.id.startsWith('temp-')) {
                  // Update existing note
                  await updateNote({
                     tripId: selectedTripId,
                     noteId: note.id,
                     data: {
                        content: note.content,
                        noteDate: note.date,
                     },
                  });
               } else if (note.content) {
                  // Create new note
                  await createNote({
                     tripId: selectedTripId,
                     data: {
                        content: note.content,
                        noteDate: note.date,
                     },
                  });
               }
            }
         }

         await refetchTrip();
      } catch (error) {
         console.error('Failed to update trip:', error);
      }
   }, [selectedTripId, selectedTrip, updateAccommodation, createAccommodation, updateNote, createNote, refetchTrip]);

   // Handler to delete trip
   const handleDeleteTrip = useCallback(async () => {
      if (!selectedTripId) return;

      const confirmed = window.confirm('Are you sure you want to delete this trip?');
      if (!confirmed) return;

      try {
         await deleteTrip(selectedTripId);
         setSelectedTripId(null);
         setSelectedCityId(null);
         await refetchTrips();
      } catch (error) {
         console.error('Failed to delete trip:', error);
      }
   }, [selectedTripId, deleteTrip, refetchTrips]);

   // Handler to create a new trip
   const handleCreateTrip = useCallback(async () => {
      try {
         const newTrip = await createTrip({ name: 'New Trip' });
         await refetchTrips();
         setSelectedTripId(newTrip.id);
      } catch (error) {
         console.error('Failed to create trip:', error);
      }
   }, [createTrip, refetchTrips]);

   // Loading state
   if (tripsLoading) {
      return (
         <div className="flex items-center justify-center h-screen">
            <div className="text-gray-500">Loading trips...</div>
         </div>
      );
   }

   // Error state
   if (tripsError) {
      return (
         <div className="flex items-center justify-center h-screen">
            <div className="text-red-500">Error loading trips: {tripsError.message}</div>
         </div>
      );
   }

   const tripsList = trips || [];

   return (
      <div className="flex flex-col h-screen">
         <Header view={view} onViewChange={setView} />
         <div className="flex flex-1 overflow-hidden">
            <aside className="w-64 flex flex-col">
               <div className="px-4 py-6 flex-1">
                  <TripList
                     trips={tripsList}
                     selectedTripId={selectedTripId}
                     selectedCityId={selectedCityId}
                     onSelectTrip={handleSelectTrip}
                     onSelectCity={setSelectedCityId}
                     onAddCity={handleAddCity}
                     onCreateTrip={handleCreateTrip}
                  />
               </div>
            </aside>
            <main className="flex-1 flex flex-col px-4 py-6 gap-4 overflow-hidden">
               {/* Trip Header Strip */}
               {selectedTrip && (
                  <div className="bg-white rounded-xl shadow-sm px-6 py-4">
                     <div className="flex items-center justify-between">
                        <div>
                           <h1 className="text-lg font-semibold text-gray-800">
                              {selectedTrip.name || 'Untitled Trip'}
                           </h1>
                           <p className="text-gray-500 text-sm mt-0.5">
                              {selectedTrip.cities.length} {selectedTrip.cities.length === 1 ? 'destination' : 'destinations'}
                              {selectedTrip.dates.arrival && selectedTrip.dates.departure && (
                                 <span className="ml-2 text-gray-400">
                                    {selectedTrip.dates.arrival} — {selectedTrip.dates.departure}
                                 </span>
                              )}
                           </p>
                        </div>
                        <div className="flex items-center gap-3">
                           <div className="flex items-center gap-1">
                              {selectedTrip.cities.map((city) => (
                                 <button
                                    key={city.id}
                                    onClick={() => setSelectedCityId(city.id)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                                       selectedCityId === city.id
                                          ? 'bg-gray-800 text-white'
                                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                 >
                                    {city.name}
                                 </button>
                              ))}
                           </div>
                           <div className="w-px h-6 bg-gray-200" />
                           <button
                              onClick={handleDeleteTrip}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete trip"
                           >
                              <TrashIcon className="w-5 h-5" />
                           </button>
                        </div>
                     </div>
                  </div>
               )}

               <div className="flex-1 w-full overflow-hidden">
                  {selectedTrip && selectedCity ? (
                     <TripView
                        trip={selectedTrip}
                        city={selectedCity}
                        activities={selectedTrip.activities.filter(a => a.city.id === selectedCityId)}
                        onUpdateActivities={handleUpdateActivities}
                        onUpdateTrip={handleUpdateTrip}
                     />
                  ) : (
                     <div className="flex items-center justify-center h-full text-gray-500">
                        {tripsList.length === 0
                           ? 'Create a trip to get started'
                           : 'Select a trip and city to get started'}
                     </div>
                  )}
               </div>
            </main>
         </div>
      </div>
   );
}
