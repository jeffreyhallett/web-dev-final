'use client';

import { City, Trip } from '@/types';
import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

interface TripListProps {
   trips: Trip[];
   selectedTripId: string | null;
   selectedCityId: string | null;
   onSelectTrip: (tripId: string) => void;
   onSelectCity: (cityId: string) => void;
   onAddCity: (city: City) => void;
}

export default function TripList({
   trips,
   selectedTripId,
   selectedCityId,
   onSelectTrip,
   onSelectCity,
   onAddCity,
}: TripListProps) {
   const [showAddCity, setShowAddCity] = useState(false);

   const selectedTrip = trips.find(t => t.id === selectedTripId);

   return (
      <div className="bg-gray-300 rounded-lg shadow-sm p-6 h-full flex flex-col">
         <h2 className="text-xl font-semibold mb-4 text-center">Your Saved Trips</h2>

         {/* Trip Selector Dropdown */}
         <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Select Trip</label>
            <select
               value={selectedTripId || ''}
               onChange={(e) => {
                  onSelectTrip(e.target.value);
                  // Auto-select first city of the new trip
                  const trip = trips.find(t => t.id === e.target.value);
                  if (trip && trip.cities.length > 0) {
                     onSelectCity(trip.cities[0].id);
                  }
               }}
               className="w-full px-3 py-2 border rounded-lg bg-white"
            >
               <option value="">Choose a trip...</option>
               {trips.map(trip => (
                  <option key={trip.id} value={trip.id}>
                     {trip.name || `Trip ${trip.id}`}
                  </option>
               ))}
            </select>
         </div>

         {/* Cities List for Selected Trip */}
         {selectedTrip && (
            <>
               <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Cities</h3>
               </div>

               <ul className="space-y-2 flex-1 overflow-y-auto">
                  {selectedTrip.cities.map((city) => (
                     <li key={city.id}>
                        <button
                           onClick={() => onSelectCity(city.id)}
                           className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                              selectedCityId === city.id
                                 ? 'bg-blue-50 border-2 border-blue-500'
                                 : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                           }`}
                        >
                           <div className="font-medium">{city.name}</div>
                           <div className="text-sm text-gray-500">{city.country}</div>
                        </button>
                     </li>
                  ))}
               </ul>

               <button
                  onClick={() => setShowAddCity(!showAddCity)}
                  className="rounded-lg mt-4 w-full px-4 py-3 bg-blue-500 text-white hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
               >
                  Add City
                  <PlusIcon className="h-5 w-5" />
               </button>
            </>
         )}
      </div>
   );
}
