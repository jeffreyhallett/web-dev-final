'use client';

import { useState, useMemo } from 'react';
import {
   SparklesIcon,
   PlusIcon,
   MapPinIcon,
   ClockIcon,
   LightBulbIcon,
   ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { RecommendedActivity } from '@/lib/api/client';

interface RecommendedActivitiesProps {
   recommendations: RecommendedActivity[];
   isLoading: boolean;
   error: Error | null;
   onFetchRecommendations: () => void;
   onAddToTrip: (activity: RecommendedActivity) => void;
   cityName: string;
}

const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
   sightseeing: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
   food: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
   culture: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
   nature: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
   entertainment: { bg: 'bg-pink-50', text: 'text-pink-700', border: 'border-pink-200' },
   shopping: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
   nightlife: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
};

const categoryEmojis: Record<string, string> = {
   sightseeing: 'camera',
   food: 'utensils',
   culture: 'landmark',
   nature: 'tree',
   entertainment: 'ticket',
   shopping: 'shopping-bag',
   nightlife: 'moon',
};

function RecommendationCard({
   activity,
   onAdd,
   isAdding,
}: {
   activity: RecommendedActivity;
   onAdd: () => void;
   isAdding: boolean;
}) {
   const colors = categoryColors[activity.category] || categoryColors.sightseeing;

   return (
      <div
         className={`p-4 rounded-lg border ${colors.border} ${colors.bg} transition-all hover:shadow-md`}
      >
         <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
               <div className="flex items-center gap-2 mb-1">
                  <span
                     className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.bg} ${colors.text} border ${colors.border}`}
                  >
                     {activity.category}
                  </span>
               </div>
               <h4 className="font-semibold text-gray-900">{activity.name}</h4>
               <p className="text-sm text-gray-600 mt-1">{activity.description}</p>

               <div className="mt-3 space-y-1">
                  {activity.location && (
                     <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{activity.location}</span>
                     </div>
                  )}
                  {activity.estimatedDuration && (
                     <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <ClockIcon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{activity.estimatedDuration}</span>
                     </div>
                  )}
               </div>

               {activity.tip && (
                  <div className="mt-3 p-2 bg-white/50 rounded border border-gray-200">
                     <div className="flex items-start gap-1.5">
                        <LightBulbIcon className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-gray-600 italic">{activity.tip}</p>
                     </div>
                  </div>
               )}
            </div>

            <button
               onClick={onAdd}
               disabled={isAdding}
               className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors flex-shrink-0 disabled:opacity-50"
               title="Add to travel plan"
            >
               {isAdding ? (
                  <ArrowPathIcon className="w-4 h-4 text-gray-600 animate-spin" />
               ) : (
                  <PlusIcon className="w-4 h-4 text-gray-600" />
               )}
            </button>
         </div>
      </div>
   );
}

export default function RecommendedActivities({
   recommendations,
   isLoading,
   error,
   onFetchRecommendations,
   onAddToTrip,
   cityName,
}: RecommendedActivitiesProps) {
   const [addingActivityName, setAddingActivityName] = useState<string | null>(null);
   const [isExpanded, setIsExpanded] = useState(true);

   const handleAddToTrip = async (activity: RecommendedActivity) => {
      setAddingActivityName(activity.name);
      try {
         await onAddToTrip(activity);
      } finally {
         setAddingActivityName(null);
      }
   };

   // Determine if we should show the empty state
   const showEmptyState = !isLoading && !error && recommendations.length === 0;
   const showRecommendations = !isLoading && !error && recommendations.length > 0;

   return (
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 overflow-hidden">
         <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full p-4 flex items-center justify-between hover:bg-white/30 transition-colors"
         >
            <div className="flex items-center gap-2">
               <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg">
                  <SparklesIcon className="w-4 h-4 text-white" />
               </div>
               <h3 className="font-semibold text-gray-800">AI Recommendations</h3>
               {recommendations.length > 0 && (
                  <span className="text-xs text-gray-500 bg-white/60 px-2 py-0.5 rounded-full">
                     {recommendations.length} suggestions
                  </span>
               )}
            </div>
            <svg
               className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
               fill="none"
               stroke="currentColor"
               viewBox="0 0 24 24"
            >
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
         </button>

         {isExpanded && (
            <div className="px-4 pb-4">
               {/* Loading State */}
               {isLoading && (
                  <div className="flex flex-col items-center justify-center py-8">
                     <div className="relative">
                        <div className="w-12 h-12 border-4 border-indigo-200 rounded-full"></div>
                        <div className="absolute top-0 w-12 h-12 border-4 border-indigo-500 rounded-full animate-spin border-t-transparent"></div>
                     </div>
                     <p className="mt-4 text-sm text-gray-600">
                        Finding activities in {cityName}...
                     </p>
                     <p className="text-xs text-gray-400 mt-1">Powered by AI</p>
                  </div>
               )}

               {/* Error State */}
               {error && (
                  <div className="py-6 text-center">
                     <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-3">
                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                     </div>
                     <p className="text-sm text-gray-600 mb-3">
                        {error.message || 'Failed to get recommendations'}
                     </p>
                     <button
                        onClick={onFetchRecommendations}
                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                     >
                        Try again
                     </button>
                  </div>
               )}

               {/* Empty State */}
               {showEmptyState && (
                  <div className="py-6 text-center">
                     <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100 mb-3">
                        <SparklesIcon className="w-6 h-6 text-indigo-500" />
                     </div>
                     <p className="text-sm text-gray-600 mb-3">
                        Get AI-powered activity suggestions for {cityName}
                     </p>
                     <button
                        onClick={onFetchRecommendations}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-colors"
                     >
                        <SparklesIcon className="w-4 h-4" />
                        Get Recommendations
                     </button>
                  </div>
               )}

               {/* Recommendations List */}
               {showRecommendations && (
                  <div className="space-y-3">
                     {recommendations.map((activity, index) => (
                        <RecommendationCard
                           key={`${activity.name}-${index}`}
                           activity={activity}
                           onAdd={() => handleAddToTrip(activity)}
                           isAdding={addingActivityName === activity.name}
                        />
                     ))}

                     <button
                        onClick={onFetchRecommendations}
                        className="w-full py-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center justify-center gap-1 hover:bg-white/30 rounded-lg transition-colors"
                     >
                        <ArrowPathIcon className="w-4 h-4" />
                        Get new recommendations
                     </button>
                  </div>
               )}
            </div>
         )}
      </div>
   );
}
