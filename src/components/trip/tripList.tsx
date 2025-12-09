'use client';

import { Trip } from '@/types';
import { useState } from 'react';

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
      <div
         className="h-full flex flex-col rounded-lg overflow-hidden"
         style={{
            background: 'linear-gradient(180deg, #f5f0e6 0%, #e8e0d0 100%)',
            boxShadow: '0 4px 20px rgba(44, 36, 22, 0.15)',
            border: '2px solid #5c5445',
         }}
      >
         {/* Header - Like a travel document */}
         <div
            className="px-4 py-3"
            style={{
               background: 'linear-gradient(135deg, #2c2416 0%, #5c5445 100%)',
               borderBottom: '3px solid #c9a227',
            }}
         >
            <div className="flex items-center gap-3">
               <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                  style={{
                     background: 'linear-gradient(135deg, #c9a227, #e8d48b)',
                  }}
               >
                  📋
               </div>
               <div>
                  <h2
                     className="font-bold tracking-wider text-sm"
                     style={{ color: '#e8d48b' }}
                  >
                     ITINERARY
                  </h2>
                  <p className="text-xs" style={{ color: 'rgba(232, 212, 139, 0.6)' }}>
                     {trips.length} {trips.length === 1 ? 'journey' : 'journeys'}
                  </p>
               </div>
            </div>
         </div>

         <div className="flex-1 overflow-y-auto p-4">
            {/* Trip Selector - Luggage tag style */}
            <div className="mb-4">
               <div className="relative">
                  <button
                     onClick={() => setIsTripDropdownOpen(!isTripDropdownOpen)}
                     className="w-full text-left transition-all duration-200 hover:scale-[1.02]"
                     style={{
                        background: 'linear-gradient(135deg, #fff 0%, #f5f0e6 100%)',
                        border: '2px solid #5c5445',
                        borderRadius: '8px 8px 8px 24px',
                        padding: '16px 16px 16px 28px',
                        boxShadow: '3px 3px 0 #5c5445',
                     }}
                  >
                     {/* Luggage hole */}
                     <div
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full"
                        style={{
                           border: '2px solid #5c5445',
                           background: '#f5f0e6',
                        }}
                     />

                     {selectedTrip ? (
                        <div className="flex items-center justify-between">
                           <div>
                              <div
                                 className="font-bold"
                                 style={{ color: '#2c2416', fontFamily: 'Georgia, serif' }}
                              >
                                 {selectedTrip.name || 'Untitled Adventure'}
                              </div>
                              <div className="text-xs mt-1 flex items-center gap-2" style={{ color: '#5c5445' }}>
                                 <span>🏙️ {selectedTrip.cities.length} stops</span>
                                 {selectedTrip.dates.arrival && (
                                    <span>📅 {selectedTrip.dates.arrival}</span>
                                 )}
                              </div>
                           </div>
                           <svg
                              className={`w-5 h-5 transition-transform duration-200 ${isTripDropdownOpen ? 'rotate-180' : ''}`}
                              style={{ color: '#5c5445' }}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                           >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                           </svg>
                        </div>
                     ) : (
                        <div className="flex items-center justify-between" style={{ color: '#5c5445' }}>
                           <span className="italic">Select your journey...</span>
                           <svg
                              className={`w-5 h-5 transition-transform duration-200 ${isTripDropdownOpen ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                           >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                           </svg>
                        </div>
                     )}
                  </button>

                  {/* Dropdown */}
                  {isTripDropdownOpen && (
                     <div
                        className="absolute top-full left-0 right-0 mt-2 z-20 overflow-hidden"
                        style={{
                           background: '#fff',
                           border: '2px solid #5c5445',
                           borderRadius: '8px',
                           boxShadow: '0 8px 30px rgba(44, 36, 22, 0.2)',
                        }}
                     >
                        {trips.map((trip, index) => (
                           <button
                              key={trip.id}
                              onClick={() => {
                                 onSelectTrip(trip.id);
                                 if (trip.cities.length > 0) {
                                    onSelectCity(trip.cities[0].id);
                                 }
                                 setIsTripDropdownOpen(false);
                              }}
                              className="w-full text-left px-4 py-3 transition-colors"
                              style={{
                                 background: selectedTripId === trip.id ? '#f5f0e6' : 'transparent',
                                 borderBottom: index < trips.length - 1 ? '1px dashed #e8e0d0' : 'none',
                              }}
                           >
                              <div className="font-medium" style={{ color: '#2c2416' }}>
                                 {trip.name || 'Untitled Adventure'}
                              </div>
                              <div className="text-xs mt-0.5" style={{ color: '#5c5445' }}>
                                 {trip.cities.length} {trip.cities.length === 1 ? 'destination' : 'destinations'}
                              </div>
                           </button>
                        ))}

                        {/* New trip button */}
                        <button
                           onClick={() => {
                              setIsTripDropdownOpen(false);
                              onCreateTrip?.();
                           }}
                           className="w-full text-left px-4 py-3 flex items-center gap-2 transition-colors hover:bg-[#f5f0e6]"
                           style={{
                              borderTop: '2px solid #5c5445',
                              color: '#c9a227',
                              fontWeight: 'bold',
                           }}
                        >
                           <span className="text-lg">✈️</span>
                           Plan New Journey
                        </button>
                     </div>
                  )}
               </div>
            </div>

            {/* Destinations list */}
            {selectedTrip && (
               <>
                  <div className="mb-3 flex items-center justify-between">
                     <h3
                        className="text-xs font-bold tracking-widest uppercase"
                        style={{ color: '#5c5445' }}
                     >
                        Destinations
                     </h3>
                     <div
                        className="text-xs px-2 py-0.5 rounded"
                        style={{
                           background: '#2c2416',
                           color: '#e8d48b',
                        }}
                     >
                        {selectedTrip.cities.length} stops
                     </div>
                  </div>

                  {/* Route line visualization */}
                  <div className="space-y-0">
                     {selectedTrip.cities.map((city, index) => (
                        <div key={city.id} className="relative">
                           {/* Connecting line */}
                           {index < selectedTrip.cities.length - 1 && (
                              <div
                                 className="absolute left-[18px] top-[40px] w-0.5 h-[calc(100%-20px)]"
                                 style={{
                                    background: 'repeating-linear-gradient(to bottom, #5c5445 0, #5c5445 4px, transparent 4px, transparent 8px)',
                                 }}
                              />
                           )}

                           <button
                              onClick={() => onSelectCity(city.id)}
                              className="w-full text-left py-2 px-2 flex items-center gap-3 transition-all duration-200 rounded-lg group"
                              style={{
                                 background: selectedCityId === city.id
                                    ? 'linear-gradient(135deg, #2c2416 0%, #5c5445 100%)'
                                    : 'transparent',
                              }}
                           >
                              {/* Stop marker */}
                              <div
                                 className="relative z-10 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all"
                                 style={{
                                    background: selectedCityId === city.id
                                       ? 'linear-gradient(135deg, #c9a227, #e8d48b)'
                                       : '#fff',
                                    border: selectedCityId === city.id
                                       ? '2px solid #c9a227'
                                       : '2px solid #5c5445',
                                    color: selectedCityId === city.id ? '#2c2416' : '#5c5445',
                                    boxShadow: selectedCityId === city.id
                                       ? '0 2px 10px rgba(201, 162, 39, 0.4)'
                                       : 'none',
                                 }}
                              >
                                 {index + 1}
                              </div>

                              {/* City info */}
                              <div className="flex-1 min-w-0">
                                 <div
                                    className="font-semibold truncate"
                                    style={{
                                       color: selectedCityId === city.id ? '#e8d48b' : '#2c2416',
                                       fontFamily: 'Georgia, serif',
                                    }}
                                 >
                                    {city.name}
                                 </div>
                                 <div
                                    className="text-xs truncate"
                                    style={{
                                       color: selectedCityId === city.id ? 'rgba(232, 212, 139, 0.7)' : '#5c5445',
                                    }}
                                 >
                                    {city.country}
                                 </div>
                              </div>

                              {/* Arrow indicator */}
                              {selectedCityId === city.id && (
                                 <svg className="w-4 h-4" style={{ color: '#c9a227' }} fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                 </svg>
                              )}
                           </button>
                        </div>
                     ))}
                  </div>

                  {/* Add destination button */}
                  <button
                     onClick={onAddCity}
                     className="mt-4 w-full py-3 px-4 flex items-center justify-center gap-2 transition-all duration-200 hover:scale-[1.02]"
                     style={{
                        background: 'linear-gradient(135deg, #c9a227 0%, #a88520 100%)',
                        color: '#2c2416',
                        fontWeight: 'bold',
                        borderRadius: '8px',
                        boxShadow: '3px 3px 0 #5c5445',
                        border: '2px solid #2c2416',
                     }}
                  >
                     <span className="text-lg">📍</span>
                     Add Destination
                  </button>
               </>
            )}

            {/* Empty state */}
            {!selectedTrip && trips.length === 0 && (
               <div className="text-center py-8">
                  <div className="text-5xl mb-4">🗺️</div>
                  <p className="font-semibold mb-2" style={{ color: '#2c2416' }}>
                     No journeys yet
                  </p>
                  <p className="text-sm mb-4" style={{ color: '#5c5445' }}>
                     Start planning your next adventure!
                  </p>
                  <button
                     onClick={onCreateTrip}
                     className="px-4 py-2 font-bold transition-all duration-200 hover:scale-105"
                     style={{
                        background: 'linear-gradient(135deg, #c9a227 0%, #a88520 100%)',
                        color: '#2c2416',
                        borderRadius: '8px',
                        boxShadow: '3px 3px 0 #5c5445',
                        border: '2px solid #2c2416',
                     }}
                  >
                     ✈️ Plan Your First Trip
                  </button>
               </div>
            )}
         </div>

         {/* Footer decoration */}
         <div
            className="px-4 py-2 text-center"
            style={{
               background: '#2c2416',
               borderTop: '2px solid #c9a227',
            }}
         >
            <p className="text-xs tracking-widest" style={{ color: 'rgba(232, 212, 139, 0.5)' }}>
               ✦ ADVENTURE AWAITS ✦
            </p>
         </div>
      </div>
   );
}
