'use client';

import { useState } from 'react';
import { Flight, Train } from '@/types';
import { PlusIcon, TrashIcon, PaperAirplaneIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface TransportationSectionProps {
   flights: Flight[];
   trains: Train[];
   onAddFlight: (data: {
      departureAirport: string;
      arrivalAirport: string;
      flightNumber?: string;
      airline?: string;
      departureTime?: string;
      arrivalTime?: string;
   }) => Promise<void>;
   onAddTrain: (data: {
      departureStation: string;
      arrivalStation: string;
      trainNumber?: string;
      operator?: string;
      departureTime?: string;
      arrivalTime?: string;
   }) => Promise<void>;
   onDeleteFlight: (flightId: string) => Promise<void>;
   onDeleteTrain: (trainId: string) => Promise<void>;
}

type Tab = 'flights' | 'trains';

export default function TransportationSection({
   flights,
   trains,
   onAddFlight,
   onAddTrain,
   onDeleteFlight,
   onDeleteTrain,
}: TransportationSectionProps) {
   const [activeTab, setActiveTab] = useState<Tab>('flights');
   const [showAddForm, setShowAddForm] = useState(false);
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [expandedFlightId, setExpandedFlightId] = useState<string | null>(null);
   const [expandedTrainId, setExpandedTrainId] = useState<string | null>(null);

   // Flight form state
   const [flightDeparture, setFlightDeparture] = useState('');
   const [flightArrival, setFlightArrival] = useState('');
   const [flightNumber, setFlightNumber] = useState('');
   const [airline, setAirline] = useState('');
   const [flightDepartureTime, setFlightDepartureTime] = useState('');
   const [flightArrivalTime, setFlightArrivalTime] = useState('');

   // Train form state
   const [trainDeparture, setTrainDeparture] = useState('');
   const [trainArrival, setTrainArrival] = useState('');
   const [trainNumber, setTrainNumber] = useState('');
   const [operator, setOperator] = useState('');
   const [trainDepartureTime, setTrainDepartureTime] = useState('');
   const [trainArrivalTime, setTrainArrivalTime] = useState('');

   const resetFlightForm = () => {
      setFlightDeparture('');
      setFlightArrival('');
      setFlightNumber('');
      setAirline('');
      setFlightDepartureTime('');
      setFlightArrivalTime('');
   };

   const resetTrainForm = () => {
      setTrainDeparture('');
      setTrainArrival('');
      setTrainNumber('');
      setOperator('');
      setTrainDepartureTime('');
      setTrainArrivalTime('');
   };

   const handleAddFlight = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!flightDeparture.trim() || !flightArrival.trim()) return;

      setIsSubmitting(true);
      try {
         await onAddFlight({
            departureAirport: flightDeparture.trim(),
            arrivalAirport: flightArrival.trim(),
            flightNumber: flightNumber.trim() || undefined,
            airline: airline.trim() || undefined,
            departureTime: flightDepartureTime || undefined,
            arrivalTime: flightArrivalTime || undefined,
         });
         resetFlightForm();
         setShowAddForm(false);
      } catch (err) {
         console.error('Failed to add flight:', err);
      } finally {
         setIsSubmitting(false);
      }
   };

   const handleAddTrain = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!trainDeparture.trim() || !trainArrival.trim()) return;

      setIsSubmitting(true);
      try {
         await onAddTrain({
            departureStation: trainDeparture.trim(),
            arrivalStation: trainArrival.trim(),
            trainNumber: trainNumber.trim() || undefined,
            operator: operator.trim() || undefined,
            departureTime: trainDepartureTime || undefined,
            arrivalTime: trainArrivalTime || undefined,
         });
         resetTrainForm();
         setShowAddForm(false);
      } catch (err) {
         console.error('Failed to add train:', err);
      } finally {
         setIsSubmitting(false);
      }
   };

   const formatTime = (timeString?: string) => {
      if (!timeString) return null;
      try {
         const date = new Date(timeString);
         return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
         });
      } catch {
         return timeString;
      }
   };

   const toggleFlightExpanded = (flightId: string) => {
      setExpandedFlightId(expandedFlightId === flightId ? null : flightId);
   };

   const toggleTrainExpanded = (trainId: string) => {
      setExpandedTrainId(expandedTrainId === trainId ? null : trainId);
   };

   const hasFlightDetails = (flight: Flight) => {
      return flight.confirmationNumber || flight.bookingUrl || flight.notes;
   };

   const hasTrainDetails = (train: Train) => {
      return train.confirmationNumber || train.bookingUrl || train.seatInfo || train.notes;
   };

   return (
      <div className="space-y-3">
         <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
               Transportation
            </label>
            <button
               onClick={() => setShowAddForm(!showAddForm)}
               className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
               title={showAddForm ? 'Cancel' : 'Add transportation'}
            >
               <PlusIcon className={`w-4 h-4 transition-transform ${showAddForm ? 'rotate-45' : ''}`} />
            </button>
         </div>

         {/* Tabs */}
         <div className="flex border-b border-gray-200">
            <button
               onClick={() => setActiveTab('flights')}
               className={`px-3 py-1.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'flights'
                     ? 'border-blue-500 text-blue-600'
                     : 'border-transparent text-gray-500 hover:text-gray-700'
               }`}
            >
               Flights ({flights.length})
            </button>
            <button
               onClick={() => setActiveTab('trains')}
               className={`px-3 py-1.5 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'trains'
                     ? 'border-blue-500 text-blue-600'
                     : 'border-transparent text-gray-500 hover:text-gray-700'
               }`}
            >
               Trains ({trains.length})
            </button>
         </div>

         {/* Add Form */}
         {showAddForm && (
            <div className="bg-gray-50 rounded-lg p-3">
               {activeTab === 'flights' ? (
                  <form onSubmit={handleAddFlight} className="space-y-2">
                     <div className="grid grid-cols-2 gap-2">
                        <input
                           type="text"
                           value={flightDeparture}
                           onChange={(e) => setFlightDeparture(e.target.value)}
                           placeholder="From (e.g., JFK)"
                           className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                           required
                        />
                        <input
                           type="text"
                           value={flightArrival}
                           onChange={(e) => setFlightArrival(e.target.value)}
                           placeholder="To (e.g., CDG)"
                           className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                           required
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-2">
                        <input
                           type="text"
                           value={airline}
                           onChange={(e) => setAirline(e.target.value)}
                           placeholder="Airline"
                           className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                           type="text"
                           value={flightNumber}
                           onChange={(e) => setFlightNumber(e.target.value)}
                           placeholder="Flight #"
                           className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-2">
                        <div>
                           <label className="block text-xs text-gray-500 mb-0.5">Departure</label>
                           <input
                              type="datetime-local"
                              value={flightDepartureTime}
                              onChange={(e) => setFlightDepartureTime(e.target.value)}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                           />
                        </div>
                        <div>
                           <label className="block text-xs text-gray-500 mb-0.5">Arrival</label>
                           <input
                              type="datetime-local"
                              value={flightArrivalTime}
                              onChange={(e) => setFlightArrivalTime(e.target.value)}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                           />
                        </div>
                     </div>
                     <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                     >
                        {isSubmitting ? 'Adding...' : 'Add Flight'}
                     </button>
                  </form>
               ) : (
                  <form onSubmit={handleAddTrain} className="space-y-2">
                     <div className="grid grid-cols-2 gap-2">
                        <input
                           type="text"
                           value={trainDeparture}
                           onChange={(e) => setTrainDeparture(e.target.value)}
                           placeholder="From station"
                           className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                           required
                        />
                        <input
                           type="text"
                           value={trainArrival}
                           onChange={(e) => setTrainArrival(e.target.value)}
                           placeholder="To station"
                           className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                           required
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-2">
                        <input
                           type="text"
                           value={operator}
                           onChange={(e) => setOperator(e.target.value)}
                           placeholder="Operator"
                           className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                        <input
                           type="text"
                           value={trainNumber}
                           onChange={(e) => setTrainNumber(e.target.value)}
                           placeholder="Train #"
                           className="px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-2">
                        <div>
                           <label className="block text-xs text-gray-500 mb-0.5">Departure</label>
                           <input
                              type="datetime-local"
                              value={trainDepartureTime}
                              onChange={(e) => setTrainDepartureTime(e.target.value)}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                           />
                        </div>
                        <div>
                           <label className="block text-xs text-gray-500 mb-0.5">Arrival</label>
                           <input
                              type="datetime-local"
                              value={trainArrivalTime}
                              onChange={(e) => setTrainArrivalTime(e.target.value)}
                              className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                           />
                        </div>
                     </div>
                     <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                     >
                        {isSubmitting ? 'Adding...' : 'Add Train'}
                     </button>
                  </form>
               )}
            </div>
         )}

         {/* Content */}
         <div className="space-y-2 max-h-48 overflow-y-auto">
            {activeTab === 'flights' ? (
               flights.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-2">
                     No flights added yet
                  </p>
               ) : (
                  flights.map((flight) => (
                     <div
                        key={flight.id}
                        className="bg-gray-50 rounded-lg overflow-hidden"
                     >
                        <div
                           className="p-2 flex items-start justify-between group cursor-pointer"
                           onClick={() => hasFlightDetails(flight) && toggleFlightExpanded(flight.id)}
                        >
                           <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                 <PaperAirplaneIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                 <span className="font-medium text-sm truncate">
                                    {flight.departureAirport} → {flight.arrivalAirport}
                                 </span>
                                 {hasFlightDetails(flight) && (
                                    expandedFlightId === flight.id ? (
                                       <ChevronUpIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    ) : (
                                       <ChevronDownIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                    )
                                 )}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5 ml-6">
                                 {flight.airline && <span>{flight.airline}</span>}
                                 {flight.airline && flight.number && <span> · </span>}
                                 {flight.number && <span>{flight.number}</span>}
                              </div>
                              {(flight.times.departure || flight.times.arrival) && (
                                 <div className="text-xs text-gray-500 mt-0.5 ml-6">
                                    {formatTime(flight.times.departure)}
                                    {flight.times.departure && flight.times.arrival && ' → '}
                                    {formatTime(flight.times.arrival)}
                                 </div>
                              )}
                           </div>
                           <button
                              onClick={(e) => {
                                 e.stopPropagation();
                                 onDeleteFlight(flight.id);
                              }}
                              className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                              title="Delete flight"
                           >
                              <TrashIcon className="w-4 h-4" />
                           </button>
                        </div>

                        {/* Expanded Details */}
                        {expandedFlightId === flight.id && hasFlightDetails(flight) && (
                           <div className="px-3 pb-3 pt-1 border-t border-gray-200 bg-gray-100 space-y-1.5">
                              {flight.confirmationNumber && (
                                 <div className="flex items-center gap-2 text-xs">
                                    <span className="text-gray-500 font-medium">Confirmation:</span>
                                    <span className="text-gray-700 font-mono">{flight.confirmationNumber}</span>
                                 </div>
                              )}
                              {flight.bookingUrl && (
                                 <div className="flex items-center gap-2 text-xs">
                                    <span className="text-gray-500 font-medium">Booking:</span>
                                    <a
                                       href={flight.bookingUrl}
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       className="text-blue-500 hover:underline truncate"
                                       onClick={(e) => e.stopPropagation()}
                                    >
                                       View booking
                                    </a>
                                 </div>
                              )}
                              {flight.notes && (
                                 <div className="text-xs">
                                    <span className="text-gray-500 font-medium">Notes:</span>
                                    <p className="text-gray-700 mt-0.5">{flight.notes}</p>
                                 </div>
                              )}
                           </div>
                        )}
                     </div>
                  ))
               )
            ) : trains.length === 0 ? (
               <p className="text-sm text-gray-500 text-center py-2">
                  No trains added yet
               </p>
            ) : (
               trains.map((train) => (
                  <div
                     key={train.id}
                     className="bg-gray-50 rounded-lg overflow-hidden"
                  >
                     <div
                        className="p-2 flex items-start justify-between group cursor-pointer"
                        onClick={() => hasTrainDetails(train) && toggleTrainExpanded(train.id)}
                     >
                        <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 14l-3-3m3 3l3-3M5 12H3m18 0h-2M7 8H5m14 0h-2" />
                              </svg>
                              <span className="font-medium text-sm truncate">
                                 {train.departureStation} → {train.arrivalStation}
                              </span>
                              {hasTrainDetails(train) && (
                                 expandedTrainId === train.id ? (
                                    <ChevronUpIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                 ) : (
                                    <ChevronDownIcon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                 )
                              )}
                           </div>
                           <div className="text-xs text-gray-500 mt-0.5 ml-6">
                              {train.operator && <span>{train.operator}</span>}
                              {train.operator && train.number && <span> · </span>}
                              {train.number && <span>{train.number}</span>}
                           </div>
                           {(train.times.departure || train.times.arrival) && (
                              <div className="text-xs text-gray-500 mt-0.5 ml-6">
                                 {formatTime(train.times.departure)}
                                 {train.times.departure && train.times.arrival && ' → '}
                                 {formatTime(train.times.arrival)}
                              </div>
                           )}
                        </div>
                        <button
                           onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTrain(train.id);
                           }}
                           className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                           title="Delete train"
                        >
                           <TrashIcon className="w-4 h-4" />
                        </button>
                     </div>

                     {/* Expanded Details */}
                     {expandedTrainId === train.id && hasTrainDetails(train) && (
                        <div className="px-3 pb-3 pt-1 border-t border-gray-200 bg-gray-100 space-y-1.5">
                           {train.confirmationNumber && (
                              <div className="flex items-center gap-2 text-xs">
                                 <span className="text-gray-500 font-medium">Confirmation:</span>
                                 <span className="text-gray-700 font-mono">{train.confirmationNumber}</span>
                              </div>
                           )}
                           {train.seatInfo && (
                              <div className="flex items-center gap-2 text-xs">
                                 <span className="text-gray-500 font-medium">Seat:</span>
                                 <span className="text-gray-700">{train.seatInfo}</span>
                              </div>
                           )}
                           {train.bookingUrl && (
                              <div className="flex items-center gap-2 text-xs">
                                 <span className="text-gray-500 font-medium">Booking:</span>
                                 <a
                                    href={train.bookingUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline truncate"
                                    onClick={(e) => e.stopPropagation()}
                                 >
                                    View booking
                                 </a>
                              </div>
                           )}
                           {train.notes && (
                              <div className="text-xs">
                                 <span className="text-gray-500 font-medium">Notes:</span>
                                 <p className="text-gray-700 mt-0.5">{train.notes}</p>
                              </div>
                           )}
                        </div>
                     )}
                  </div>
               ))
            )}
         </div>
      </div>
   );
}
