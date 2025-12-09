'use client';

import { Activity } from '@/types';

interface ActivityCardProps {
   activity: Activity;
   onDelete?: (activityId: string) => void;
}

export default function ActivityCard({ activity, onDelete }: ActivityCardProps) {
   return (
      <div
         className="rounded-lg p-3 relative group transition-all hover:scale-[1.01]"
         style={{
            background: 'linear-gradient(135deg, #fff 0%, #f5f0e6 100%)',
            border: '1px solid #e8e0d0',
            boxShadow: '2px 2px 0 rgba(44, 36, 22, 0.1)',
         }}
      >
         {/* Activity content */}
         <div className="flex items-start gap-3">
            <div
               className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
               style={{
                  background: 'linear-gradient(135deg, #c9a227, #e8d48b)',
                  color: '#2c2416',
               }}
            >
               🎯
            </div>

            <div className="flex-1 min-w-0 pr-6">
               <h4
                  className="font-semibold text-sm"
                  style={{ color: '#2c2416', fontFamily: 'Georgia, serif' }}
               >
                  {activity.name}
               </h4>

               {activity.description && (
                  <p
                     className="text-xs mt-0.5 line-clamp-2"
                     style={{ color: '#5c5445' }}
                  >
                     {activity.description}
                  </p>
               )}

               {activity.location && (
                  <p
                     className="text-xs mt-1 flex items-center gap-1"
                     style={{ color: '#5c5445' }}
                  >
                     <span>📍</span>
                     <span className="truncate">{activity.location}</span>
                  </p>
               )}

               {activity.time && (
                  <p
                     className="text-xs mt-0.5 flex items-center gap-1"
                     style={{ color: '#1e4d8c' }}
                  >
                     <span>🕐</span>
                     <span>{new Date(activity.time).toLocaleString()}</span>
                  </p>
               )}
            </div>
         </div>

         {/* Delete button */}
         {onDelete && (
            <button
               onClick={() => onDelete(activity.id)}
               className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
               style={{
                  background: 'rgba(196, 30, 58, 0.1)',
                  color: '#c41e3a',
               }}
               title="Remove activity"
            >
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
            </button>
         )}
      </div>
   );
}
