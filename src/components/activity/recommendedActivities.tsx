'use client';

import { useState } from 'react';
import {
   SparklesIcon,
   PlusIcon,
   MapPinIcon,
   ArrowPathIcon,
   ChevronDownIcon,
   CheckIcon,
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

const categoryColors: Record<string, string> = {
   sightseeing: 'bg-blue-100 text-blue-700',
   food: 'bg-orange-100 text-orange-700',
   culture: 'bg-purple-100 text-purple-700',
   nature: 'bg-green-100 text-green-700',
   entertainment: 'bg-pink-100 text-pink-700',
   shopping: 'bg-yellow-100 text-yellow-700',
   nightlife: 'bg-indigo-100 text-indigo-700',
};

function CompactRecommendationCard({
   activity,
   onAdd,
   isAdding,
   isAdded,
}: {
   activity: RecommendedActivity;
   onAdd: () => void;
   isAdding: boolean;
   isAdded: boolean;
}) {
   const [isExpanded, setIsExpanded] = useState(false);
   const colorClass = categoryColors[activity.category] || categoryColors.sightseeing;

   return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
         {/* Compact header - always visible */}
         <div className="p-3 flex items-center gap-2">
            <button
               onClick={() => setIsExpanded(!isExpanded)}
               className="flex-1 flex items-center gap-2 text-left min-w-0"
            >
               <ChevronDownIcon
                  className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
               />
               <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                     <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${colorClass}`}>
                        {activity.category}
                     </span>
                  </div>
                  <h4 className="font-medium text-sm text-gray-900 truncate mt-0.5">
                     {activity.name}
                  </h4>
               </div>
            </button>
            <button
               onClick={onAdd}
               disabled={isAdding || isAdded}
               className={`p-1.5 rounded-md flex-shrink-0 transition-colors ${
                  isAdded
                     ? 'bg-green-100 text-green-600'
                     : 'bg-gray-100 hover:bg-indigo-100 text-gray-600 hover:text-indigo-600'
               } disabled:opacity-50`}
               title={isAdded ? 'Added to plan' : 'Add to travel plan'}
            >
               {isAdding ? (
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
               ) : isAdded ? (
                  <CheckIcon className="w-4 h-4" />
               ) : (
                  <PlusIcon className="w-4 h-4" />
               )}
            </button>
         </div>

         {/* Expandable details */}
         {isExpanded && (
            <div className="px-3 pb-3 pt-0 border-t border-gray-100">
               <p className="text-xs text-gray-600 mt-2">{activity.description}</p>
               {activity.location && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                     <MapPinIcon className="w-3 h-3 flex-shrink-0" />
                     <span className="truncate">{activity.location}</span>
                  </div>
               )}
               {activity.tip && (
                  <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded mt-2 italic">
                     Tip: {activity.tip}
                  </p>
               )}
            </div>
         )}
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
   const [addedActivities, setAddedActivities] = useState<Set<string>>(new Set());
   const [isExpanded, setIsExpanded] = useState(true);

   const handleAddToTrip = async (activity: RecommendedActivity) => {
      setAddingActivityName(activity.name);
      try {
         await onAddToTrip(activity);
         setAddedActivities(prev => new Set(prev).add(activity.name));
      } finally {
         setAddingActivityName(null);
      }
   };

   const showEmptyState = !isLoading && !error && recommendations.length === 0;
   const showRecommendations = !isLoading && !error && recommendations.length > 0;

   return (
      <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 overflow-hidden">
         {/* Header */}
         <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/40 transition-colors"
         >
            <div className="flex items-center gap-2">
               <SparklesIcon className="w-4 h-4 text-indigo-500" />
               <span className="font-medium text-sm text-gray-800">AI Suggestions</span>
               {recommendations.length > 0 && (
                  <span className="text-xs text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded-full">
                     {recommendations.length}
                  </span>
               )}
            </div>
            <ChevronDownIcon
               className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            />
         </button>

         {/* Content */}
         {isExpanded && (
            <div className="px-3 pb-3">
               {/* Loading */}
               {isLoading && (
                  <div className="flex items-center justify-center py-6">
                     <div className="flex items-center gap-2 text-sm text-gray-500">
                        <ArrowPathIcon className="w-4 h-4 animate-spin" />
                        Finding activities...
                     </div>
                  </div>
               )}

               {/* Error */}
               {error && (
                  <div className="py-4 text-center">
                     <p className="text-xs text-red-600 mb-2">{error.message}</p>
                     <button
                        onClick={onFetchRecommendations}
                        className="text-xs text-indigo-600 hover:underline"
                     >
                        Try again
                     </button>
                  </div>
               )}

               {/* Empty - Get Recommendations Button */}
               {showEmptyState && (
                  <button
                     onClick={onFetchRecommendations}
                     className="w-full py-3 flex items-center justify-center gap-2 text-sm font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-colors"
                  >
                     <SparklesIcon className="w-4 h-4" />
                     Get suggestions for {cityName}
                  </button>
               )}

               {/* Recommendations List */}
               {showRecommendations && (
                  <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                     {recommendations.map((activity, index) => (
                        <CompactRecommendationCard
                           key={`${activity.name}-${index}`}
                           activity={activity}
                           onAdd={() => handleAddToTrip(activity)}
                           isAdding={addingActivityName === activity.name}
                           isAdded={addedActivities.has(activity.name)}
                        />
                     ))}
                  </div>
               )}

               {/* Refresh button */}
               {showRecommendations && (
                  <button
                     onClick={() => {
                        setAddedActivities(new Set());
                        onFetchRecommendations();
                     }}
                     className="w-full mt-2 py-2 text-xs text-indigo-600 hover:text-indigo-700 flex items-center justify-center gap-1 hover:bg-white/50 rounded-lg transition-colors"
                  >
                     <ArrowPathIcon className="w-3 h-3" />
                     Get new suggestions
                  </button>
               )}
            </div>
         )}
      </div>
   );
}
