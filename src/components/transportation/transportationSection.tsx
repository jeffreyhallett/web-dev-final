'use client';

import { useState } from 'react';
import { Flight, Train } from '@/types';

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

   return (
      <div className="space-y-3">
         {/* Tab buttons */}
         <div className="flex rounded-lg overflow-hidden" style={{ border: '2px solid #5c5445' }}>
            <button
               onClick={() => setActiveTab('flights')}
               className="flex-1 py-2 px-3 text-sm font-bold flex items-center justify-center gap-2 transition-all"
               style={{
                  background: activeTab === 'flights'
                     ? 'linear-gradient(135deg, #1e4d8c 0%, #2d5a8c 100%)'
                     : '#f5f0e6',
                  color: activeTab === 'flights' ? '#e8d48b' : '#5c5445',
               }}
            >
               ✈️ Flights ({flights.length})
            </button>
            <button
               onClick={() => setActiveTab('trains')}
               className="flex-1 py-2 px-3 text-sm font-bold flex items-center justify-center gap-2 transition-all"
               style={{
                  background: activeTab === 'trains'
                     ? 'linear-gradient(135deg, #2d5a3d 0%, #4a7c5a 100%)'
                     : '#f5f0e6',
                  color: activeTab === 'trains' ? '#e8d48b' : '#5c5445',
                  borderLeft: '2px solid #5c5445',
               }}
            >
               🚂 Trains ({trains.length})
            </button>
         </div>

         {/* Add button */}
         {!showAddForm && (
            <button
               onClick={() => setShowAddForm(true)}
               className="w-full py-2 text-sm font-bold rounded-lg transition-all hover:scale-[1.02]"
               style={{
                  background: '#f5f0e6',
                  border: '2px dashed #5c5445',
                  color: '#5c5445',
               }}
            >
               + Add {activeTab === 'flights' ? 'Flight' : 'Train'}
            </button>
         )}

         {/* Add Form */}
         {showAddForm && (
            <div
               className="rounded-lg overflow-hidden"
               style={{
                  background: '#f5f0e6',
                  border: '2px solid #5c5445',
               }}
            >
               <div
                  className="px-3 py-2 flex items-center justify-between"
                  style={{
                     background: activeTab === 'flights' ? '#1e4d8c' : '#2d5a3d',
                     borderBottom: '2px solid #c9a227',
                  }}
               >
                  <span className="text-sm font-bold" style={{ color: '#e8d48b' }}>
                     {activeTab === 'flights' ? '✈️ New Flight' : '🚂 New Train'}
                  </span>
                  <button
                     onClick={() => setShowAddForm(false)}
                     className="text-xs px-2 py-1"
                     style={{ color: '#e8d48b' }}
                  >
                     Cancel
                  </button>
               </div>

               {activeTab === 'flights' ? (
                  <form onSubmit={handleAddFlight} className="p-3 space-y-3">
                     <div className="grid grid-cols-2 gap-3">
                        <div>
                           <label className="block text-xs font-bold mb-1" style={{ color: '#5c5445' }}>
                              FROM *
                           </label>
                           <input
                              type="text"
                              value={flightDeparture}
                              onChange={(e) => setFlightDeparture(e.target.value)}
                              placeholder="JFK"
                              className="w-full px-3 py-2 rounded text-sm text-center font-bold"
                              style={{ background: '#fff', border: '1px solid #5c5445', color: '#2c2416' }}
                              required
                           />
                        </div>
                        <div>
                           <label className="block text-xs font-bold mb-1" style={{ color: '#5c5445' }}>
                              TO *
                           </label>
                           <input
                              type="text"
                              value={flightArrival}
                              onChange={(e) => setFlightArrival(e.target.value)}
                              placeholder="CDG"
                              className="w-full px-3 py-2 rounded text-sm text-center font-bold"
                              style={{ background: '#fff', border: '1px solid #5c5445', color: '#2c2416' }}
                              required
                           />
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <input
                           type="text"
                           value={airline}
                           onChange={(e) => setAirline(e.target.value)}
                           placeholder="Airline"
                           className="w-full px-3 py-2 rounded text-sm"
                           style={{ background: '#fff', border: '1px solid #5c5445', color: '#2c2416' }}
                        />
                        <input
                           type="text"
                           value={flightNumber}
                           onChange={(e) => setFlightNumber(e.target.value)}
                           placeholder="Flight #"
                           className="w-full px-3 py-2 rounded text-sm"
                           style={{ background: '#fff', border: '1px solid #5c5445', color: '#2c2416' }}
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <div>
                           <label className="block text-xs font-bold mb-1" style={{ color: '#5c5445' }}>DEPARTURE</label>
                           <input
                              type="datetime-local"
                              value={flightDepartureTime}
                              onChange={(e) => setFlightDepartureTime(e.target.value)}
                              className="w-full px-2 py-2 rounded text-sm"
                              style={{ background: '#fff', border: '1px solid #5c5445', color: '#2c2416' }}
                           />
                        </div>
                        <div>
                           <label className="block text-xs font-bold mb-1" style={{ color: '#5c5445' }}>ARRIVAL</label>
                           <input
                              type="datetime-local"
                              value={flightArrivalTime}
                              onChange={(e) => setFlightArrivalTime(e.target.value)}
                              className="w-full px-2 py-2 rounded text-sm"
                              style={{ background: '#fff', border: '1px solid #5c5445', color: '#2c2416' }}
                           />
                        </div>
                     </div>
                     <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2 rounded font-bold text-sm transition-all hover:scale-[1.02] disabled:opacity-50"
                        style={{
                           background: 'linear-gradient(135deg, #c9a227, #a88520)',
                           color: '#2c2416',
                           border: '2px solid #2c2416',
                        }}
                     >
                        {isSubmitting ? 'Adding...' : '✓ Add Flight'}
                     </button>
                  </form>
               ) : (
                  <form onSubmit={handleAddTrain} className="p-3 space-y-3">
                     <div className="grid grid-cols-2 gap-3">
                        <div>
                           <label className="block text-xs font-bold mb-1" style={{ color: '#5c5445' }}>FROM *</label>
                           <input
                              type="text"
                              value={trainDeparture}
                              onChange={(e) => setTrainDeparture(e.target.value)}
                              placeholder="Station"
                              className="w-full px-3 py-2 rounded text-sm"
                              style={{ background: '#fff', border: '1px solid #5c5445', color: '#2c2416' }}
                              required
                           />
                        </div>
                        <div>
                           <label className="block text-xs font-bold mb-1" style={{ color: '#5c5445' }}>TO *</label>
                           <input
                              type="text"
                              value={trainArrival}
                              onChange={(e) => setTrainArrival(e.target.value)}
                              placeholder="Station"
                              className="w-full px-3 py-2 rounded text-sm"
                              style={{ background: '#fff', border: '1px solid #5c5445', color: '#2c2416' }}
                              required
                           />
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <input
                           type="text"
                           value={operator}
                           onChange={(e) => setOperator(e.target.value)}
                           placeholder="Operator"
                           className="w-full px-3 py-2 rounded text-sm"
                           style={{ background: '#fff', border: '1px solid #5c5445', color: '#2c2416' }}
                        />
                        <input
                           type="text"
                           value={trainNumber}
                           onChange={(e) => setTrainNumber(e.target.value)}
                           placeholder="Train #"
                           className="w-full px-3 py-2 rounded text-sm"
                           style={{ background: '#fff', border: '1px solid #5c5445', color: '#2c2416' }}
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-3">
                        <div>
                           <label className="block text-xs font-bold mb-1" style={{ color: '#5c5445' }}>DEPARTURE</label>
                           <input
                              type="datetime-local"
                              value={trainDepartureTime}
                              onChange={(e) => setTrainDepartureTime(e.target.value)}
                              className="w-full px-2 py-2 rounded text-sm"
                              style={{ background: '#fff', border: '1px solid #5c5445', color: '#2c2416' }}
                           />
                        </div>
                        <div>
                           <label className="block text-xs font-bold mb-1" style={{ color: '#5c5445' }}>ARRIVAL</label>
                           <input
                              type="datetime-local"
                              value={trainArrivalTime}
                              onChange={(e) => setTrainArrivalTime(e.target.value)}
                              className="w-full px-2 py-2 rounded text-sm"
                              style={{ background: '#fff', border: '1px solid #5c5445', color: '#2c2416' }}
                           />
                        </div>
                     </div>
                     <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2 rounded font-bold text-sm transition-all hover:scale-[1.02] disabled:opacity-50"
                        style={{
                           background: 'linear-gradient(135deg, #c9a227, #a88520)',
                           color: '#2c2416',
                           border: '2px solid #2c2416',
                        }}
                     >
                        {isSubmitting ? 'Adding...' : '✓ Add Train'}
                     </button>
                  </form>
               )}
            </div>
         )}

         {/* List */}
         <div className="space-y-2 max-h-64 overflow-y-auto">
            {activeTab === 'flights' ? (
               flights.length === 0 ? (
                  <div className="text-center py-4">
                     <p className="text-sm" style={{ color: '#5c5445' }}>No flights added</p>
                  </div>
               ) : (
                  flights.map((flight) => (
                     <div
                        key={flight.id}
                        className="rounded-lg overflow-hidden relative group"
                        style={{
                           background: 'linear-gradient(to right, #fff 0%, #fff 75%, #f5f0e6 75%)',
                           border: '1px dashed #5c5445',
                        }}
                     >
                        {/* Boarding pass cutouts */}
                        <div
                           className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full"
                           style={{ background: '#f5f0e6' }}
                        />
                        <div
                           className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 rounded-full"
                           style={{ background: '#f5f0e6' }}
                        />

                        <div className="p-3 flex items-center gap-3">
                           <div className="flex items-center gap-2 flex-1">
                              <div className="text-center">
                                 <div className="text-lg font-bold" style={{ color: '#1e4d8c' }}>
                                    {flight.departureAirport}
                                 </div>
                                 {flight.times.departure && (
                                    <div className="text-xs" style={{ color: '#5c5445' }}>
                                       {formatTime(flight.times.departure)}
                                    </div>
                                 )}
                              </div>
                              <div className="flex-1 flex items-center justify-center">
                                 <div className="flex items-center gap-1">
                                    <div className="h-px w-6" style={{ background: '#c9a227' }} />
                                    <span style={{ color: '#1e4d8c' }}>✈</span>
                                    <div className="h-px w-6" style={{ background: '#c9a227' }} />
                                 </div>
                              </div>
                              <div className="text-center">
                                 <div className="text-lg font-bold" style={{ color: '#1e4d8c' }}>
                                    {flight.arrivalAirport}
                                 </div>
                                 {flight.times.arrival && (
                                    <div className="text-xs" style={{ color: '#5c5445' }}>
                                       {formatTime(flight.times.arrival)}
                                    </div>
                                 )}
                              </div>
                           </div>

                           {/* Right stub */}
                           <div
                              className="border-l-2 border-dashed pl-3 text-center"
                              style={{ borderColor: '#5c5445' }}
                           >
                              {(flight.airline || flight.number) && (
                                 <div className="text-xs" style={{ color: '#5c5445' }}>
                                    {flight.airline}
                                    {flight.airline && flight.number && <br />}
                                    {flight.number && <span className="font-bold">{flight.number}</span>}
                                 </div>
                              )}
                           </div>

                           {/* Delete button */}
                           <button
                              onClick={() => onDeleteFlight(flight.id)}
                              className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                              style={{ color: '#c41e3a' }}
                           >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                           </button>
                        </div>
                     </div>
                  ))
               )
            ) : trains.length === 0 ? (
               <div className="text-center py-4">
                  <p className="text-sm" style={{ color: '#5c5445' }}>No trains added</p>
               </div>
            ) : (
               trains.map((train) => (
                  <div
                     key={train.id}
                     className="rounded-lg overflow-hidden relative group"
                     style={{
                        background: 'linear-gradient(to right, #fff 0%, #fff 75%, #f5f0e6 75%)',
                        border: '1px dashed #5c5445',
                     }}
                  >
                     {/* Ticket cutouts */}
                     <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full"
                        style={{ background: '#f5f0e6' }}
                     />
                     <div
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-4 h-4 rounded-full"
                        style={{ background: '#f5f0e6' }}
                     />

                     <div className="p-3 flex items-center gap-3">
                        <div className="flex items-center gap-2 flex-1">
                           <div className="text-center">
                              <div className="text-sm font-bold" style={{ color: '#2d5a3d' }}>
                                 {train.departureStation}
                              </div>
                              {train.times.departure && (
                                 <div className="text-xs" style={{ color: '#5c5445' }}>
                                    {formatTime(train.times.departure)}
                                 </div>
                              )}
                           </div>
                           <div className="flex-1 flex items-center justify-center">
                              <div className="flex items-center gap-1">
                                 <div className="h-px w-6" style={{ background: '#c9a227' }} />
                                 <span style={{ color: '#2d5a3d' }}>🚂</span>
                                 <div className="h-px w-6" style={{ background: '#c9a227' }} />
                              </div>
                           </div>
                           <div className="text-center">
                              <div className="text-sm font-bold" style={{ color: '#2d5a3d' }}>
                                 {train.arrivalStation}
                              </div>
                              {train.times.arrival && (
                                 <div className="text-xs" style={{ color: '#5c5445' }}>
                                    {formatTime(train.times.arrival)}
                                 </div>
                              )}
                           </div>
                        </div>

                        {/* Right stub */}
                        <div
                           className="border-l-2 border-dashed pl-3 text-center"
                           style={{ borderColor: '#5c5445' }}
                        >
                           {(train.operator || train.number) && (
                              <div className="text-xs" style={{ color: '#5c5445' }}>
                                 {train.operator}
                                 {train.operator && train.number && <br />}
                                 {train.number && <span className="font-bold">{train.number}</span>}
                              </div>
                           )}
                        </div>

                        {/* Delete button */}
                        <button
                           onClick={() => onDeleteTrain(train.id)}
                           className="p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                           style={{ color: '#c41e3a' }}
                        >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                           </svg>
                        </button>
                     </div>
                  </div>
               ))
            )}
         </div>
      </div>
   );
}
