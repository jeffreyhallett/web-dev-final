'use client';

import { useState, useEffect } from 'react';
import {
   SparklesIcon,
   PlusIcon,
   MapPinIcon,
   ArrowPathIcon,
   CheckIcon,
   ClockIcon,
   LightBulbIcon,
} from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { RecommendedActivity } from '@/lib/api/client';

interface RecommendationsModalProps {
   isOpen: boolean;
   onClose: () => void;
   recommendations: RecommendedActivity[];
   isLoading: boolean;
   error: Error | null;
   onFetchRecommendations: () => void;
   onAddToTrip: (activity: RecommendedActivity) => Promise<void>;
   cityName: string;
}

const categoryConfig: Record<string, { bg: string; text: string; icon: string }> = {
   sightseeing: { bg: 'bg-blue-100', text: 'text-blue-700', icon: '📸' },
   food: { bg: 'bg-orange-100', text: 'text-orange-700', icon: '🍽️' },
   culture: { bg: 'bg-purple-100', text: 'text-purple-700', icon: '🏛️' },
   nature: { bg: 'bg-green-100', text: 'text-green-700', icon: '🌿' },
   entertainment: { bg: 'bg-pink-100', text: 'text-pink-700', icon: '🎭' },
   shopping: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: '🛍️' },
   nightlife: { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: '🌙' },
};

