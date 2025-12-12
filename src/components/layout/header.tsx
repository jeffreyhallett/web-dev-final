'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/lib/context/UserContext';
import { useTrips } from '@/lib/api/hooks';

export default function Header() {
   const { email, setEmail } = useUser();
   const { data: trips, isLoading } = useTrips();
   const [inputValue, setInputValue] = useState(email);

   useEffect(() => {
      setInputValue(email);
   }, [email]);

   const handleSubmit = (e: React.FormEvent | React.FocusEvent) => {
      e.preventDefault();
      if (inputValue.trim()) {
         setEmail(inputValue.trim());
      }
   };

   return (
      <header className='mx-4 mt-4 mb-0'>
         <div className='bg-gray-300 rounded-lg shadow-lg px-6 py-4 flex items-center justify-between'>
            <h1 className='text-2xl font-semibold text-gray-800'>Trip Planner</h1>
            <div className='flex items-center gap-4'>
               <div className='flex items-center gap-2'>
                  <label className='text-xl'>Email:</label>
                  <input
                     type='email'
                     placeholder='Enter your email'
                     value={inputValue}
                     onChange={(e) => setInputValue(e.target.value)}
                     onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                     onBlur={handleSubmit}
                     className='px-3 py-2 bg-white rounded-lg focus:ring-blue-500 w-64'
                  />
               </div>
               <div className='text-sm text-gray-600'>
                  {isLoading ? (
                     <span>Loading...</span>
                  ) : (
                     <span>{trips?.length || 0} trips</span>
                  )}
               </div>
            </div>
         </div>
      </header>
   );
}
