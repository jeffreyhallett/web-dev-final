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
               <div className="px-4 py-8 flex-1 w-full">
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