function RecommendationCard({
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
   const config = categoryConfig[activity.category] || categoryConfig.sightseeing;

   return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
         <div className="flex gap-4">
            <div className="flex-1">
               {/* Category badge */}
               <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${config.bg} ${config.text}`}>
                     {config.icon} {activity.category}
                  </span>
                  {activity.estimatedDuration && (
                     <span className="text-xs text-gray-500 flex items-center gap-1">
                        <ClockIcon className="w-3 h-3" />
                        {activity.estimatedDuration}
                     </span>
                  )}
               </div>

               {/* Name */}
               <h3 className="font-semibold text-gray-900 mb-1">{activity.name}</h3>

               {/* Description */}
               <p className="text-sm text-gray-600 mb-2">{activity.description}</p>

               {/* Location */}
               {activity.location && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                     <MapPinIcon className="w-3.5 h-3.5 flex-shrink-0" />
                     <span>{activity.location}</span>
                  </div>
               )}

               {/* Tip */}
               {activity.tip && (
                  <div className="flex items-start gap-1.5 text-xs bg-amber-50 text-amber-800 p-2 rounded-lg">
                     <LightBulbIcon className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                     <span>{activity.tip}</span>
                  </div>
               )}
            </div>

            {/* Add button */}
            <div className="flex-shrink-0">
               <button
                  onClick={onAdd}
                  disabled={isAdding || isAdded}
                  className={`p-2 rounded-lg transition-colors ${
                     isAdded
                        ? 'bg-green-100 text-green-600'
                        : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-600'
                  } disabled:opacity-50`}
                  title={isAdded ? 'Added to plan' : 'Add to travel plan'}
               >
                  {isAdding ? (
                     <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  ) : isAdded ? (
                     <CheckIcon className="w-5 h-5" />
                  ) : (
                     <PlusIcon className="w-5 h-5" />
                  )}
               </button>
            </div>
         </div>
      </div>
   );
}

export default function RecommendationsModal({
   isOpen,
   onClose,
   recommendations,
   isLoading,
   error,
   onFetchRecommendations,
   onAddToTrip,
   cityName,
}: RecommendationsModalProps) {
   const [addingActivityName, setAddingActivityName] = useState<string | null>(null);
   const [addedActivities, setAddedActivities] = useState<Set<string>>(new Set());

   // Fetch recommendations when modal opens and there are none
   useEffect(() => {
      if (isOpen && recommendations.length === 0 && !isLoading && !error) {
         onFetchRecommendations();
      }
   }, [isOpen, recommendations.length, isLoading, error, onFetchRecommendations]);

   // Reset added activities when recommendations change
   useEffect(() => {
      setAddedActivities(new Set());
   }, [recommendations]);

   const handleAddToTrip = async (activity: RecommendedActivity) => {
      setAddingActivityName(activity.name);
      try {
         await onAddToTrip(activity);
         setAddedActivities(prev => new Set(prev).add(activity.name));
      } finally {
         setAddingActivityName(null);
      }
   };

   // Handle escape key and backdrop click
   useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
         if (e.key === 'Escape' && isOpen) {
            onClose();
         }
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
   }, [isOpen, onClose]);

   useEffect(() => {
      if (isOpen) {
         document.body.style.overflow = 'hidden';
      } else {
         document.body.style.overflow = 'unset';
      }
      return () => {
         document.body.style.overflow = 'unset';
      };
   }, [isOpen]);

   if (!isOpen) return null;

   const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
         onClose();
      }
   };

   return (
      <div
         className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
         onClick={handleBackdropClick}
      >
         <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[85vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-indigo-500 to-purple-500">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                     <SparklesIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                     <h2 className="text-lg font-semibold text-white">AI Recommendations</h2>
                     <p className="text-sm text-white/80">Things to do in {cityName}</p>
                  </div>
               </div>
               <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
               >
                  <XMarkIcon className="w-5 h-5 text-white" />
               </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
               {/* Loading */}
               {isLoading && (
                  <div className="flex flex-col items-center justify-center py-12">
                     <div className="relative mb-4">
                        <div className="w-16 h-16 border-4 border-indigo-200 rounded-full"></div>
                        <div className="absolute top-0 w-16 h-16 border-4 border-indigo-500 rounded-full animate-spin border-t-transparent"></div>
                     </div>
                     <p className="text-gray-600 font-medium">Finding amazing activities...</p>
                     <p className="text-sm text-gray-400 mt-1">Powered by AI</p>
                  </div>
               )}

               {/* Error */}
               {error && !isLoading && (
                  <div className="flex flex-col items-center justify-center py-12">
                     <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <XMarkIcon className="w-8 h-8 text-red-500" />
                     </div>
                     <p className="text-gray-600 font-medium mb-2">Something went wrong</p>
                     <p className="text-sm text-gray-500 mb-4">{error.message}</p>
                     <button
                        onClick={onFetchRecommendations}
                        className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                     >
                        Try Again
                     </button>
                  </div>
               )}

               {/* Recommendations list */}
               {!isLoading && !error && recommendations.length > 0 && (
                  <div className="space-y-4">
                     {recommendations.map((activity, index) => (
                        <RecommendationCard
                           key={`${activity.name}-${index}`}
                           activity={activity}
                           onAdd={() => handleAddToTrip(activity)}
                           isAdding={addingActivityName === activity.name}
                           isAdded={addedActivities.has(activity.name)}
                        />
                     ))}
                  </div>
               )}

               {/* Empty state (shouldn't happen often due to auto-fetch) */}
               {!isLoading && !error && recommendations.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12">
                     <SparklesIcon className="w-12 h-12 text-indigo-300 mb-4" />
                     <p className="text-gray-600 font-medium mb-4">No recommendations yet</p>
                     <button
                        onClick={onFetchRecommendations}
                        className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
                     >
                        Get Recommendations
                     </button>
                  </div>
               )}
            </div>

            {/* Footer */}
            {!isLoading && recommendations.length > 0 && (
               <div className="px-6 py-4 border-t border-gray-100 bg-white flex justify-between items-center">
                  <button
                     onClick={() => {
                        setAddedActivities(new Set());
                        onFetchRecommendations();
                     }}
                     className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                     <ArrowPathIcon className="w-4 h-4" />
                     Get new suggestions
                  </button>
                  <button
                     onClick={onClose}
                     className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                  >
                     Done
                  </button>
               </div>
            )}
         </div>
      </div>
   );
}
