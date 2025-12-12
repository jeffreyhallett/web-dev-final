import { City } from '@/types';
import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

interface CityListProps {
   cities: City[];
   currentCity: City | null;
   onCitySelect: (city: City) => void;
   onAddCity: (city: City) => void;
}

export default function CityList({
   cities,
   currentCity,
   onCitySelect,
   onAddCity,
}: CityListProps) {
   const [showAddCity, setShowAddCity] = useState(false);

   return (
      <div className="bg-gray-300 rounded-lg shadow-sm p-6 h-full flex flex-col">
         <h2 className="text-xl font-semibold mb-4 text-center">Your Saved Trips</h2>

         <ul className="space-y-2 flex-1 overflow-y-auto">
            {cities.map((city) => (
               <li key={city.id}>
                  <button
                     onClick={() => onCitySelect(city)}
                     className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                        currentCity?.id === city.id
                           ? 'bg-blue-50 border-2 border-blue-500'
                           : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                     }`}
                  >
                     <div className="font-medium">{city.name}</div>
                     <div className="text-sm text-gray-500">{city.country}</div>
                  </button>
               </li>
            ))}
         </ul>
         <button
            onClick={() => setShowAddCity(!showAddCity)}
            className="rounded-lg mt-4 w-full px-4 py-3 bg-blue-500 text-white rounger-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
         >
            Add City
            <PlusIcon className="h-5 w-5" />
         </button>
      </div>
   );
}
