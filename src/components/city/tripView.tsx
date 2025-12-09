'use client';

import { City, Activity, Trip, Accommodation, Note } from '@/types';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { PlusIcon, SparklesIcon } from '@heroicons/react/24/outline';
import CityViewMap from '@/components/map/cityViewMap';
import ActivityCard from '@/components/ui/activityCard';
import TransportationSection from '@/components/transportation/transportationSection';
import AccommodationSection from '@/components/accommodation/accommodationSection';
import RecommendationsModal from '@/components/activity/recommendationsModal';
import { useRecommendations } from '@/lib/api/hooks';
import { RecommendedActivity } from '@/lib/api/client';

interface TripViewProps {
   trip: Trip;
   city: City;
   activities: Activity[];
   onUpdateActivities: (activities: Activity[]) => void;
   onUpdateTrip: (updates: Partial<Trip>) => void;
   onAddActivity?: () => void;
   onDeleteActivity?: (activityId: string) => Promise<void>;
   onAddRecommendedActivity?: (activity: RecommendedActivity) => Promise<void>;
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
   onAddRecommendedActivity,
   onAddFlight,
   onAddTrain,
   onDeleteFlight,
   onDeleteTrain,
}: TripViewProps) {
   // Local state for form inputs
   const [noteContent, setNoteContent] = useState('');
   const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);

   // Get existing activity names for recommendations context
   const existingActivityNames = useMemo(() => {
      return activities.filter(a => a.inTravelPlan).map(a => a.name);
   }, [activities]);

   // Recommendations hook
   const {
      data: recommendationsData,
      isLoading: isLoadingRecommendations,
      error: recommendationsError,
      fetch: fetchRecommendations,
   } = useRecommendations(city.name, city.country, existingActivityNames);

   // Handle adding a recommended activity
   const handleAddRecommendedActivity = useCallback(
      async (activity: RecommendedActivity) => {
         if (onAddRecommendedActivity) {
            await onAddRecommendedActivity(activity);
         }
      },
      [onAddRecommendedActivity]
   );

   // Get accommodations for this city
   const cityAccommodation = trip.accommodation.find(a => a.city.id === city.id);

   // Initialize local state from trip data
   useEffect(() => {
      // Get notes (notes are trip-level, not city-specific)
      setNoteContent(trip.notes[0]?.content || '');
   }, [city.id, trip.notes]);

   const plannedActivities = activities.filter((a) => a.inTravelPlan === true);

   // Handler for updating accommodation
   const handleAccommodationUpdate = (accommodation: Accommodation) => {
      const existingAccommodations = [...trip.accommodation];
      const existingIndex = existingAccommodations.findIndex(a => a.city.id === city.id);

      if (existingIndex !== -1) {
         existingAccommodations[existingIndex] = accommodation;
      } else {
         existingAccommodations.push(accommodation);
      }

      onUpdateTrip({ accommodation: existingAccommodations });
   };

   // Handler for deleting accommodation
   const handleAccommodationDelete = () => {
      const updatedAccommodations = trip.accommodation.filter(a => a.city.id !== city.id);
      onUpdateTrip({ accommodation: updatedAccommodations });
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
      <>
         <div className="grid grid-cols-[300px_1fr_350px] gap-6 h-full min-h-0">
            <div className="flex flex-col min-h-0">
               <div className="bg-white rounded-xl shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
                  {/* Fixed Header */}
                  <div className="flex-shrink-0 flex justify-between items-center p-4 border-b border-gray-100">
                     <h3 className="text-lg font-semibold">Planned Activities</h3>
                     <button
                        onClick={onAddActivity}
                        className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Add activity"
                     >
                        <PlusIcon className="w-5 h-5" />
                     </button>
                  </div>

                  {/* Scrollable Activities List */}
                  <div className="flex-1 min-h-0 overflow-y-auto p-4">
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

                  {/* Fixed Footer Button */}
                  {onAddRecommendedActivity && (
                     <div className="flex-shrink-0 p-4 border-t border-gray-100">
                        <button
                           onClick={() => setShowRecommendationsModal(true)}
                           className="w-full py-3 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md hover:shadow-lg"
                        >
                           <SparklesIcon className="w-5 h-5" />
                           Get AI Suggestions
                        </button>
                     </div>
                  )}
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
                     <AccommodationSection
                        accommodation={cityAccommodation}
                        city={city}
                        onUpdate={handleAccommodationUpdate}
                        onDelete={cityAccommodation ? handleAccommodationDelete : undefined}
                     />

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

         {/* Recommendations Modal */}
         <RecommendationsModal
            isOpen={showRecommendationsModal}
            onClose={() => setShowRecommendationsModal(false)}
            recommendations={recommendationsData?.recommendations || []}
            isLoading={isLoadingRecommendations}
            error={recommendationsError}
            onFetchRecommendations={fetchRecommendations}
            onAddToTrip={handleAddRecommendedActivity}
            cityName={city.name}
         />
      </>
   );
}
