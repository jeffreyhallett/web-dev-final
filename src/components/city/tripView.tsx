'use client';

import { City, Activity, Trip, Accommodation, Note } from '@/types';
import { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import CityViewMap from '@/components/map/cityViewMap';
import ActivityCard from '@/components/ui/activityCard';
import TransportationSection from '@/components/transportation/transportationSection';

interface TripViewProps {
   trip: Trip;
   city: City;
   activities: Activity[];
   onUpdateActivities: (activities: Activity[]) => void;
   onUpdateTrip: (updates: Partial<Trip>) => void;
   onAddActivity?: () => void;
   onDeleteActivity?: (activityId: string) => Promise<void>;
   onAddFlight?: (data: {
      departureAirport: string;
      arrivalAirport: string;
      flightNumber?: string;
      airline?: string;
      departureTime?: string;
      arrivalTime?: string;
   }) => Promise<void>;
   onAddTrain?: (data: {
      departureStation: string;
      arrivalStation: string;
      trainNumber?: string;
      operator?: string;
      departureTime?: string;
      arrivalTime?: string;
   }) => Promise<void>;
   onDeleteFlight?: (flightId: string) => Promise<void>;
   onDeleteTrain?: (trainId: string) => Promise<void>;
}

export default function TripView({
   trip,
   city,
   activities,
   onUpdateActivities,
   onUpdateTrip,
   onAddActivity,
   onDeleteActivity,
   onAddFlight,
   onAddTrain,
   onDeleteFlight,
   onDeleteTrain,
}: TripViewProps) {
   // Local state for form inputs
   const [accommodationName, setAccommodationName] = useState('');
   const [noteContent, setNoteContent] = useState('');

   // Get accommodations for this city
   const cityAccommodation = trip.accommodation.find(a => a.city.id === city.id);

   // Initialize local state from trip data
   useEffect(() => {
      setAccommodationName(cityAccommodation?.name || '');
      // Get notes (notes are trip-level, not city-specific)
      setNoteContent(trip.notes[0]?.content || '');
   }, [city.id, cityAccommodation, trip.notes]);

   const plannedActivities = activities.filter((a) => a.inTravelPlan === true);

   // Handler for updating accommodation
   const handleAccommodationBlur = () => {
      const existingAccommodations = [...trip.accommodation];
      const existingIndex = existingAccommodations.findIndex(a => a.city.id === city.id);

      const newAccommodation: Accommodation = {
         id: cityAccommodation?.id || `temp-${Date.now()}`,
         name: accommodationName,
         address: cityAccommodation?.address || '',
         checkIn: cityAccommodation?.checkIn || '',
         checkOut: cityAccommodation?.checkOut || '',
         city: city,
         url: cityAccommodation?.url,
      };

      if (existingIndex !== -1) {
         existingAccommodations[existingIndex] = newAccommodation;
      } else if (accommodationName) {
         existingAccommodations.push(newAccommodation);
      }

      onUpdateTrip({ accommodation: existingAccommodations });
   };

   // Handler for updating notes
   const handleNotesBlur = () => {
      const newNote: Note = {
         id: trip.notes[0]?.id || `temp-${Date.now()}`,
         content: noteContent,
         date: new Date().toISOString().split('T')[0],
      };

      onUpdateTrip({ notes: [newNote] });
   };

   return (
      <div className="grid grid-cols-[300px_1fr_350px] gap-6 h-full">
         <div className="flex flex-col">
            <div className="bg-white rounded-xl shadow-sm p-6 flex-1 overflow-y-auto">
               <div className="space-y-6">
                  <div>
                     <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">Planned Activities</h3>
                        <button
                           onClick={onAddActivity}
                           className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                           title="Add activity"
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
                              <ActivityCard
                                 key={activity.id}
                                 activity={activity}
                                 onDelete={onDeleteActivity}
                              />
                           ))
                        )}
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <div className="flex flex-col gap-4">
            <div className="bg-white rounded-xl shadow-sm p-4 flex flex-col gap-1 justify-center items-center">
               <h2 className="text-2xl font-bold text-gray-800">{city.name}</h2>
               <p className="text-sm text-gray-500">{city.country}</p>
            </div>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden flex-1">
               <CityViewMap city={city} activities={activities} />
            </div>
         </div>

         <div className="flex flex-col">
            <div className="bg-white rounded-xl shadow-sm p-6 flex-1 overflow-y-auto">
               <h3 className="text-lg font-semibold mb-4">City Details</h3>
               <div className="space-y-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-500 mb-1">
                        Accommodation:
                     </label>
                     <input
                        type="text"
                        value={accommodationName}
                        onChange={(e) => setAccommodationName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter accommodation name"
                        onBlur={handleAccommodationBlur}
                     />
                  </div>

                  {onAddFlight && onAddTrain && onDeleteFlight && onDeleteTrain && (
                     <TransportationSection
                        flights={trip.transportation.flights || []}
                        trains={trip.transportation.trainRides || []}
                        onAddFlight={onAddFlight}
                        onAddTrain={onAddTrain}
                        onDeleteFlight={onDeleteFlight}
                        onDeleteTrain={onDeleteTrain}
                     />
                  )}

                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes:
                     </label>
                     <textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        onBlur={handleNotesBlur}
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
