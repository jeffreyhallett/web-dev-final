'use client';

import TripList from '@/components/trip/tripList';
import type { Trip, Activity } from '@/types';
import { useState, useCallback } from 'react';
import TripView from '@/components/city/tripView';
import Header from '@/components/layout/header';
import { TrashIcon } from '@heroicons/react/24/outline';
import AddTripModal from '@/components/trip/addTripModal';
import AddCityModal from '@/components/city/addCityModal';
import AddActivityModal from '@/components/activity/addActivityModal';
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
   useCreateActivity,
   useUpdateActivity,
   useDeleteActivity,
   useCreateFlight,
   useUpdateFlight,
   useDeleteFlight,
   useCreateTrain,
   useUpdateTrain,
   useDeleteTrain,
} from '@/lib/api';
import { RecommendedActivity } from '@/lib/api/client';

export default function HomePage() {
   const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
   const [selectedCityId, setSelectedCityId] = useState<string | null>(null);

   const [showAddTripModal, setShowAddTripModal] = useState(false);
   const [showAddCityModal, setShowAddCityModal] = useState(false);
   const [showAddActivityModal, setShowAddActivityModal] = useState(false);
   const [editingActivity, setEditingActivity] = useState<Activity | null>(null);

   const { data: trips, isLoading: tripsLoading, error: tripsError, refetch: refetchTrips } = useTrips();

   const { data: selectedTrip, refetch: refetchTrip } = useTrip(selectedTripId);

   const { mutate: createTrip } = useCreateTrip();
   const { mutate: deleteTrip } = useDeleteTrip();
   const { mutate: createCity } = useCreateCity();
   const { mutate: createAccommodation } = useCreateAccommodation();
   const { mutate: updateAccommodation } = useUpdateAccommodation();
   const { mutate: createNote } = useCreateNote();
   const { mutate: updateNote } = useUpdateNote();
   const { mutate: createActivity } = useCreateActivity();
   const { mutate: updateActivity } = useUpdateActivity();
   const { mutate: deleteActivity } = useDeleteActivity();
   const { mutate: createFlight } = useCreateFlight();
   const { mutate: updateFlight } = useUpdateFlight();
   const { mutate: deleteFlight } = useDeleteFlight();
   const { mutate: createTrain } = useCreateTrain();
   const { mutate: updateTrain } = useUpdateTrain();
   const { mutate: deleteTrain } = useDeleteTrain();

   const selectedCity = selectedTrip?.cities.find(c => c.id === selectedCityId);

   const handleSelectTrip = useCallback((tripId: string) => {
      setSelectedTripId(tripId);
   }, []);

   const handleUpdateActivities = useCallback(() => {
      refetchTrip();
   }, [refetchTrip]);

   const handleUpdateTrip = useCallback(async (updates: Partial<Trip>) => {
      if (!selectedTripId || !selectedTrip) return;

      try {
         if (updates.accommodation) {
            for (const acc of updates.accommodation) {
               if (acc.id && !acc.id.startsWith('temp-')) {
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
                        confirmationNumber: acc.confirmationNumber,
                        notes: acc.notes,
                     },
                  });
               } else if (acc.name) {
                  await createAccommodation({
                     tripId: selectedTripId,
                     data: {
                        name: acc.name,
                        cityId: acc.city.id,
                        address: acc.address,
                        checkIn: acc.checkIn,
                        checkOut: acc.checkOut,
                        bookingUrl: acc.url,
                        confirmationNumber: acc.confirmationNumber,
                        notes: acc.notes,
                     },
                  });
               }
            }
         }

         if (updates.notes) {
            for (const note of updates.notes) {
               if (note.id && !note.id.startsWith('temp-')) {
                  await updateNote({
                     tripId: selectedTripId,
                     noteId: note.id,
                     data: {
                        content: note.content,
                        noteDate: note.date,
                     },
                  });
               } else if (note.content) {
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

   const handleOpenCreateTrip = useCallback(() => {
      setShowAddTripModal(true);
   }, []);

   const handleCreateTrip = useCallback(async (data: { name: string; arrivalDate?: string; departureDate?: string }) => {
      const newTrip = await createTrip(data);
      await refetchTrips();
      setSelectedTripId(newTrip.id);
   }, [createTrip, refetchTrips]);

   const handleOpenAddCity = useCallback(() => {
      if (selectedTripId) {
         setShowAddCityModal(true);
      }
   }, [selectedTripId]);

   const handleAddCitySubmit = useCallback(async (data: { name: string; country: string; latitude: number; longitude: number }) => {
      if (!selectedTripId) return;
      const newCity = await createCity({
         tripId: selectedTripId,
         data,
      });
      await refetchTrip();
      setSelectedCityId(newCity.id);
   }, [selectedTripId, createCity, refetchTrip]);

   const handleOpenAddActivity = useCallback(() => {
      if (selectedTripId && selectedCityId) {
         setEditingActivity(null);
         setShowAddActivityModal(true);
      }
   }, [selectedTripId, selectedCityId]);

   const handleEditActivity = useCallback((activity: Activity) => {
      setEditingActivity(activity);
      setShowAddActivityModal(true);
   }, []);

   const handleAddActivitySubmit = useCallback(async (data: {
      name: string;
      description?: string;
      location?: string;
      scheduledTime?: string;
      inTravelPlan: boolean;
      activityUrl?: string;
      imageUrl?: string;
   }) => {
      if (!selectedTripId || !selectedCityId) return;

      if (editingActivity) {
         await updateActivity({
            tripId: selectedTripId,
            activityId: editingActivity.id,
            data: {
               name: data.name,
               description: data.description,
               location: data.location,
               scheduledTime: data.scheduledTime,
               inTravelPlan: data.inTravelPlan,
               activityUrl: data.activityUrl,
               imageUrl: data.imageUrl,
            },
         });
      } else {
         await createActivity({
            tripId: selectedTripId,
            data: {
               name: data.name,
               cityId: selectedCityId,
               description: data.description,
               location: data.location,
               scheduledTime: data.scheduledTime,
               inTravelPlan: data.inTravelPlan,
               activityUrl: data.activityUrl,
               imageUrl: data.imageUrl,
            },
         });
      }
      setEditingActivity(null);
      await refetchTrip();
   }, [selectedTripId, selectedCityId, editingActivity, createActivity, updateActivity, refetchTrip]);

   const handleDeleteActivity = useCallback(async (activityId: string) => {
      if (!selectedTripId) return;
      await deleteActivity({
         tripId: selectedTripId,
         activityId,
      });
      await refetchTrip();
   }, [selectedTripId, deleteActivity, refetchTrip]);

   const handleAddFlight = useCallback(async (data: {
      departureAirport: string;
      arrivalAirport: string;
      flightNumber?: string;
      airline?: string;
      departureTime?: string;
      arrivalTime?: string;
      confirmationNumber?: string;
      bookingUrl?: string;
      notes?: string;
   }) => {
      if (!selectedTripId) return;
      await createFlight({
         tripId: selectedTripId,
         data,
      });
      await refetchTrip();
   }, [selectedTripId, createFlight, refetchTrip]);

   const handleUpdateFlight = useCallback(async (flightId: string, data: {
      departureAirport?: string;
      arrivalAirport?: string;
      flightNumber?: string;
      airline?: string;
      departureTime?: string;
      arrivalTime?: string;
      confirmationNumber?: string;
      bookingUrl?: string;
      notes?: string;
   }) => {
      if (!selectedTripId) return;
      await updateFlight({
         tripId: selectedTripId,
         flightId,
         data,
      });
      await refetchTrip();
   }, [selectedTripId, updateFlight, refetchTrip]);

   const handleDeleteFlight = useCallback(async (flightId: string) => {
      if (!selectedTripId) return;
      await deleteFlight({
         tripId: selectedTripId,
         flightId,
      });
      await refetchTrip();
   }, [selectedTripId, deleteFlight, refetchTrip]);

   const handleAddTrain = useCallback(async (data: {
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
   }) => {
      if (!selectedTripId) return;
      await createTrain({
         tripId: selectedTripId,
         data,
      });
      await refetchTrip();
   }, [selectedTripId, createTrain, refetchTrip]);

   const handleUpdateTrain = useCallback(async (trainId: string, data: {
      departureStation?: string;
      arrivalStation?: string;
      trainNumber?: string;
      operator?: string;
      departureTime?: string;
      arrivalTime?: string;
      confirmationNumber?: string;
      bookingUrl?: string;
      seatInfo?: string;
      notes?: string;
   }) => {
      if (!selectedTripId) return;
      await updateTrain({
         tripId: selectedTripId,
         trainId,
         data,
      });
      await refetchTrip();
   }, [selectedTripId, updateTrain, refetchTrip]);

   const handleDeleteTrain = useCallback(async (trainId: string) => {
      if (!selectedTripId) return;
      await deleteTrain({
         tripId: selectedTripId,
         trainId,
      });
      await refetchTrip();
   }, [selectedTripId, deleteTrain, refetchTrip]);

   const handleAddRecommendedActivity = useCallback(async (activity: RecommendedActivity) => {
      if (!selectedTripId || !selectedCityId) return;
      await createActivity({
         tripId: selectedTripId,
         data: {
            name: activity.name,
            cityId: selectedCityId,
            description: activity.description,
            location: activity.location,
            inTravelPlan: true,
         },
      });
      await refetchTrip();
   }, [selectedTripId, selectedCityId, createActivity, refetchTrip]);

   if (tripsLoading) {
      return (
         <div className="flex items-center justify-center h-screen">
            <div className="text-gray-500">Loading trips...</div>
         </div>
      );
   }

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
         <Header />
         <div className="flex flex-1 overflow-hidden">
            <aside className="w-64 flex flex-col">
               <div className="px-4 py-6 flex-1">
                  <TripList
                     trips={tripsList}
                     selectedTripId={selectedTripId}
                     selectedCityId={selectedCityId}
                     onSelectTrip={handleSelectTrip}
                     onSelectCity={setSelectedCityId}
                     onAddCity={handleOpenAddCity}
                     onCreateTrip={handleOpenCreateTrip}
                  />
               </div>
            </aside>
            <main className="flex-1 flex flex-col px-4 py-6 gap-4 overflow-hidden">
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

               <div className="flex-1 w-full overflow-hidden drop-shadow-sm rounded-xl bg-transparent border-transparent">
                  {selectedTrip && selectedCity ? (
                     <TripView
                        trip={selectedTrip}
                        city={selectedCity}
                        activities={selectedTrip.activities.filter(a => a.city.id === selectedCityId)}
                        onUpdateActivities={handleUpdateActivities}
                        onUpdateTrip={handleUpdateTrip}
                        onAddActivity={handleOpenAddActivity}
                        onEditActivity={handleEditActivity}
                        onDeleteActivity={handleDeleteActivity}
                        onAddRecommendedActivity={handleAddRecommendedActivity}
                        onAddFlight={handleAddFlight}
                        onAddTrain={handleAddTrain}
                        onUpdateFlight={handleUpdateFlight}
                        onUpdateTrain={handleUpdateTrain}
                        onDeleteFlight={handleDeleteFlight}
                        onDeleteTrain={handleDeleteTrain}
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

         <AddTripModal
            isOpen={showAddTripModal}
            onClose={() => setShowAddTripModal(false)}
            onSubmit={handleCreateTrip}
         />

         <AddCityModal
            isOpen={showAddCityModal}
            onClose={() => setShowAddCityModal(false)}
            onSubmit={handleAddCitySubmit}
         />

         {selectedCity && (
            <AddActivityModal
               isOpen={showAddActivityModal}
               onClose={() => {
                  setShowAddActivityModal(false);
                  setEditingActivity(null);
               }}
               onSubmit={handleAddActivitySubmit}
               cityName={selectedCity.name}
               initialActivity={editingActivity || undefined}
            />
         )}
      </div>
   );
}
