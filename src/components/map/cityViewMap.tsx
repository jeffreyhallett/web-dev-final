'use client';

import { City } from '@/types';
import { useGoogleMaps } from '@/lib/hooks/googleMapsHook';
import { useEffect, useRef, useState } from 'react';

interface CityDetailMapProps {
   city: City;
}

export default function CityViewMap({ city }: CityDetailMapProps) {
   const mapRef = useRef<HTMLDivElement | null>(null);
   const { isLoaded, error } = useGoogleMaps();
   const [map, setMap] = useState<google.maps.Map | null>(null);
   const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

   // Create map once
   useEffect(() => {
      if (!isLoaded || !mapRef.current || map) return;

      const newMap = new google.maps.Map(mapRef.current, {
         center: { lat: city.latitude, lng: city.longitude },
         zoom: 13,
         disableDefaultUI: true,
         zoomControl: true,
         mapId: 'DEMO_MAP_ID',
      });

      setMap(newMap);
   }, [isLoaded, map, city.latitude, city.longitude]);

   // Update map center and marker when city changes
   useEffect(() => {
      if (!map) return;

      const newCenter = { lat: city.latitude, lng: city.longitude };
      map.setCenter(newCenter);

      // Remove old marker
      if (markerRef.current) {
         markerRef.current.map = null;
      }

      // Create new marker
      markerRef.current = new google.maps.marker.AdvancedMarkerElement({
         position: newCenter,
         map: map,
         title: city.name,
      });
   }, [map, city]);

   if (error) {
      return (
         <div className="w-full bg-red-100 flex items-center justify-center">
            <p className="text-red-600 text-sm">
               Error loading map, please reload the page and try again.
            </p>
         </div>
      );
   }

   if (!isLoaded) {
      return (
         <div className="w-full bg-gray-300 animate-pulse flex items-center justify-center">
            <p className="text-gray-500 text-sm">Loading map...</p>
         </div>
      );
   }

   return <div ref={mapRef} className="h-full w-full" />;
}
