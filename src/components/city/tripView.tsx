'use client';

import { City, Activity, Trip, Accommodation, Note } from '@/types';
import { useState, useEffect, useMemo, useCallback } from 'react';
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
   const [noteContent, setNoteContent] = useState('');
   const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);

   const existingActivityNames = useMemo(() => {
      return activities.filter(a => a.inTravelPlan).map(a => a.name);
   }, [activities]);

   const {
      data: recommendationsData,
      isLoading: isLoadingRecommendations,
      error: recommendationsError,
      fetch: fetchRecommendations,
   } = useRecommendations(city.name, city.country, existingActivityNames);

   const handleAddRecommendedActivity = useCallback(
      async (activity: RecommendedActivity) => {
         if (onAddRecommendedActivity) {
            await onAddRecommendedActivity(activity);
         }
      },
      [onAddRecommendedActivity]
   );

   const cityAccommodation = trip.accommodation.find(a => a.city.id === city.id);

   useEffect(() => {
      setNoteContent(trip.notes[0]?.content || '');
   }, [city.id, trip.notes]);

   const plannedActivities = activities.filter((a) => a.inTravelPlan === true);

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

   const handleAccommodationDelete = () => {
      const updatedAccommodations = trip.accommodation.filter(a => a.city.id !== city.id);
      onUpdateTrip({ accommodation: updatedAccommodations });
   };

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
         <div className="space-y-4">
            {/* City Header - Postcard style */}
            <div
               className="rounded-lg overflow-hidden relative"
               style={{
                  background: 'linear-gradient(135deg, #fff 0%, #f5f0e6 100%)',
                  border: '2px solid #5c5445',
                  boxShadow: '4px 4px 0 rgba(44, 36, 22, 0.2)',
               }}
            >
               {/* Postage stamp decoration */}
               <div
                  className="absolute top-3 right-3 w-16 h-20 flex flex-col items-center justify-center"
                  style={{
                     background: 'repeating-linear-gradient(45deg, #c41e3a, #c41e3a 2px, #fff 2px, #fff 4px)',
                     border: '1px dashed #5c5445',
                  }}
               >
                  <span className="text-2xl">🏛️</span>
                  <span className="text-xs font-bold" style={{ color: '#2c2416' }}>
                     {city.country.substring(0, 3).toUpperCase()}
                  </span>
               </div>

               <div className="p-6 pr-24">
                  <div className="flex items-center gap-2 mb-1">
                     <span
                        className="text-xs font-bold tracking-widest uppercase"
                        style={{ color: '#c41e3a' }}
                     >
                        Currently Visiting
                     </span>
                  </div>
                  <h2
                     className="text-3xl font-bold"
                     style={{ color: '#2c2416', fontFamily: 'Georgia, serif' }}
                  >
                     {city.name}
                  </h2>
                  <p className="text-sm mt-1" style={{ color: '#5c5445' }}>
                     {city.country} • {city.latitude.toFixed(2)}°N, {city.longitude.toFixed(2)}°E
                  </p>
               </div>

               {/* Decorative border */}
               <div
                  className="h-1"
                  style={{
                     background: 'linear-gradient(90deg, #c9a227, #e8d48b, #c9a227)',
                  }}
               />
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
               {/* Activities Column */}
               <div
                  className="rounded-lg overflow-hidden"
                  style={{
                     background: 'linear-gradient(180deg, #fff 0%, #f5f0e6 100%)',
                     border: '2px solid #5c5445',
                     boxShadow: '4px 4px 0 rgba(44, 36, 22, 0.2)',
                  }}
               >
                  {/* Header */}
                  <div
                     className="px-4 py-3 flex justify-between items-center"
                     style={{
                        background: 'linear-gradient(135deg, #2c2416 0%, #5c5445 100%)',
                        borderBottom: '3px solid #c9a227',
                     }}
                  >
                     <div className="flex items-center gap-2">
                        <span className="text-xl">📝</span>
                        <h3 className="font-bold" style={{ color: '#e8d48b' }}>
                           Planned Activities
                        </h3>
                     </div>
                     <button
                        onClick={onAddActivity}
                        className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
                        style={{
                           background: 'linear-gradient(135deg, #c9a227, #e8d48b)',
                           color: '#2c2416',
                        }}
                        title="Add activity"
                     >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                     </button>
                  </div>

                  {/* Activities list */}
                  <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                     {plannedActivities.length === 0 ? (
                        <div className="text-center py-8">
                           <div className="text-4xl mb-2">🎯</div>
                           <p className="text-sm" style={{ color: '#5c5445' }}>
                              No activities planned yet
                           </p>
                           <p className="text-xs mt-1" style={{ color: '#5c5445' }}>
                              Add some adventures!
                           </p>
                        </div>
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

                  {/* AI Suggestions button */}
                  {onAddRecommendedActivity && (
                     <div className="p-4 border-t-2 border-dashed" style={{ borderColor: '#e8e0d0' }}>
                        <button
                           onClick={() => setShowRecommendationsModal(true)}
                           className="w-full py-3 px-4 flex items-center justify-center gap-2 rounded-lg font-bold transition-all duration-200 hover:scale-[1.02]"
                           style={{
                              background: 'linear-gradient(135deg, #1e4d8c 0%, #2d5a8c 100%)',
                              color: '#fff',
                              boxShadow: '3px 3px 0 #0f2744',
                              border: '2px solid #0f2744',
                           }}
                        >
                           <span className="text-xl">✨</span>
                           Get AI Suggestions
                        </button>
                     </div>
                  )}
               </div>

               {/* Map Column */}
               <div
                  className="rounded-lg overflow-hidden"
                  style={{
                     background: '#fff',
                     border: '2px solid #5c5445',
                     boxShadow: '4px 4px 0 rgba(44, 36, 22, 0.2)',
                  }}
               >
                  {/* Header */}
                  <div
                     className="px-4 py-3 flex items-center gap-2"
                     style={{
                        background: 'linear-gradient(135deg, #2d5a3d 0%, #4a7c5a 100%)',
                        borderBottom: '3px solid #c9a227',
                     }}
                  >
                     <span className="text-xl">🗺️</span>
                     <h3 className="font-bold" style={{ color: '#e8d48b' }}>
                        Explorer Map
                     </h3>
                  </div>

                  {/* Map */}
                  <div className="h-80">
                     <CityViewMap city={city} activities={activities} />
                  </div>
               </div>

               {/* Details Column */}
               <div className="space-y-4">
                  {/* Accommodation */}
                  <div
                     className="rounded-lg overflow-hidden"
                     style={{
                        background: 'linear-gradient(180deg, #fff 0%, #f5f0e6 100%)',
                        border: '2px solid #5c5445',
                        boxShadow: '4px 4px 0 rgba(44, 36, 22, 0.2)',
                     }}
                  >
                     <div
                        className="px-4 py-3 flex items-center gap-2"
                        style={{
                           background: 'linear-gradient(135deg, #8b4513 0%, #a0522d 100%)',
                           borderBottom: '3px solid #c9a227',
                        }}
                     >
                        <span className="text-xl">🏨</span>
                        <h3 className="font-bold" style={{ color: '#e8d48b' }}>
                           Accommodation
                        </h3>
                     </div>
                     <div className="p-4">
                        <AccommodationSection
                           accommodation={cityAccommodation}
                           city={city}
                           onUpdate={handleAccommodationUpdate}
                           onDelete={cityAccommodation ? handleAccommodationDelete : undefined}
                        />
                     </div>
                  </div>

                  {/* Transportation */}
                  {onAddFlight && onAddTrain && onDeleteFlight && onDeleteTrain && (
                     <div
                        className="rounded-lg overflow-hidden"
                        style={{
                           background: 'linear-gradient(180deg, #fff 0%, #f5f0e6 100%)',
                           border: '2px solid #5c5445',
                           boxShadow: '4px 4px 0 rgba(44, 36, 22, 0.2)',
                        }}
                     >
                        <div
                           className="px-4 py-3 flex items-center gap-2"
                           style={{
                              background: 'linear-gradient(135deg, #1e4d8c 0%, #2d5a8c 100%)',
                              borderBottom: '3px solid #c9a227',
                           }}
                        >
                           <span className="text-xl">✈️</span>
                           <h3 className="font-bold" style={{ color: '#e8d48b' }}>
                              Transportation
                           </h3>
                        </div>
                        <div className="p-4">
                           <TransportationSection
                              flights={trip.transportation.flights || []}
                              trains={trip.transportation.trainRides || []}
                              onAddFlight={onAddFlight}
                              onAddTrain={onAddTrain}
                              onDeleteFlight={onDeleteFlight}
                              onDeleteTrain={onDeleteTrain}
                           />
                        </div>
                     </div>
                  )}

                  {/* Notes */}
                  <div
                     className="rounded-lg overflow-hidden"
                     style={{
                        background: 'linear-gradient(180deg, #fffef5 0%, #fff9e6 100%)',
                        border: '2px solid #5c5445',
                        boxShadow: '4px 4px 0 rgba(44, 36, 22, 0.2)',
                     }}
                  >
                     <div
                        className="px-4 py-3 flex items-center gap-2"
                        style={{
                           background: 'linear-gradient(135deg, #c9a227 0%, #e8d48b 100%)',
                           borderBottom: '3px solid #5c5445',
                        }}
                     >
                        <span className="text-xl">📓</span>
                        <h3 className="font-bold" style={{ color: '#2c2416' }}>
                           Travel Notes
                        </h3>
                     </div>
                     <div className="p-4">
                        <textarea
                           value={noteContent}
                           onChange={(e) => setNoteContent(e.target.value)}
                           onBlur={handleNotesBlur}
                           placeholder="Jot down important notes, reminders, or memories..."
                           rows={4}
                           className="w-full px-3 py-2 rounded-lg resize-none transition-all"
                           style={{
                              background: 'rgba(255, 255, 255, 0.7)',
                              border: '1px solid #e8e0d0',
                              color: '#2c2416',
                              fontFamily: 'Georgia, serif',
                              fontStyle: 'italic',
                           }}
                        />
                        {/* Lined paper effect */}
                        <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: '#5c5445' }}>
                           <span>✎</span>
                           <span>Auto-saved on blur</span>
                        </div>
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
