'use client';

import TripList from '@/components/trip/tripList';
import { Trip, City, Activity } from '@/types';
import { useState } from 'react';
import TripView from '@/components/city/tripView';
import Header from '@/components/layout/header';
import { TrashIcon } from '@heroicons/react/24/outline';

export default function HomePage() {
   const [view, setView] = useState<'list' | 'map'>('list');

   // Trip-centric state
   const [trips, setTrips] = useState<Trip[]>([
      {
         id: '1',
         userId: '1',
         name: 'Europe Summer 2025',
         cities: [
            {
               id: '1',
               name: 'Vienna',
               country: 'Austria',
               latitude: 48.2082,
               longitude: 16.3738,
            },
            {
               id: '2',
               name: 'Prague',
               country: 'Czech Republic',
               latitude: 50.0755,
               longitude: 14.4378,
            },
         ],
         dates: { arrival: '', departure: '' },
         accommodation: [],
         activities: [],
         transportation: { flights: [], trainRides: [] },
         notes: [],
      },
   ]);

   const [selectedTripId, setSelectedTripId] = useState<string | null>('1');
   const [selectedCityId, setSelectedCityId] = useState<string | null>('1');

   // Derived values
   const selectedTrip = trips.find(t => t.id === selectedTripId);
   const selectedCity = selectedTrip?.cities.find(c => c.id === selectedCityId);

   // Handler to add a city to the current trip
   const handleAddCity = (city: City) => {
      if (!selectedTripId) return;

      setTrips(prev => prev.map(t =>
         t.id === selectedTripId
            ? { ...t, cities: [...t.cities, city] }
            : t
      ));
   };

   // Handler to update activities within a trip
   const handleUpdateActivities = (newActivities: Activity[]) => {
      if (!selectedTripId) return;

      setTrips(prev => prev.map(t =>
         t.id === selectedTripId
            ? { ...t, activities: newActivities }
            : t
      ));
   };

   // Handler to update trip (partial updates)
   const handleUpdateTrip = (updates: Partial<Trip>) => {
      if (!selectedTripId) return;

      setTrips(prev => prev.map(t =>
         t.id === selectedTripId
            ? { ...t, ...updates }
            : t
      ));
   };

   // Handler to delete trip
   const handleDeleteTrip = () => {
      if (!selectedTripId) return;

      const confirmed = window.confirm('Are you sure you want to delete this trip?');
      if (!confirmed) return;

      setTrips(prev => prev.filter(t => t.id !== selectedTripId));
      setSelectedTripId(null);
      setSelectedCityId(null);
   };

   return (
      <div className="flex flex-col h-screen">
         <Header view={view} onViewChange={setView} />
         <div className="flex flex-1 overflow-hidden">
            <aside className="w-64 flex flex-col">
               <div className="px-4 py-8 flex-1">
                  <TripList
                     trips={trips}
                     selectedTripId={selectedTripId}
                     selectedCityId={selectedCityId}
                     onSelectTrip={setSelectedTripId}
                     onSelectCity={setSelectedCityId}
                     onAddCity={handleAddCity}
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
                        Select a trip and city to get started
                     </div>
                  )}
               </div>
            </main>
         </div>
      </div>
   );
}
