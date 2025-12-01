'use client';

import { Activity } from '@/types';

interface ActivityCardProps {
   activity: Activity;
}

export default function ActivityCard({ activity }: ActivityCardProps) {
   return (
      <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
         <div className="flex justify-between items-start">
            <div>
               <h4 className="font-medium">{activity.name}</h4>
               <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
            </div>
         </div>
      </div>
   );
}
