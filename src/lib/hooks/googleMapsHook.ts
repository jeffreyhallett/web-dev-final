'use client';

import { useEffect, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

export function useGoogleMaps() {
   const [isLoaded, setIsLoaded] = useState(false);
   const [error, setError] = useState<Error | null>(null);

   useEffect(() => {
      const loadGoogleMaps = async () => {
         try {
            setOptions({
               key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
               libraries: ['places', 'geometry'],
            });

            await importLibrary('maps');
            await importLibrary('marker');

            setIsLoaded(true);
         } catch (err) {
            setError(err as Error);
            console.warn('Error loading Google Maps:', err);
         }
      };
      loadGoogleMaps();
   }, []);

   return { isLoaded, error };
}
