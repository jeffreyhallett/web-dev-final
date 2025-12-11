'use client';

import { useState, useEffect } from 'react';
import { Accommodation, City } from '@/types';
import { PlusIcon, TrashIcon, HomeIcon, ChevronDownIcon, ChevronRightIcon, PencilIcon } from '@heroicons/react/24/outline';

interface AccommodationSectionProps {
   accommodation?: Accommodation;
   city: City;
   onUpdate: (accommodation: Accommodation) => void;
   onDelete?: () => void;
}

export default function AccommodationSection({
   accommodation,
   city,
   onUpdate,
   onDelete,
}: AccommodationSectionProps) {
   const [showAddForm, setShowAddForm] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [isExpanded, setIsExpanded] = useState(false);

   // Form state
   const [name, setName] = useState('');
   const [address, setAddress] = useState('');
   const [checkIn, setCheckIn] = useState('');
   const [checkOut, setCheckOut] = useState('');
   const [url, setUrl] = useState('');
   const [confirmationNumber, setConfirmationNumber] = useState('');
   const [notes, setNotes] = useState('');

   // Initialize form with existing accommodation data
   useEffect(() => {
      if (accommodation) {
         setName(accommodation.name || '');
         setAddress(accommodation.address || '');
         setCheckIn(accommodation.checkIn || '');
         setCheckOut(accommodation.checkOut || '');
         setUrl(accommodation.url || '');
         setConfirmationNumber(accommodation.confirmationNumber || '');
         setNotes(accommodation.notes || '');
      } else {
         resetForm();
      }
   }, [accommodation]);

   const resetForm = () => {
      setName('');
      setAddress('');
      setCheckIn('');
      setCheckOut('');
      setUrl('');
      setConfirmationNumber('');
      setNotes('');
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) return;

      setIsSubmitting(true);
      try {
         onUpdate({
            id: accommodation?.id || `temp-${Date.now()}`,
            name: name.trim(),
            address: address.trim(),
            checkIn,
            checkOut,
            city,
            url: url.trim() || undefined,
            confirmationNumber: confirmationNumber.trim() || undefined,
            notes: notes.trim() || undefined,
         });
         setShowAddForm(false);
      } catch (err) {
         console.error('Failed to update accommodation:', err);
      } finally {
         setIsSubmitting(false);
      }
   };

   const formatDate = (dateString?: string) => {
      if (!dateString) return null;
      try {
         const date = new Date(dateString);
         return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
         });
      } catch {
         return dateString;
      }
   };

   const hasAccommodation = accommodation && accommodation.name;
   const hasExpandableDetails = accommodation && (accommodation.confirmationNumber || accommodation.url || accommodation.notes);

   return (
      <div className="space-y-3">
         <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
               Accommodation
            </label>
            <button
               onClick={() => setShowAddForm(!showAddForm)}
               className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
               title={showAddForm ? 'Cancel' : hasAccommodation ? 'Edit accommodation' : 'Add accommodation'}
            >
               <PlusIcon className={`w-4 h-4 transition-transform ${showAddForm ? 'rotate-45' : ''}`} />
            </button>
         </div>

         {/* Add/Edit Form */}
         {showAddForm && (
            <div className="bg-gray-50 rounded-lg p-3">
               <form onSubmit={handleSubmit} className="space-y-2">
                  <input
                     type="text"
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     placeholder="Hotel name"
                     className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                     required
                  />
                  <input
                     type="text"
                     value={address}
                     onChange={(e) => setAddress(e.target.value)}
                     placeholder="Address"
                     className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="grid grid-cols-2 gap-2">
                     <div>
                        <label className="block text-xs text-gray-500 mb-0.5">Check-in</label>
                        <input
                           type="date"
                           value={checkIn}
                           onChange={(e) => setCheckIn(e.target.value)}
                           className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                     </div>
                     <div>
                        <label className="block text-xs text-gray-500 mb-0.5">Check-out</label>
                        <input
                           type="date"
                           value={checkOut}
                           onChange={(e) => setCheckOut(e.target.value)}
                           className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                     </div>
                  </div>
                  <input
                     type="text"
                     value={confirmationNumber}
                     onChange={(e) => setConfirmationNumber(e.target.value)}
                     placeholder="Confirmation number (optional)"
                     className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                     type="url"
                     value={url}
                     onChange={(e) => setUrl(e.target.value)}
                     placeholder="Booking URL (optional)"
                     className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                  />
                  <textarea
                     value={notes}
                     onChange={(e) => setNotes(e.target.value)}
                     placeholder="Notes (optional)"
                     rows={2}
                     className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                  <button
                     type="submit"
                     disabled={isSubmitting}
                     className="w-full px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                     {isSubmitting ? 'Saving...' : hasAccommodation ? 'Update Accommodation' : 'Add Accommodation'}
                  </button>
               </form>
            </div>
         )}

         {/* Display accommodation */}
         {!showAddForm && (
            <div className="space-y-2">
               {hasAccommodation ? (
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                     <div
                        className="p-2 flex items-start justify-between group cursor-pointer"
                        onClick={() => setIsExpanded(!isExpanded)}
                     >
                        <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-2">
                              {isExpanded ? (
                                 <ChevronDownIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              ) : (
                                 <ChevronRightIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              )}
                              <HomeIcon className="w-4 h-4 text-purple-500 flex-shrink-0" />
                              <span className="font-medium text-sm truncate">
                                 {accommodation.name}
                              </span>
                           </div>
                           {accommodation.address && (
                              <div className="text-xs text-gray-500 mt-0.5 ml-10 truncate">
                                 {accommodation.address}
                              </div>
                           )}
                           {(accommodation.checkIn || accommodation.checkOut) && (
                              <div className="text-xs text-gray-500 mt-0.5 ml-10">
                                 {formatDate(accommodation.checkIn)}
                                 {accommodation.checkIn && accommodation.checkOut && ' → '}
                                 {formatDate(accommodation.checkOut)}
                              </div>
                           )}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                           <button
                              onClick={(e) => {
                                 e.stopPropagation();
                                 setShowAddForm(true);
                              }}
                              className="p-1 text-gray-400 hover:text-blue-500"
                              title="Edit accommodation"
                           >
                              <PencilIcon className="w-4 h-4" />
                           </button>
                           {onDelete && (
                              <button
                                 onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete();
                                 }}
                                 className="p-1 text-gray-400 hover:text-red-500"
                                 title="Delete accommodation"
                              >
                                 <TrashIcon className="w-4 h-4" />
                              </button>
                           )}
                        </div>
                     </div>

                     {/* Expanded Details */}
                     {isExpanded && (
                        <div className="px-3 pb-3 pt-1 border-t border-gray-200 bg-gray-100 space-y-1.5 ml-4">
                           {accommodation.confirmationNumber ? (
                              <div className="flex items-center gap-2 text-xs">
                                 <span className="text-gray-500 font-medium">Confirmation:</span>
                                 <span className="text-gray-700 font-mono">{accommodation.confirmationNumber}</span>
                              </div>
                           ) : (
                              <div className="text-xs text-gray-400 italic">No confirmation number</div>
                           )}
                           {accommodation.url && (
                              <div className="flex items-center gap-2 text-xs">
                                 <span className="text-gray-500 font-medium">Booking:</span>
                                 <a
                                    href={accommodation.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline truncate"
                                    onClick={(e) => e.stopPropagation()}
                                 >
                                    View booking
                                 </a>
                              </div>
                           )}
                           {accommodation.notes && (
                              <div className="text-xs">
                                 <span className="text-gray-500 font-medium">Notes:</span>
                                 <p className="text-gray-700 mt-0.5">{accommodation.notes}</p>
                              </div>
                           )}
                        </div>
                     )}
                  </div>
               ) : (
                  <p className="text-sm text-gray-500 text-center py-2">
                     No accommodation added yet
                  </p>
               )}
            </div>
         )}
      </div>
   );
}
