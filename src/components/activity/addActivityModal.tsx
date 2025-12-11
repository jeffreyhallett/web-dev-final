'use client';

import { useState } from 'react';
import Modal from '@/components/ui/modal';

interface AddActivityModalProps {
   isOpen: boolean;
   onClose: () => void;
   onSubmit: (data: {
      name: string;
      description?: string;
      location?: string;
      scheduledTime?: string;
      inTravelPlan: boolean;
      activityUrl?: string;
      imageUrl?: string;
   }) => Promise<void>;
   cityName: string;
}

export default function AddActivityModal({ isOpen, onClose, onSubmit, cityName }: AddActivityModalProps) {
   const [name, setName] = useState('');
   const [description, setDescription] = useState('');
   const [location, setLocation] = useState('');
   const [scheduledTime, setScheduledTime] = useState('');
   const [inTravelPlan, setInTravelPlan] = useState(true);
   const [activityUrl, setActivityUrl] = useState('');
   const [imageUrl, setImageUrl] = useState('');
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!name.trim()) {
         setError('Activity name is required');
         return;
      }

      setIsSubmitting(true);
      try {
         await onSubmit({
            name: name.trim(),
            description: description.trim() || undefined,
            location: location.trim() || undefined,
            scheduledTime: scheduledTime || undefined,
            inTravelPlan,
            activityUrl: activityUrl.trim() || undefined,
            imageUrl: imageUrl.trim() || undefined,
         });
         // Reset form
         setName('');
         setDescription('');
         setLocation('');
         setScheduledTime('');
         setInTravelPlan(true);
         setActivityUrl('');
         setImageUrl('');
         onClose();
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Failed to add activity');
      } finally {
         setIsSubmitting(false);
      }
   };

   const handleClose = () => {
      setName('');
      setDescription('');
      setLocation('');
      setScheduledTime('');
      setInTravelPlan(true);
      setActivityUrl('');
      setImageUrl('');
      setError(null);
      onClose();
   };

   return (
      <Modal isOpen={isOpen} onClose={handleClose} title={`Add Activity in ${cityName}`} size="lg">
         <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
               <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
               </div>
            )}

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                  Activity Name *
               </label>
               <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Visit the Eiffel Tower"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
               />
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
               </label>
               <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What will you do there?"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
               />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Location
                  </label>
                  <input
                     type="text"
                     value={location}
                     onChange={(e) => setLocation(e.target.value)}
                     placeholder="e.g., Champ de Mars"
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Scheduled Time
                  </label>
                  <input
                     type="datetime-local"
                     value={scheduledTime}
                     onChange={(e) => setScheduledTime(e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Activity URL
                  </label>
                  <input
                     type="url"
                     value={activityUrl}
                     onChange={(e) => setActivityUrl(e.target.value)}
                     placeholder="https://..."
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Image URL
                  </label>
                  <input
                     type="url"
                     value={imageUrl}
                     onChange={(e) => setImageUrl(e.target.value)}
                     placeholder="https://..."
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
               </div>
            </div>

            <div className="flex items-center gap-2">
               <input
                  type="checkbox"
                  id="inTravelPlan"
                  checked={inTravelPlan}
                  onChange={(e) => setInTravelPlan(e.target.checked)}
                  className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-blue-500"
               />
               <label htmlFor="inTravelPlan" className="text-sm text-gray-700">
                  Add to travel plan
               </label>
            </div>

            <div className="flex justify-end gap-3 pt-4">
               <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  disabled={isSubmitting}
               >
                  Cancel
               </button>
               <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  {isSubmitting ? 'Adding...' : 'Add Activity'}
               </button>
            </div>
         </form>
      </Modal>
   );
}
