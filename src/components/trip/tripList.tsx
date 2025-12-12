'use client';

import { Trip } from '@/types';
import { useState } from 'react';
import { PlusIcon, ChevronDownIcon, MapPinIcon } from '@heroicons/react/24/outline';

interface TripListProps {
   trips: Trip[];
   selectedTripId: string | null;
   selectedCityId: string | null;
   onSelectTrip: (tripId: string) => void;
   onSelectCity: (cityId: string) => void;
   onAddCity: () => void;
   onCreateTrip?: () => void;
}

export default function TripList({
   trips,
   selectedTripId,
   selectedCityId,
   onSelectTrip,
   onSelectCity,
   onAddCity,
   onCreateTrip,
}: TripListProps) {
   const [isTripDropdownOpen, setIsTripDropdownOpen] = useState(false);

   const selectedTrip = trips.find(t => t.id === selectedTripId);

   return (
      <div className="bg-indigo-50 rounded-lg shadow-sm p-6 h-full flex flex-col">
         <h2 className="text-lg font-semibold mb-4 text-indigo-900">Your Trips</h2>

         <div className="mb-6">
            <div className="relative">
               <button
                  onClick={() => setIsTripDropdownOpen(!isTripDropdownOpen)}
                  className="w-full bg-white rounded-xl p-4 shadow-sm border-2 border-transparent hover:border-indigo-100 transition-all text-left"
               >
                  {selectedTrip ? (
                     <div className="flex items-center justify-between">
                        <div>
                           <div className="font-semibold text-gray-800">
                              {selectedTrip.name || `Trip ${selectedTrip.id}`}
                           </div>
                           <div className="text-xs text-gray-500 mt-1">
                              {selectedTrip.cities.length} {selectedTrip.cities.length === 1 ? 'city' : 'cities'}
                              {selectedTrip.dates.arrival && (
                                 <span className="ml-2">
                                    {selectedTrip.dates.arrival}
                                 </span>
                              )}
                           </div>
                        </div>
                        <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isTripDropdownOpen ? 'rotate-180' : ''}`} />
                     </div>
                  ) : (
                     <div className="flex items-center justify-between text-gray-500">
                        <span>Select a trip...</span>
                        <ChevronDownIcon className={`w-5 h-5 transition-transform ${isTripDropdownOpen ? 'rotate-180' : ''}`} />
                     </div>
                  )}
               </button>

               {isTripDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-10">
                     {trips.map(trip => (
                        <button
                           key={trip.id}
                           onClick={() => {
                              onSelectTrip(trip.id);
                              if (trip.cities.length > 0) {
                                 onSelectCity(trip.cities[0].id);
                              }
                              setIsTripDropdownOpen(false);
                           }}
                           className={`w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors border-b border-gray-50 last:border-b-0 ${
                              selectedTripId === trip.id ? 'bg-indigo-50' : ''
                           }`}
                        >
                           <div className="font-medium text-gray-800">
                              {trip.name || `Trip ${trip.id}`}
                           </div>
                           <div className="text-xs text-gray-500 mt-0.5">
                              {trip.cities.length} {trip.cities.length === 1 ? 'city' : 'cities'}
                           </div>
                        </button>
                     ))}

                     <button
                        onClick={() => {
                           setIsTripDropdownOpen(false);
                           onCreateTrip?.();
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-indigo-50 transition-colors text-indigo-600 font-medium flex items-center gap-2"
                     >
                        <PlusIcon className="w-4 h-4" />
                        Create New Trip
                     </button>
                  </div>
               )}
            </div>
         </div>

         {selectedTrip && (
            <>
               <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                     Destinations
                  </h3>
                  <span className="text-xs text-gray-400">
                     {selectedTrip.cities.length} stops
                  </span>
               </div>

               <ul className="space-y-2 flex-1 overflow-y-auto">
                  {selectedTrip.cities.map((city, index) => (
                     <li key={city.id}>
                        <button
                           onClick={() => onSelectCity(city.id)}
                           className={`w-full text-left px-4 py-3 rounded-xl transition-all ${
                              selectedCityId === city.id
                                 ? 'bg-indigo-100 text-indigo-900 shadow-md'
                                 : 'bg-white hover:bg-indigo-50 text-gray-800 shadow-sm'
                           }`}
                        >
                           <div className="flex items-center gap-3">
                              <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                 selectedCityId === city.id
                                    ? 'bg-indigo-200 text-indigo-700'
                                    : 'bg-indigo-50 text-indigo-500'
                              }`}>
                                 {index + 1}
                              </div>
                              <div className="flex-1">
                                 <div className="font-medium">{city.name}</div>
                                 <div className={`text-xs ${
                                    selectedCityId === city.id ? 'text-indigo-600' : 'text-gray-400'
                                 }`}>
                                    {city.country}
                                 </div>
                              </div>
                              <MapPinIcon className={`w-4 h-4 ${
                                 selectedCityId === city.id ? 'text-indigo-400' : 'text-gray-300'
                              }`} />
                           </div>
                        </button>
                     </li>
                  ))}
               </ul>

               <button
                  onClick={onAddCity}
                  className="rounded-xl mt-4 w-full px-4 py-3 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition-colors flex items-center justify-center gap-2 shadow-sm font-medium"
               >
                  <PlusIcon className="h-5 w-5" />
                  Add Destination
               </button>
            </>
         )}
      </div>
   );
}
