'use client';

import CityList from '@/components/city/cityList';
import { City, Activity, Note, Trip, Flight, Train, Accommodation } from '@/types';
import { useState } from 'react';
import CityView from '@/components/city/tripView';
import Header from '@/components/layout/header';

export default function HomePage() {
   const [view, setView] = useState<'list' | 'map'>('list');
   const [selectedCity, setSelectedCity] = useState<City>({
      id: '1',
      name: 'Vienna',
      country: 'Austria',
      latitude: 48.2082,
      longitude: 16.3738,
   });
   const [activities, setActivities] = useState<Record<string, Activity[]>>({});
   const [trips, setTrips] = useState<Record<string, Trip>>({});
   const [notes, setNotes] = useState<Record<string, Note[]>>({});
   const [accommodations, setAccommodations] = useState<Record<string, Accommodation[]>>(
      {}
   );
   const [cities, setCities] = useState<City[]>([
      {
         id: '1',
         name: 'Vienna',
         country: 'Austria',
         latitude: 48.2082,
         longitude: 16.3738,
      },
      {
         id: '2',
         name: 'Prague',
         country: 'Czech Republic',
         latitude: 50.0755,
         longitude: 14.4378,
      },
   ]);
   return (
      <div className="flex flex-col h-screen">
         <Header view={view} onViewChange={setView}/>
         <div className="flex flex-1 overflow-hidden">
            <aside className="w-64 flex flex-col">
               <div className="px-4 py-8 flex-1">
                  <CityList
                     cities={cities}
                     currentCity={selectedCity}
                     onCitySelect={setSelectedCity}
                     onAddCity={(city: City) => setCities([...cities, city])}
                  />
               </div>
            </aside>
            <main className="flex-1 flex flex-col">
               <div className="px-4 py-8 flex-1 w-full">
                  <CityView
                  city={selectedCity}
                  trip={selectedCity ? trips[selectedCity.id] : undefined}
                  activities={selectedCity ? activities[selectedCity.id] || [] : []}
                  onUpdateActivities={(newActivities) => {
                     if (selectedCity) {
                        setActivities({
                           ...activities,
                           [selectedCity.id]: newActivities,
                        });
                     }
                  }}
                  onUpdateTrip={() => {}}

               />
            </div>
         </main>
         </div>
      </div>
   );
}
