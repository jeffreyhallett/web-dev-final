'use client';

import { useState } from 'react';
import Modal from '@/components/ui/modal';

interface AddTripModalProps {
   isOpen: boolean;
   onClose: () => void;
   onSubmit: (data: { name: string; arrivalDate?: string; departureDate?: string }) => Promise<void>;
}

export default function AddTripModal({ isOpen, onClose, onSubmit }: AddTripModalProps) {
   const [name, setName] = useState('');
   const [arrivalDate, setArrivalDate] = useState('');
   const [departureDate, setDepartureDate] = useState('');
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!name.trim()) {
         setError('Trip name is required');
         return;
      }

      setIsSubmitting(true);
      try {
         await onSubmit({
            name: name.trim(),
            arrivalDate: arrivalDate || undefined,
            departureDate: departureDate || undefined,
         });
         // Reset form
         setName('');
         setArrivalDate('');
         setDepartureDate('');
         onClose();
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Failed to create trip');
      } finally {
         setIsSubmitting(false);
      }
   };

   const handleClose = () => {
      setName('');
      setArrivalDate('');
      setDepartureDate('');
      setError(null);
      onClose();
   };

   return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Create New Trip">
         <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
               <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
               </div>
            )}

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trip Name *
               </label>
               <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., European Adventure 2025"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
               />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Arrival Date
                  </label>
                  <input
                     type="date"
                     value={arrivalDate}
                     onChange={(e) => setArrivalDate(e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Departure Date
                  </label>
                  <input
                     type="date"
                     value={departureDate}
                     onChange={(e) => setDepartureDate(e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
               </div>
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
                  {isSubmitting ? 'Creating...' : 'Create Trip'}
               </button>
            </div>
         </form>
      </Modal>
   );
}
