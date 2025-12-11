'use client';

import { Activity } from '@/types';
import { TrashIcon } from '@heroicons/react/24/outline';

interface ActivityCardProps {
   activity: Activity;
   onDelete?: (activityId: string) => void;
}

export default function ActivityCard({ activity, onDelete }: ActivityCardProps) {
   return (
      <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
         <div className="flex justify-between items-start">
            <div className="flex-1 min-w-0">
               <h4 className="font-medium">{activity.name}</h4>
               {activity.description && (
                  <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
               )}
               {activity.location && (
                  <p className="text-xs text-gray-500 mt-1">{activity.location}</p>
               )}
            </div>
            {onDelete && (
               <button
                  onClick={() => onDelete(activity.id)}
                  className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 ml-2"
                  title="Delete activity"
               >
                  <TrashIcon className="w-4 h-4" />
               </button>
            )}
         </div>
      </div>
   );
}
