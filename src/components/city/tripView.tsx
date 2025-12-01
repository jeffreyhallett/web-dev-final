'use client';

import { City, Activity, Trip } from '@/types';
import { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import CityViewMap from '@/components/map/cityViewMap';
import ActivityCard from '@/components/ui/activityCard';


interface CityViewProps {
   city: City;
   trip?: Trip;
   activities: Activity[];
   onUpdateActivities: (activities: Activity[]) => void;
   onUpdateTrip: (trip: Trip) => void;
}

export default function TripView({
   city,
   trip,
   activities,
   onUpdateActivities,
   onUpdateTrip,
}: CityViewProps) {
   const [unsavedTrip, setUnsavedTrip] = useState<Trip>(
      trip || {
         id: '',
         cities: [city],
         activities: [],
         dates: { arrival: '', departure: '' },
         accommodation: [],
         transportation: { flights: [], trainRides: [] },
         notes: [],
      }
   );

   const recommendedActivities = activities.filter((a) => a.inTravelPlan === false);
   const plannedActivities = activities.filter((a) => a.inTravelPlan === true);

   return (
      <div className="grid grid-cols-[300px_1fr_350px] gap-6 h-full">
         <div className='flex flex-col'>
            <div className="bg-white rounded-xl shadow-sm p-6 flex-1 overflow-y-auto">
               <div className="space-y-6">
                  <div>
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Planned Activities</h3>
                        <button
                           onClick={() => {
                              // Add activity logic
                           }}
                           className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                           <PlusIcon className="w-5 h-5" />
                        </button>
                     </div>
                     <div className="space-y-3">
                        {plannedActivities.length === 0 ? (
                           <p className="text-gray-500 text-sm">
                              No planned activities yet. Add some!
                           </p>
                        ) : (
                           plannedActivities.map((activity) => (
                              <ActivityCard key={activity.id} activity={activity} />
                           ))
                        )}
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className='flex flex-col gap-4'>
            <div className='rounded-xl shadow-sm p-4 flex flex-col gap-1 justify-center items-center'>
               <h2 className='text-2xl font-bold'>{city.name}, {city.country}</h2>
               <p className="text-sm text-gray-500">
                  Coordinates: {city.latitude.toFixed(4)}°, {city.longitude.toFixed(4)}°
               </p>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-y-auto flex-1">
               <CityViewMap city={city} />
            </div>
         </div>

         <div className='flex flex-col'>
            <div className="bg-white rounded-xl shadow-sm p-6 flex-1 overflow-y-auto">
               <h3 className="text-lg font-semibold mb-4">Trip Plan</h3>
               <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-500 mb-1">
                        Accommodation:
                     </label>
                     <input
                        type="text"
                        value={unsavedTrip.accommodation[0]?.name || ''}
                        onChange={(e) => {
                           setUnsavedTrip({
                              ...unsavedTrip,
                              accommodation: [
                                 {
                                    ...unsavedTrip.accommodation[0],
                                    name: e.target.value,
                                 },
                              ],
                           });
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter accommodation name"
                        onBlur={() => onUpdateTrip(unsavedTrip)}
                     />
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Transportation:
                     </label>
                  </div>

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes:
                     </label>
                     <textarea
                        value={unsavedTrip.notes[0]?.content || ''}
                        onChange={(e) =>
                           setUnsavedTrip({
                              ...unsavedTrip,
                              notes: [
                                 { ...unsavedTrip.notes[0], content: e.target.value },
                              ],
                           })
                        }
                        onBlur={() => onUpdateTrip(unsavedTrip)}
                        placeholder="Important information..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                     />
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
