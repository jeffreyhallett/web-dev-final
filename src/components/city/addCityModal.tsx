'use client';

import { useState } from 'react';
import Modal from '@/components/ui/modal';

interface AddCityModalProps {
   isOpen: boolean;
   onClose: () => void;
   onSubmit: (data: { name: string; country: string; latitude: number; longitude: number }) => Promise<void>;
}

async function geocodeCity(cityName: string, country: string): Promise<{ lat: number; lng: number } | null> {
   const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
   if (!apiKey) return null;

   try {
      const query = encodeURIComponent(`${cityName}, ${country}`);
      const response = await fetch(
         `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${apiKey}`
      );
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
         const location = data.results[0].geometry.location;
         return { lat: location.lat, lng: location.lng };
      }
   } catch (err) {
      console.error('Geocoding failed:', err);
   }
   return null;
}

export default function AddCityModal({ isOpen, onClose, onSubmit }: AddCityModalProps) {
   const [name, setName] = useState('');
   const [country, setCountry] = useState('');
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      if (!name.trim()) {
         setError('City name is required');
         return;
      }
      if (!country.trim()) {
         setError('Country is required');
         return;
      }

      setIsSubmitting(true);
      try {
         const geocoded = await geocodeCity(name.trim(), country.trim());
         if (!geocoded) {
            setError('Could not find coordinates for this city. Please check the city name and country.');
            setIsSubmitting(false);
            return;
         }

         await onSubmit({
            name: name.trim(),
            country: country.trim(),
            latitude: geocoded.lat,
            longitude: geocoded.lng,
         });
         setName('');
         setCountry('');
         onClose();
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Failed to add city');
      } finally {
         setIsSubmitting(false);
      }
   };

   const handleClose = () => {
      setName('');
      setCountry('');
      setError(null);
      onClose();
   };

   return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Add Destination">
         <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
               <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
               </div>
            )}

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                  City Name *
               </label>
               <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Paris"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  autoFocus
               />
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country *
               </label>
               <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g., France"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
               />
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
                  className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  {isSubmitting ? 'Adding...' : 'Add City'}
               </button>
            </div>
         </form>
      </Modal>
   );
}
