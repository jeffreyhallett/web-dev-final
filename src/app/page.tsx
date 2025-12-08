'use client';

import TripList from '@/components/trip/tripList';
import { Trip, City, Activity } from '@/types';
import { useState } from 'react';
import TripView from '@/components/city/tripView';
import Header from '@/components/layout/header';

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
            <main className="flex-1 flex flex-col">
               {/* Trip Header Strip */}
               {selectedTrip && (
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 shadow-md">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                           <div>
                              <h1 className="text-xl font-bold">
                                 {selectedTrip.name || 'Untitled Trip'}
                              </h1>
                              <p className="text-blue-100 text-sm mt-0.5">
                                 {selectedTrip.cities.length} {selectedTrip.cities.length === 1 ? 'destination' : 'destinations'}
                                 {selectedTrip.dates.arrival && selectedTrip.dates.departure && (
                                    <span className="ml-3">
                                       {selectedTrip.dates.arrival} — {selectedTrip.dates.departure}
                                    </span>
                                 )}
                              </p>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                           {selectedTrip.cities.map((city, index) => (
                              <button
                                 key={city.id}
                                 onClick={() => setSelectedCityId(city.id)}
                                 className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                    selectedCityId === city.id
                                       ? 'bg-white text-blue-600'
                                       : 'bg-blue-500/30 text-white hover:bg-blue-500/50'
                                 }`}
                              >
                                 {city.name}
                              </button>
                           ))}
                        </div>
                     </div>
                  </div>
               )}

               <div className="px-4 py-6 flex-1 w-full overflow-hidden">
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
