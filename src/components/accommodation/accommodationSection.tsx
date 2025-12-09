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
   const [isExpanded, setIsExpanded] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [showConfetti, setShowConfetti] = useState(false);

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
         setShowConfetti(true);
         setTimeout(() => setShowConfetti(false), 2000);
         setIsExpanded(false);
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

   const calculateNights = () => {
      if (!checkIn || !checkOut) return 0;
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 0;
   };

   const hasAccommodation = accommodation && accommodation.name;
   const nights = calculateNights();

   return (
      <div className="relative">
         {/* Confetti explosion effect */}
         {showConfetti && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
               {[...Array(20)].map((_, i) => (
                  <div
                     key={i}
                     className="absolute animate-confetti"
                     style={{
                        left: `${Math.random() * 100}%`,
                        animationDelay: `${Math.random() * 0.5}s`,
                        backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#A78BFA', '#F472B6'][i % 5],
                        width: '8px',
                        height: '8px',
                        borderRadius: i % 2 === 0 ? '50%' : '2px',
                     }}
                  />
               ))}
            </div>
         )}

         <style jsx>{`
            @keyframes confetti {
               0% {
                  transform: translateY(0) rotate(0deg) scale(1);
                  opacity: 1;
               }
               100% {
                  transform: translateY(200px) rotate(720deg) scale(0);
                  opacity: 0;
               }
            }
            .animate-confetti {
               animation: confetti 2s ease-out forwards;
            }
            @keyframes float {
               0%, 100% { transform: translateY(0px) rotate(-2deg); }
               50% { transform: translateY(-5px) rotate(2deg); }
            }
            @keyframes shimmer {
               0% { background-position: -200% 0; }
               100% { background-position: 200% 0; }
            }
            @keyframes glow {
               0%, 100% { box-shadow: 0 0 20px rgba(139, 92, 246, 0.3); }
               50% { box-shadow: 0 0 30px rgba(139, 92, 246, 0.5); }
            }
            @keyframes stamp {
               0% { transform: scale(3) rotate(-20deg); opacity: 0; }
               50% { transform: scale(1.1) rotate(-12deg); opacity: 1; }
               100% { transform: scale(1) rotate(-12deg); opacity: 1; }
            }
            @keyframes slideIn {
               0% { transform: translateX(-20px); opacity: 0; }
               100% { transform: translateX(0); opacity: 1; }
            }
            .keycard {
               background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
               border-radius: 16px;
               position: relative;
               overflow: hidden;
            }
            .keycard::before {
               content: '';
               position: absolute;
               top: 0;
               left: 0;
               right: 0;
               height: 4px;
               background: linear-gradient(90deg, #f59e0b, #eab308, #fbbf24, #f59e0b);
               background-size: 200% 100%;
               animation: shimmer 3s linear infinite;
            }
            .keycard::after {
               content: '';
               position: absolute;
               top: 12px;
               right: 12px;
               width: 50px;
               height: 35px;
               background: linear-gradient(135deg, #fbbf24, #f59e0b);
               border-radius: 4px;
               box-shadow: inset 0 0 0 2px rgba(0,0,0,0.2);
            }
            .magnetic-strip {
               height: 30px;
               background: linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 50%, #2d2d2d 100%);
               margin: 12px -16px;
            }
            .input-field {
               background: rgba(255, 255, 255, 0.05);
               border: 1px solid rgba(255, 255, 255, 0.1);
               border-radius: 8px;
               padding: 10px 12px;
               color: white;
               font-size: 14px;
               transition: all 0.3s ease;
               backdrop-filter: blur(10px);
            }
            .input-field:focus {
               outline: none;
               border-color: #fbbf24;
               box-shadow: 0 0 0 3px rgba(251, 191, 36, 0.2);
               background: rgba(255, 255, 255, 0.1);
            }
            .input-field::placeholder {
               color: rgba(255, 255, 255, 0.4);
            }
            .date-bubble {
               background: linear-gradient(135deg, #8b5cf6, #6366f1);
               padding: 4px 12px;
               border-radius: 20px;
               font-size: 12px;
               font-weight: 600;
               display: inline-flex;
               align-items: center;
               gap: 6px;
               box-shadow: 0 2px 10px rgba(139, 92, 246, 0.3);
            }
            .nights-badge {
               position: absolute;
               top: -8px;
               right: -8px;
               background: linear-gradient(135deg, #f59e0b, #ef4444);
               color: white;
               width: 36px;
               height: 36px;
               border-radius: 50%;
               display: flex;
               align-items: center;
               justify-content: center;
               font-weight: 700;
               font-size: 14px;
               box-shadow: 0 4px 15px rgba(239, 68, 68, 0.4);
               animation: float 3s ease-in-out infinite;
            }
            .stamp {
               position: absolute;
               bottom: 10px;
               right: 10px;
               width: 60px;
               height: 60px;
               border: 3px solid #22c55e;
               border-radius: 50%;
               display: flex;
               align-items: center;
               justify-content: center;
               transform: rotate(-12deg);
               opacity: 0.9;
               animation: stamp 0.5s ease-out forwards;
            }
            .empty-keycard {
               background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
               border: 2px dashed rgba(255, 255, 255, 0.2);
               border-radius: 16px;
               cursor: pointer;
               transition: all 0.3s ease;
            }
            .empty-keycard:hover {
               border-color: rgba(251, 191, 36, 0.5);
               transform: translateY(-2px);
               box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            }
            .hotel-icon {
               font-size: 40px;
               filter: grayscale(100%);
               opacity: 0.5;
               transition: all 0.3s ease;
            }
            .empty-keycard:hover .hotel-icon {
               filter: grayscale(0%);
               opacity: 1;
               transform: scale(1.1);
            }
         `}</style>

         <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
               <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <span className="text-lg">🏨</span>
               </div>
               <span className="font-bold text-gray-800 tracking-wide">Accommodation</span>
               {hasAccommodation && nights > 0 && (
                  <span className="ml-auto text-xs font-semibold px-2 py-1 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow">
                     {nights} {nights === 1 ? 'night' : 'nights'}
                  </span>
               )}
            </div>

            {/* Expanded Form View */}
            {isExpanded && (
               <div className="keycard p-4 text-white">
                  <div className="flex items-center gap-2 mb-4">
                     <span className="text-2xl">✨</span>
                     <span className="text-sm font-semibold uppercase tracking-wider text-amber-400">
                        {hasAccommodation ? 'Edit Stay' : 'Book Your Stay'}
                     </span>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-3">
                     <div className="relative">
                        <input
                           type="text"
                           value={name}
                           onChange={(e) => setName(e.target.value)}
                           placeholder="✦ Hotel / Airbnb name"
                           className="input-field w-full text-lg font-semibold"
                           required
                        />
                     </div>

                     <div className="relative">
                        <input
                           type="text"
                           value={address}
                           onChange={(e) => setAddress(e.target.value)}
                           placeholder="📍 Address"
                           className="input-field w-full"
                        />
                     </div>

                     <div className="magnetic-strip" />

                     <div className="grid grid-cols-2 gap-3">
                        <div>
                           <label className="block text-xs text-amber-400 mb-1 font-semibold uppercase tracking-wider">
                              🌅 Check-in
                           </label>
                           <input
                              type="date"
                              value={checkIn}
                              onChange={(e) => setCheckIn(e.target.value)}
                              className="input-field w-full"
                           />
                        </div>
                        <div>
                           <label className="block text-xs text-amber-400 mb-1 font-semibold uppercase tracking-wider">
                              🌙 Check-out
                           </label>
                           <input
                              type="date"
                              value={checkOut}
                              onChange={(e) => setCheckOut(e.target.value)}
                              className="input-field w-full"
                           />
                        </div>
                     </div>

                     {nights > 0 && (
                        <div className="text-center py-2">
                           <span className="inline-block px-4 py-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full text-sm font-bold shadow-lg">
                              🌟 {nights} magical {nights === 1 ? 'night' : 'nights'}
                           </span>
                        </div>
                     )}

                     <div className="relative">
                        <input
                           type="url"
                           value={url}
                           onChange={(e) => setUrl(e.target.value)}
                           placeholder="🔗 Booking confirmation URL"
                           className="input-field w-full"
                        />
                     </div>

                     <div className="flex gap-2 pt-2">
                        <button
                           type="button"
                           onClick={() => setIsExpanded(false)}
                           className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all font-medium"
                        >
                           Cancel
                        </button>
                        <button
                           type="submit"
                           disabled={isSubmitting || !name.trim()}
                           className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white rounded-lg transition-all font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                           {isSubmitting ? (
                              <span className="flex items-center justify-center gap-2">
                                 <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                 </svg>
                                 Saving...
                              </span>
                           ) : (
                              '✓ Confirm Stay'
                           )}
                        </button>
                     </div>
                  </form>
               </div>
            )}

            {/* Display View */}
            {!isExpanded && (
               <>
                  {hasAccommodation ? (
                     <div
                        className="keycard p-4 cursor-pointer group hover:scale-[1.02] transition-transform duration-300"
                        onClick={() => setIsExpanded(true)}
                        style={{ animation: 'glow 3s ease-in-out infinite' }}
                     >
                        {nights > 0 && (
                           <div className="nights-badge">
                              {nights}
                           </div>
                        )}

                        <div className="relative z-10">
                           <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                 <div className="text-xs text-amber-400 uppercase tracking-wider font-semibold mb-1">
                                    Guest Accommodation
                                 </div>
                                 <h3 className="text-white font-bold text-lg leading-tight pr-12">
                                    {accommodation.name}
                                 </h3>
                              </div>
                           </div>

                           {accommodation.address && (
                              <div className="flex items-center gap-2 text-gray-300 text-sm mb-3" style={{ animation: 'slideIn 0.3s ease-out forwards' }}>
                                 <span className="text-base">📍</span>
                                 <span className="truncate">{accommodation.address}</span>
                              </div>
                           )}

                           <div className="magnetic-strip" />

                           {(accommodation.checkIn || accommodation.checkOut) && (
                              <div className="flex items-center justify-between gap-2 mb-3">
                                 {accommodation.checkIn && (
                                    <div className="date-bubble">
                                       <span>🌅</span>
                                       <span>{formatDate(accommodation.checkIn)}</span>
                                    </div>
                                 )}
                                 {accommodation.checkIn && accommodation.checkOut && (
                                    <div className="flex items-center gap-1">
                                       <div className="w-8 h-0.5 bg-gradient-to-r from-violet-500 to-purple-500" />
                                       <span className="text-purple-400 text-lg">✈</span>
                                       <div className="w-8 h-0.5 bg-gradient-to-r from-purple-500 to-violet-500" />
                                    </div>
                                 )}
                                 {accommodation.checkOut && (
                                    <div className="date-bubble">
                                       <span>🌙</span>
                                       <span>{formatDate(accommodation.checkOut)}</span>
                                    </div>
                                 )}
                              </div>
                           )}

                           <div className="flex items-center justify-between">
                              {accommodation.url ? (
                                 <a
                                    href={accommodation.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors"
                                 >
                                    <span>🔗</span>
                                    <span className="underline underline-offset-2">View Booking</span>
                                 </a>
                              ) : (
                                 <div />
                              )}

                              {onDelete && (
                                 <button
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       onDelete();
                                    }}
                                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                    title="Delete accommodation"
                                 >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                 </button>
                              )}
                           </div>

                           {/* Confirmed stamp */}
                           <div className="stamp">
                              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                           </div>
                        </div>

                        {/* Hover instruction */}
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                           Click to edit
                        </div>
                     </div>
                  ) : (
                     <div
                        className="empty-keycard p-6 text-center"
                        onClick={() => setIsExpanded(true)}
                     >
                        <div className="hotel-icon mb-3">🏨</div>
                        <p className="text-gray-400 text-sm font-medium mb-2">No accommodation yet</p>
                        <p className="text-amber-500 text-xs font-semibold uppercase tracking-wider">
                           + Add your stay
                        </p>
                     </div>
                  )}
               </>
            )}
         </div>
      </div>
   );
}
