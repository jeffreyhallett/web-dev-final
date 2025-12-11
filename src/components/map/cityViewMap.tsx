'use client';

import { City, Activity } from '@/types';
import { useGoogleMaps } from '@/lib/hooks/googleMapsHook';
import { useEffect, useRef, useState, useCallback } from 'react';

interface CityDetailMapProps {
   city: City;
   activities?: Activity[];
}

interface ActivityLocation {
   activity: Activity;
   position: google.maps.LatLngLiteral;
}

export default function CityViewMap({ city, activities = [] }: CityDetailMapProps) {
   const mapRef = useRef<HTMLDivElement | null>(null);
   const { isLoaded, error } = useGoogleMaps();
   const [map, setMap] = useState<google.maps.Map | null>(null);
   const cityMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
   const activityMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
   const [activityLocations, setActivityLocations] = useState<ActivityLocation[]>([]);
   const geocoderRef = useRef<google.maps.Geocoder | null>(null);

   // Geocode activity locations
   const geocodeActivities = useCallback(async () => {
      if (!isLoaded || !activities.length) {
         setActivityLocations([]);
         return;
      }

      if (!geocoderRef.current) {
         geocoderRef.current = new google.maps.Geocoder();
      }

      const activitiesWithLocation = activities.filter(a => a.location && a.location.trim());

      const locationPromises = activitiesWithLocation.map(async (activity) => {
         try {
            const result = await geocoderRef.current!.geocode({
               address: `${activity.location}, ${city.name}, ${city.country}`,
               bounds: {
                  north: city.latitude + 0.1,
                  south: city.latitude - 0.1,
                  east: city.longitude + 0.1,
                  west: city.longitude - 0.1,
               },
            });

            if (result.results.length > 0) {
               const location = result.results[0].geometry.location;
               return {
                  activity,
                  position: { lat: location.lat(), lng: location.lng() },
               };
            }
         } catch (err) {
            console.warn(`Failed to geocode location for ${activity.name}:`, err);
         }
         return null;
      });

      const results = await Promise.all(locationPromises);
      setActivityLocations(results.filter((r): r is ActivityLocation => r !== null));
   }, [isLoaded, activities, city.name, city.country, city.latitude, city.longitude]);

   // Geocode when activities or city changes
   useEffect(() => {
      geocodeActivities();
   }, [geocodeActivities]);

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

   // Update map center and city marker when city changes
   useEffect(() => {
      if (!map) return;

      const newCenter = { lat: city.latitude, lng: city.longitude };
      map.setCenter(newCenter);

      // Remove old city marker
      if (cityMarkerRef.current) {
         cityMarkerRef.current.map = null;
      }

      // Create new city marker
      cityMarkerRef.current = new google.maps.marker.AdvancedMarkerElement({
         position: newCenter,
         map: map,
         title: city.name,
      });
   }, [map, city]);

   // Update activity markers when locations change
   useEffect(() => {
      if (!map) return;

      // Remove old activity markers
      activityMarkersRef.current.forEach(marker => {
         marker.map = null;
      });
      activityMarkersRef.current = [];

      // Create new activity markers
      activityLocations.forEach(({ activity, position }) => {
         // Create custom marker content
         const markerContent = document.createElement('div');
         markerContent.className = 'activity-marker';
         markerContent.innerHTML = `
            <div style="
               background-color: #3b82f6;
               border: 2px solid white;
               border-radius: 50%;
               width: 32px;
               height: 32px;
               display: flex;
               align-items: center;
               justify-content: center;
               box-shadow: 0 2px 6px rgba(0,0,0,0.3);
               cursor: pointer;
            ">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
               </svg>
            </div>
         `;

         const marker = new google.maps.marker.AdvancedMarkerElement({
            position,
            map: map,
            title: activity.name,
            content: markerContent,
         });

         // Add click listener to show info window
         const infoWindow = new google.maps.InfoWindow({
            content: `
               <div style="padding: 8px; max-width: 200px;">
                  <h3 style="margin: 0 0 4px 0; font-weight: 600; font-size: 14px;">${activity.name}</h3>
                  ${activity.location ? `<p style="margin: 0; font-size: 12px; color: #666;">${activity.location}</p>` : ''}
                  ${activity.time ? `<p style="margin: 4px 0 0 0; font-size: 11px; color: #999;">${activity.time}</p>` : ''}
               </div>
            `,
         });

         marker.addListener('click', () => {
            infoWindow.open(map, marker);
         });

         activityMarkersRef.current.push(marker);
      });

      // Fit bounds to show all markers if there are activity markers
      if (activityLocations.length > 0) {
         const bounds = new google.maps.LatLngBounds();
         bounds.extend({ lat: city.latitude, lng: city.longitude });
         activityLocations.forEach(({ position }) => {
            bounds.extend(position);
         });
         map.fitBounds(bounds, { top: 50, right: 50, bottom: 50, left: 50 });
      }
   }, [map, activityLocations, city.latitude, city.longitude]);

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
