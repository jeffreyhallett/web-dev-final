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

   // Create map once with custom styling
   useEffect(() => {
      if (!isLoaded || !mapRef.current || map) return;

      // Custom map styles with pastel colors
      const mapStyles = [
         {
            featureType: 'water',
            elementType: 'geometry',
            stylers: [{ color: '#C8E6F5' }, { lightness: 17 }],
         },
         {
            featureType: 'landscape',
            elementType: 'geometry',
            stylers: [{ color: '#F5E6FF' }, { lightness: 20 }],
         },
         {
            featureType: 'road.highway',
            elementType: 'geometry.fill',
            stylers: [{ color: '#FFD6E8' }, { lightness: 17 }],
         },
         {
            featureType: 'road.highway',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#FFB8D9' }, { lightness: 29 }, { weight: 0.2 }],
         },
         {
            featureType: 'road.arterial',
            elementType: 'geometry',
            stylers: [{ color: '#E5F4FF' }, { lightness: 18 }],
         },
         {
            featureType: 'road.local',
            elementType: 'geometry',
            stylers: [{ color: '#F0F8FF' }, { lightness: 16 }],
         },
         {
            featureType: 'poi',
            elementType: 'geometry',
            stylers: [{ color: '#E8F5E9' }, { lightness: 21 }],
         },
         {
            featureType: 'poi.park',
            elementType: 'geometry',
            stylers: [{ color: '#B8E6C9' }, { lightness: 21 }],
         },
         {
            elementType: 'labels.text.stroke',
            stylers: [
               { visibility: 'on' },
               { color: '#ffffff' },
               { lightness: 16 },
            ],
         },
         {
            elementType: 'labels.text.fill',
            stylers: [{ saturation: 36 }, { color: '#6B5B95' }, { lightness: 40 }],
         },
         {
            elementType: 'labels.icon',
            stylers: [{ visibility: 'on' }],
         },
         {
            featureType: 'transit',
            elementType: 'geometry',
            stylers: [{ color: '#D6EFFF' }, { lightness: 19 }],
         },
         {
            featureType: 'administrative',
            elementType: 'geometry.fill',
            stylers: [{ color: '#F5F0FF' }, { lightness: 20 }],
         },
         {
            featureType: 'administrative',
            elementType: 'geometry.stroke',
            stylers: [{ color: '#D9C9FF' }, { lightness: 17 }, { weight: 1.2 }],
         },
      ];

      const newMap = new google.maps.Map(mapRef.current, {
         center: { lat: city.latitude, lng: city.longitude },
         zoom: 13,
         disableDefaultUI: true,
         zoomControl: true,
         mapId: 'DEMO_MAP_ID',
         styles: mapStyles,
         gestureHandling: 'greedy',
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

      // Create custom animated marker pin
      const markerContent = document.createElement('div');
      markerContent.style.cssText = `
         width: 40px;
         height: 40px;
         display: flex;
         align-items: center;
         justify-content: center;
         animation: bounce 2s ease-in-out infinite, pulse 2s ease-in-out infinite;
      `;

      const pin = document.createElement('div');
      pin.innerHTML = '📍';
      pin.style.cssText = `
         font-size: 32px;
         filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
      `;
      markerContent.appendChild(pin);

      // Add keyframe animations
      if (!document.getElementById('marker-animations')) {
         const style = document.createElement('style');
         style.id = 'marker-animations';
         style.textContent = `
            @keyframes bounce {
               0%, 100% { transform: translateY(0px); }
               50% { transform: translateY(-10px); }
            }
            @keyframes pulse {
               0%, 100% { transform: scale(1); }
               50% { transform: scale(1.1); }
            }
         `;
         document.head.appendChild(style);
      }

      // Create new marker with custom content
      markerRef.current = new google.maps.marker.AdvancedMarkerElement({
         position: newCenter,
         map: map,
         title: city.name,
         content: markerContent,
      });
   }, [map, city]);

   if (error) {
      return (
         <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-red-100 to-pink-100 rounded-xl">
            <div className="text-center p-8">
               <p className="text-6xl mb-4 animate-bounce">😕</p>
               <p className="text-red-600 font-semibold">Oops! Map failed to load</p>
               <p className="text-red-500 text-sm mt-2">
                  Please reload the page and try again
               </p>
            </div>
         </div>
      );
   }

   if (!isLoaded) {
      return (
         <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl">
            <div className="text-center">
               <div className="text-6xl mb-4 animate-spin">🌍</div>
               <p className="text-purple-600 font-semibold animate-pulse">
                  Loading your adventure map...
               </p>
            </div>
         </div>
      );
   }

   return <div ref={mapRef} className="h-full w-full" />;
}
