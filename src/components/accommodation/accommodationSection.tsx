'use client';

import { useState, useEffect } from 'react';
import { Accommodation, City } from '@/types';

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
   const [isEditing, setIsEditing] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);

   // Form state
   const [name, setName] = useState('');
   const [address, setAddress] = useState('');
   const [checkIn, setCheckIn] = useState('');
   const [checkOut, setCheckOut] = useState('');
   const [url, setUrl] = useState('');

   // Initialize form with existing accommodation data
   useEffect(() => {
      if (accommodation) {
         setName(accommodation.name || '');
         setAddress(accommodation.address || '');
         setCheckIn(accommodation.checkIn || '');
         setCheckOut(accommodation.checkOut || '');
         setUrl(accommodation.url || '');
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
         });
         setIsEditing(false);
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
            year: 'numeric',
         });
      } catch {
         return dateString;
      }
   };

   const calculateNights = () => {
      if (!checkIn || !checkOut) return 0;
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 0;
   };

   const hasAccommodation = accommodation && accommodation.name;
   const nights = calculateNights();

   // Edit form
   if (isEditing) {
      return (
         <div
            className="rounded-lg overflow-hidden"
            style={{
               background: 'linear-gradient(135deg, #f5f0e6 0%, #e8e0d0 100%)',
               border: '2px solid #5c5445',
            }}
         >
            {/* Header */}
            <div
               className="px-3 py-2 flex items-center justify-between"
               style={{
                  background: '#5c5445',
                  borderBottom: '2px solid #c9a227',
               }}
            >
               <span className="text-sm font-bold" style={{ color: '#e8d48b' }}>
                  {hasAccommodation ? '✏️ Edit Reservation' : '📝 New Reservation'}
               </span>
               <button
                  onClick={() => setIsEditing(false)}
                  className="text-xs px-2 py-1 rounded"
                  style={{ color: '#e8d48b' }}
               >
                  Cancel
               </button>
            </div>

            <form onSubmit={handleSubmit} className="p-3 space-y-3">
               <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: '#5c5445' }}>
                     HOTEL / PROPERTY NAME *
                  </label>
                  <input
                     type="text"
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     placeholder="e.g., Grand Hotel Paris"
                     className="w-full px-3 py-2 rounded text-sm"
                     style={{
                        background: '#fff',
                        border: '1px solid #5c5445',
                        color: '#2c2416',
                     }}
                     required
                  />
               </div>

               <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: '#5c5445' }}>
                     ADDRESS
                  </label>
                  <input
                     type="text"
                     value={address}
                     onChange={(e) => setAddress(e.target.value)}
                     placeholder="e.g., 123 Rue de Rivoli"
                     className="w-full px-3 py-2 rounded text-sm"
                     style={{
                        background: '#fff',
                        border: '1px solid #5c5445',
                        color: '#2c2416',
                     }}
                  />
               </div>

               <div className="grid grid-cols-2 gap-3">
                  <div>
                     <label className="block text-xs font-bold mb-1" style={{ color: '#5c5445' }}>
                        CHECK-IN
                     </label>
                     <input
                        type="date"
                        value={checkIn}
                        onChange={(e) => setCheckIn(e.target.value)}
                        className="w-full px-3 py-2 rounded text-sm"
                        style={{
                           background: '#fff',
                           border: '1px solid #5c5445',
                           color: '#2c2416',
                        }}
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-bold mb-1" style={{ color: '#5c5445' }}>
                        CHECK-OUT
                     </label>
                     <input
                        type="date"
                        value={checkOut}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full px-3 py-2 rounded text-sm"
                        style={{
                           background: '#fff',
                           border: '1px solid #5c5445',
                           color: '#2c2416',
                        }}
                     />
                  </div>
               </div>

               {nights > 0 && (
                  <div className="text-center py-1">
                     <span
                        className="inline-block px-3 py-1 rounded-full text-xs font-bold"
                        style={{
                           background: '#c9a227',
                           color: '#2c2416',
                        }}
                     >
                        {nights} {nights === 1 ? 'night' : 'nights'}
                     </span>
                  </div>
               )}

               <div>
                  <label className="block text-xs font-bold mb-1" style={{ color: '#5c5445' }}>
                     BOOKING URL
                  </label>
                  <input
                     type="url"
                     value={url}
                     onChange={(e) => setUrl(e.target.value)}
                     placeholder="https://..."
                     className="w-full px-3 py-2 rounded text-sm"
                     style={{
                        background: '#fff',
                        border: '1px solid #5c5445',
                        color: '#2c2416',
                     }}
                  />
               </div>

               <button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="w-full py-2 rounded font-bold text-sm transition-all hover:scale-[1.02] disabled:opacity-50"
                  style={{
                     background: 'linear-gradient(135deg, #c9a227, #a88520)',
                     color: '#2c2416',
                     border: '2px solid #2c2416',
                     boxShadow: '2px 2px 0 #5c5445',
                  }}
               >
                  {isSubmitting ? 'Saving...' : '✓ Confirm Reservation'}
               </button>
            </form>
         </div>
      );
   }

   // Display view
   return (
      <div>
         {hasAccommodation ? (
            <div
               className="rounded-lg overflow-hidden relative group cursor-pointer transition-all hover:scale-[1.01]"
               onClick={() => setIsEditing(true)}
               style={{
                  background: 'linear-gradient(135deg, #fff 0%, #f5f0e6 100%)',
                  border: '2px solid #5c5445',
                  boxShadow: '3px 3px 0 rgba(44, 36, 22, 0.2)',
               }}
            >
               {/* Hotel voucher style header */}
               <div
                  className="px-3 py-2 flex items-center justify-between"
                  style={{
                     background: 'linear-gradient(135deg, #8b4513 0%, #a0522d 100%)',
                     borderBottom: '2px dashed #c9a227',
                  }}
               >
                  <span className="text-xs font-bold tracking-wider" style={{ color: '#e8d48b' }}>
                     HOTEL VOUCHER
                  </span>
                  {nights > 0 && (
                     <span
                        className="px-2 py-0.5 rounded text-xs font-bold"
                        style={{
                           background: '#c9a227',
                           color: '#2c2416',
                        }}
                     >
                        {nights} {nights === 1 ? 'NIGHT' : 'NIGHTS'}
                     </span>
                  )}
               </div>

               {/* Content */}
               <div className="p-3">
                  <h4
                     className="font-bold text-lg mb-1"
                     style={{ color: '#2c2416', fontFamily: 'Georgia, serif' }}
                  >
                     {accommodation.name}
                  </h4>

                  {accommodation.address && (
                     <p className="text-sm mb-2 flex items-start gap-1" style={{ color: '#5c5445' }}>
                        <span>📍</span>
                        <span>{accommodation.address}</span>
                     </p>
                  )}

                  {(accommodation.checkIn || accommodation.checkOut) && (
                     <div
                        className="flex items-center gap-3 text-sm py-2 px-3 rounded mt-2"
                        style={{ background: '#f5f0e6' }}
                     >
                        {accommodation.checkIn && (
                           <div>
                              <div className="text-xs font-bold" style={{ color: '#5c5445' }}>
                                 CHECK-IN
                              </div>
                              <div style={{ color: '#2c2416' }}>
                                 {formatDate(accommodation.checkIn)}
                              </div>
                           </div>
                        )}
                        {accommodation.checkIn && accommodation.checkOut && (
                           <div style={{ color: '#c9a227' }}>→</div>
                        )}
                        {accommodation.checkOut && (
                           <div>
                              <div className="text-xs font-bold" style={{ color: '#5c5445' }}>
                                 CHECK-OUT
                              </div>
                              <div style={{ color: '#2c2416' }}>
                                 {formatDate(accommodation.checkOut)}
                              </div>
                           </div>
                        )}
                     </div>
                  )}

                  {accommodation.url && (
                     <a
                        href={accommodation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs mt-2 hover:underline"
                        style={{ color: '#1e4d8c' }}
                     >
                        🔗 View Booking
                     </a>
                  )}
               </div>

               {/* Confirmed stamp */}
               <div
                  className="absolute bottom-3 right-3 px-2 py-1 text-xs font-bold"
                  style={{
                     color: '#2d5a3d',
                     border: '2px solid #2d5a3d',
                     transform: 'rotate(-8deg)',
                     opacity: 0.7,
                  }}
               >
                  CONFIRMED
               </div>

               {/* Delete button */}
               {onDelete && (
                  <button
                     onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                     }}
                     className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                     style={{
                        background: 'rgba(196, 30, 58, 0.1)',
                        color: '#c41e3a',
                     }}
                     title="Delete"
                  >
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                     </svg>
                  </button>
               )}

               {/* Edit hint */}
               <div
                  className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: '#5c5445' }}
               >
                  Click to edit
               </div>
            </div>
         ) : (
            <button
               onClick={() => setIsEditing(true)}
               className="w-full py-6 rounded-lg text-center transition-all hover:scale-[1.02]"
               style={{
                  background: 'linear-gradient(135deg, #f5f0e6 0%, #e8e0d0 100%)',
                  border: '2px dashed #5c5445',
               }}
            >
               <div className="text-3xl mb-2">🏨</div>
               <p className="text-sm font-medium" style={{ color: '#5c5445' }}>
                  No accommodation added
               </p>
               <p
                  className="text-xs font-bold mt-1"
                  style={{ color: '#c9a227' }}
               >
                  + Add your stay
               </p>
            </button>
         )}
      </div>
   );
}
