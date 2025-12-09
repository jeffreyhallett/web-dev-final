'use client';

import TripList from '@/components/trip/tripList';
import { Trip, Activity } from '@/types';
import { useState, useCallback } from 'react';
import TripView from '@/components/city/tripView';
import Header from '@/components/layout/header';
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
   useDeleteActivity,
   useCreateFlight,
   useDeleteFlight,
   useCreateTrain,
   useDeleteTrain,
} from '@/lib/api';
import { RecommendedActivity } from '@/lib/api/client';

export default function HomePage() {
   const [view, setView] = useState<'list' | 'map'>('list');
   const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
   const [selectedCityId, setSelectedCityId] = useState<string | null>(null);

   // Modal state
   const [showAddTripModal, setShowAddTripModal] = useState(false);
   const [showAddCityModal, setShowAddCityModal] = useState(false);
   const [showAddActivityModal, setShowAddActivityModal] = useState(false);

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
   const { mutate: createActivity } = useCreateActivity();
   const { mutate: deleteActivity } = useDeleteActivity();
   const { mutate: createFlight } = useCreateFlight();
   const { mutate: deleteFlight } = useDeleteFlight();
   const { mutate: createTrain } = useCreateTrain();
   const { mutate: deleteTrain } = useDeleteTrain();

   // Derived values
   const selectedCity = selectedTrip?.cities.find(c => c.id === selectedCityId);

   // Handler to select a trip
   const handleSelectTrip = useCallback((tripId: string) => {
      setSelectedTripId(tripId);
   }, []);

   // Handler to update activities within a trip
   const handleUpdateActivities = useCallback((newActivities: Activity[]) => {
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

   // Handler to open create trip modal
   const handleOpenCreateTrip = useCallback(() => {
      setShowAddTripModal(true);
   }, []);

   // Handler to create a new trip (from modal)
   const handleCreateTrip = useCallback(async (data: { name: string; arrivalDate?: string; departureDate?: string }) => {
      const newTrip = await createTrip(data);
      await refetchTrips();
      setSelectedTripId(newTrip.id);
   }, [createTrip, refetchTrips]);

   // Handler to open add city modal
   const handleOpenAddCity = useCallback(() => {
      if (selectedTripId) {
         setShowAddCityModal(true);
      }
   }, [selectedTripId]);

   // Handler to add city (from modal)
   const handleAddCitySubmit = useCallback(async (data: { name: string; country: string; latitude: number; longitude: number }) => {
      if (!selectedTripId) return;
      const newCity = await createCity({
         tripId: selectedTripId,
         data,
      });
      await refetchTrip();
      setSelectedCityId(newCity.id);
   }, [selectedTripId, createCity, refetchTrip]);

   // Handler to open add activity modal
   const handleOpenAddActivity = useCallback(() => {
      if (selectedTripId && selectedCityId) {
         setShowAddActivityModal(true);
      }
   }, [selectedTripId, selectedCityId]);

   // Handler to add activity (from modal)
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
      await refetchTrip();
   }, [selectedTripId, selectedCityId, createActivity, refetchTrip]);

   // Handler to delete activity
   const handleDeleteActivity = useCallback(async (activityId: string) => {
      if (!selectedTripId) return;
      await deleteActivity({
         tripId: selectedTripId,
         activityId,
      });
      await refetchTrip();
   }, [selectedTripId, deleteActivity, refetchTrip]);

   // Handler to add flight
   const handleAddFlight = useCallback(async (data: {
      departureAirport: string;
      arrivalAirport: string;
      flightNumber?: string;
      airline?: string;
      departureTime?: string;
      arrivalTime?: string;
   }) => {
      if (!selectedTripId) return;
      await createFlight({
         tripId: selectedTripId,
         data,
      });
      await refetchTrip();
   }, [selectedTripId, createFlight, refetchTrip]);

   // Handler to delete flight
   const handleDeleteFlight = useCallback(async (flightId: string) => {
      if (!selectedTripId) return;
      await deleteFlight({
         tripId: selectedTripId,
         flightId,
      });
      await refetchTrip();
   }, [selectedTripId, deleteFlight, refetchTrip]);

   // Handler to add train
   const handleAddTrain = useCallback(async (data: {
      departureStation: string;
      arrivalStation: string;
      trainNumber?: string;
      operator?: string;
      departureTime?: string;
      arrivalTime?: string;
   }) => {
      if (!selectedTripId) return;
      await createTrain({
         tripId: selectedTripId,
         data,
      });
      await refetchTrip();
   }, [selectedTripId, createTrain, refetchTrip]);

   // Handler to delete train
   const handleDeleteTrain = useCallback(async (trainId: string) => {
      if (!selectedTripId) return;
      await deleteTrain({
         tripId: selectedTripId,
         trainId,
      });
      await refetchTrip();
   }, [selectedTripId, deleteTrain, refetchTrip]);

   // Handler to add recommended activity
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

   // Loading state
   if (tripsLoading) {
      return (
         <div
            className="min-h-screen flex items-center justify-center"
            style={{ background: '#f5f0e6' }}
         >
            <div className="text-center">
               <div className="text-6xl mb-4 animate-bounce">🌍</div>
               <p className="text-lg font-semibold" style={{ color: '#2c2416', fontFamily: 'Georgia, serif' }}>
                  Loading your adventures...
               </p>
            </div>
         </div>
      );
   }

   // Error state
   if (tripsError) {
      return (
         <div
            className="min-h-screen flex items-center justify-center"
            style={{ background: '#f5f0e6' }}
         >
            <div
               className="text-center p-8 rounded-lg"
               style={{
                  background: '#fff',
                  border: '2px solid #c41e3a',
                  boxShadow: '4px 4px 0 #c41e3a',
               }}
            >
               <div className="text-5xl mb-4">⚠️</div>
               <p className="font-semibold mb-2" style={{ color: '#c41e3a' }}>
                  Oops! Something went wrong
               </p>
               <p className="text-sm" style={{ color: '#5c5445' }}>
                  {tripsError.message}
               </p>
            </div>
         </div>
      );
   }

   const tripsList = trips || [];

   return (
      <div className="min-h-screen" style={{ background: '#f5f0e6' }}>
         <Header view={view} onViewChange={setView} />

         <div className="flex gap-4 p-4">
            {/* Sidebar */}
            <aside className="w-72 flex-shrink-0">
               <div className="sticky top-4">
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

            {/* Main content */}
            <main className="flex-1 min-w-0">
               {/* Trip Header Strip */}
               {selectedTrip && (
                  <div
                     className="mb-4 rounded-lg overflow-hidden"
                     style={{
                        background: 'linear-gradient(135deg, #fff 0%, #f5f0e6 100%)',
                        border: '2px solid #5c5445',
                        boxShadow: '0 4px 20px rgba(44, 36, 22, 0.1)',
                     }}
                  >
                     <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              {/* Passport stamp style */}
                              <div
                                 className="w-16 h-16 rounded-full flex items-center justify-center"
                                 style={{
                                    border: '3px solid #c41e3a',
                                    color: '#c41e3a',
                                    transform: 'rotate(-8deg)',
                                 }}
                              >
                                 <div className="text-center">
                                    <div className="text-xs font-bold tracking-wider">TRIP</div>
                                    <div className="text-lg font-bold">{selectedTrip.cities.length}</div>
                                 </div>
                              </div>

                              <div>
                                 <h1
                                    className="text-2xl font-bold"
                                    style={{ color: '#2c2416', fontFamily: 'Georgia, serif' }}
                                 >
                                    {selectedTrip.name || 'Untitled Adventure'}
                                 </h1>
                                 <p className="text-sm mt-1" style={{ color: '#5c5445' }}>
                                    {selectedTrip.cities.length} {selectedTrip.cities.length === 1 ? 'destination' : 'destinations'}
                                    {selectedTrip.dates.arrival && selectedTrip.dates.departure && (
                                       <span className="ml-2">
                                          📅 {selectedTrip.dates.arrival} → {selectedTrip.dates.departure}
                                       </span>
                                    )}
                                 </p>
                              </div>
                           </div>

                           <div className="flex items-center gap-3">
                              {/* City tabs */}
                              <div className="flex items-center gap-1">
                                 {selectedTrip.cities.map((city) => (
                                    <button
                                       key={city.id}
                                       onClick={() => setSelectedCityId(city.id)}
                                       className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                                       style={{
                                          background: selectedCityId === city.id
                                             ? 'linear-gradient(135deg, #2c2416 0%, #5c5445 100%)'
                                             : '#fff',
                                          color: selectedCityId === city.id ? '#e8d48b' : '#2c2416',
                                          border: selectedCityId === city.id
                                             ? '2px solid #c9a227'
                                             : '2px solid #e8e0d0',
                                          boxShadow: selectedCityId === city.id
                                             ? '0 2px 10px rgba(201, 162, 39, 0.3)'
                                             : 'none',
                                       }}
                                    >
                                       {city.name}
                                    </button>
                                 ))}
                              </div>

                              <div
                                 className="w-px h-8"
                                 style={{ background: '#e8e0d0' }}
                              />

                              {/* Delete button */}
                              <button
                                 onClick={handleDeleteTrip}
                                 className="p-2 rounded-lg transition-all duration-200 hover:scale-105"
                                 style={{
                                    color: '#c41e3a',
                                    border: '2px solid #c41e3a',
                                    background: 'transparent',
                                 }}
                                 title="Delete trip"
                              >
                                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                 </svg>
                              </button>
                           </div>
                        </div>
                     </div>

                     {/* Decorative border */}
                     <div
                        className="h-1"
                        style={{
                           background: 'linear-gradient(90deg, #c9a227, #e8d48b, #c9a227)',
                        }}
                     />
                  </div>
               )}

               {/* Main trip view */}
               {selectedTrip && selectedCity ? (
                  <TripView
                     trip={selectedTrip}
                     city={selectedCity}
                     activities={selectedTrip.activities.filter(a => a.city.id === selectedCityId)}
                     onUpdateActivities={handleUpdateActivities}
                     onUpdateTrip={handleUpdateTrip}
                     onAddActivity={handleOpenAddActivity}
                     onDeleteActivity={handleDeleteActivity}
                     onAddRecommendedActivity={handleAddRecommendedActivity}
                     onAddFlight={handleAddFlight}
                     onAddTrain={handleAddTrain}
                     onDeleteFlight={handleDeleteFlight}
                     onDeleteTrain={handleDeleteTrain}
                  />
               ) : (
                  /* Empty state */
                  <div
                     className="rounded-lg p-12 text-center"
                     style={{
                        background: 'linear-gradient(135deg, #fff 0%, #f5f0e6 100%)',
                        border: '2px dashed #5c5445',
                        minHeight: '400px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                     }}
                  >
                     <div className="text-8xl mb-6">🗺️</div>
                     <h2
                        className="text-2xl font-bold mb-2"
                        style={{ color: '#2c2416', fontFamily: 'Georgia, serif' }}
                     >
                        {tripsList.length === 0 ? 'Start Your Journey' : 'Select a Destination'}
                     </h2>
                     <p className="mb-6" style={{ color: '#5c5445' }}>
                        {tripsList.length === 0
                           ? 'Create your first trip to begin planning your adventure'
                           : 'Choose a trip and city from the sidebar to view details'}
                     </p>
                     {tripsList.length === 0 && (
                        <button
                           onClick={handleOpenCreateTrip}
                           className="px-6 py-3 font-bold transition-all duration-200 hover:scale-105"
                           style={{
                              background: 'linear-gradient(135deg, #c9a227 0%, #a88520 100%)',
                              color: '#2c2416',
                              borderRadius: '8px',
                              boxShadow: '4px 4px 0 #5c5445',
                              border: '2px solid #2c2416',
                           }}
                        >
                           ✈️ Plan Your First Adventure
                        </button>
                     )}

                     {/* Decorative stamps */}
                     <div className="flex gap-4 mt-8 opacity-30">
                        <div
                           className="px-3 py-1 text-xs font-bold tracking-wider"
                           style={{
                              border: '2px solid #c41e3a',
                              color: '#c41e3a',
                              transform: 'rotate(-12deg)',
                           }}
                        >
                           WANDERLUST
                        </div>
                        <div
                           className="px-3 py-1 text-xs font-bold tracking-wider"
                           style={{
                              border: '2px solid #1e4d8c',
                              color: '#1e4d8c',
                              transform: 'rotate(8deg)',
                           }}
                        >
                           EXPLORE
                        </div>
                        <div
                           className="px-3 py-1 text-xs font-bold tracking-wider"
                           style={{
                              border: '2px solid #2d5a3d',
                              color: '#2d5a3d',
                              transform: 'rotate(-5deg)',
                           }}
                        >
                           DISCOVER
                        </div>
                     </div>
                  </div>
               )}
            </main>
         </div>

         {/* Modals */}
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
               onClose={() => setShowAddActivityModal(false)}
               onSubmit={handleAddActivitySubmit}
               cityName={selectedCity.name}
            />
         )}
      </div>
   );
}
