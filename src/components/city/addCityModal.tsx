'use client';

import { useState } from 'react';
import Modal from '@/components/ui/modal';

interface AddCityModalProps {
   isOpen: boolean;
   onClose: () => void;
   onSubmit: (data: { name: string; country: string; latitude: number; longitude: number }) => Promise<void>;
}

const CITY_PRESETS: Record<string, { country: string; lat: number; lng: number }> = {
   'Paris': { country: 'France', lat: 48.8566, lng: 2.3522 },
   'London': { country: 'United Kingdom', lat: 51.5074, lng: -0.1278 },
   'Tokyo': { country: 'Japan', lat: 35.6762, lng: 139.6503 },
   'New York': { country: 'United States', lat: 40.7128, lng: -74.0060 },
   'Rome': { country: 'Italy', lat: 41.9028, lng: 12.4964 },
   'Barcelona': { country: 'Spain', lat: 41.3851, lng: 2.1734 },
   'Amsterdam': { country: 'Netherlands', lat: 52.3676, lng: 4.9041 },
   'Berlin': { country: 'Germany', lat: 52.5200, lng: 13.4050 },
   'Sydney': { country: 'Australia', lat: -33.8688, lng: 151.2093 },
   'Dubai': { country: 'United Arab Emirates', lat: 25.2048, lng: 55.2708 },
};

export default function AddCityModal({ isOpen, onClose, onSubmit }: AddCityModalProps) {
   const [name, setName] = useState('');
   const [country, setCountry] = useState('');
   const [latitude, setLatitude] = useState('');
   const [longitude, setLongitude] = useState('');
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const handleCityNameChange = (value: string) => {
      setName(value);
      const preset = CITY_PRESETS[value];
      if (preset) {
         setCountry(preset.country);
         setLatitude(preset.lat.toString());
         setLongitude(preset.lng.toString());
      }
   };

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

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (isNaN(lat) || lat < -90 || lat > 90) {
         setError('Please enter a valid latitude (-90 to 90)');
         return;
      }
      if (isNaN(lng) || lng < -180 || lng > 180) {
         setError('Please enter a valid longitude (-180 to 180)');
         return;
      }

      setIsSubmitting(true);
      try {
         await onSubmit({
            name: name.trim(),
            country: country.trim(),
            latitude: lat,
            longitude: lng,
         });
         setName('');
         setCountry('');
         setLatitude('');
         setLongitude('');
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
      setLatitude('');
      setLongitude('');
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
                  onChange={(e) => handleCityNameChange(e.target.value)}
                  placeholder="e.g., Paris"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  list="city-suggestions"
                  autoFocus
               />
               <datalist id="city-suggestions">
                  {Object.keys(CITY_PRESETS).map(city => (
                     <option key={city} value={city} />
                  ))}
               </datalist>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
               />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Latitude *
                  </label>
                  <input
                     type="number"
                     step="any"
                     value={latitude}
                     onChange={(e) => setLatitude(e.target.value)}
                     placeholder="e.g., 48.8566"
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                     Longitude *
                  </label>
                  <input
                     type="number"
                     step="any"
                     value={longitude}
                     onChange={(e) => setLongitude(e.target.value)}
                     placeholder="e.g., 2.3522"
                     className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
               </div>
            </div>

            <p className="text-xs text-gray-500">
               Tip: Type a major city name to auto-fill coordinates
            </p>

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
                  {isSubmitting ? 'Adding...' : 'Add City'}
               </button>
            </div>
         </form>
      </Modal>
   );
}
