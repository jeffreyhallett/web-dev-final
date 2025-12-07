# Travel Planner - Implementation Guide

This guide outlines what has been implemented and what still needs to be built in the Travel Planner application.

## ⚠️ ARCHITECTURAL CHANGE: Trip-Centric Model

**The application now uses a trip-centric data model instead of city-centric:**
- **Primary data structure:** Trips (not cities)
- **User differentiation:** All trips are associated with a userId
- **Data organization:** Each trip contains cities, activities, accommodations, transportation, and notes
- **State management:** App manages trips array, not separate city/activity records

---

## Current Status Overview

| Category | Status |
|----------|--------|
| UI Components | ~70% Complete |
| Type Definitions | Needs Update (add userId) |
| Google Maps Integration | Complete |
| Database Layer | Not Started |
| API Routes | Not Started |
| Data Persistence | Not Started |
| Forms & Validation | Partial |
| Testing | Not Started |

---

## What's Already Implemented

### Core Components
- **Header** (`src/components/layout/header.tsx`) - View toggle buttons (List/Map)
- **City List Sidebar** (`src/components/city/cityList.tsx`) - City selection with highlight
- **Trip View** (`src/components/city/tripView.tsx`) - 3-column layout with activities, map, and trip form
- **Activity Card** (`src/components/ui/activityCard.tsx`) - Basic activity display
- **City View Map** (`src/components/map/cityViewMap.tsx`) - Google Maps with markers

### Data Types (`src/types/index.ts`)
TypeScript interfaces are defined but need updates:
- `Trip` - **NEEDS UPDATE:** Add `userId` and optional `name` field
- `City`, `Activity`, `Accommodation`, `Flight`, `Train`, `Note` - Complete

### Infrastructure
- TailwindCSS v4 styling
- ESLint + Prettier configuration
- Google Maps hook (`src/lib/hooks/googleMapsHook.ts`)
- Neon Database dependency installed (not used yet)

---

## Migration Plan: Existing Code → Trip-Centric Architecture

This section outlines how to migrate existing components and code from the city-centric model to the new trip-centric architecture.

### Step 1: Update Type Definitions

**File:** `src/types/index.ts`

**Changes needed:**
```typescript
// ADD userId and name to Trip interface
export interface Trip {
   id: string;
   userId: string;        // NEW: Add this field
   name?: string;         // NEW: Add optional trip name
   cities: City[];
   dates: {
      arrival: string;
      departure: string;
   };
   accommodation: Accommodation[];
   activities: Activity[];
   transportation: {
      flights?: Flight[];
      trainRides?: Train[];
   };
   notes: Note[];
}

// No changes needed for other interfaces
```

---

### Step 2: Refactor page.tsx (Main State Management)

**File:** `src/app/page.tsx`

**Current code structure:**
```typescript
// OLD - City-centric state
const [selectedCity, setSelectedCity] = useState<City>({...});
const [activities, setActivities] = useState<Record<string, Activity[]>>({});
const [trips, setTrips] = useState<Record<string, Trip>>({});
const [notes, setNotes] = useState<Record<string, Note[]>>({});
const [accommodations, setAccommodations] = useState<Record<string, Accommodation[]>>({});
const [cities, setCities] = useState<City[]>([...]);
```

**Replace with trip-centric state:**
```typescript
// NEW - Trip-centric state
const [trips, setTrips] = useState<Trip[]>([]);
const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
const [view, setView] = useState<'list' | 'map'>('list');

// Derived values (computed from state)
const selectedTrip = trips.find(t => t.id === selectedTripId);
const selectedCity = selectedTrip?.cities.find(c => c.id === selectedCityId);
```

**Complete refactored page.tsx:**
```typescript
'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/layout/header';
import TripList from '@/components/trip/tripList';  // RENAMED from CityList
import TripView from '@/components/city/tripView';
import { Trip, City, Activity } from '@/types';

export default function HomePage() {
   const [view, setView] = useState<'list' | 'map'>('list');
   const [trips, setTrips] = useState<Trip[]>([]);
   const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
   const [selectedCityId, setSelectedCityId] = useState<string | null>(null);

   // Derived values
   const selectedTrip = trips.find(t => t.id === selectedTripId);
   const selectedCity = selectedTrip?.cities.find(c => c.id === selectedCityId);

   // Load all trips on mount
   useEffect(() => {
      const fetchTrips = async () => {
         try {
            const response = await fetch('/api/trips');
            const data = await response.json();
            setTrips(data);

            // Auto-select first trip and first city
            if (data.length > 0) {
               setSelectedTripId(data[0].id);
               if (data[0].cities.length > 0) {
                  setSelectedCityId(data[0].cities[0].id);
               }
            }
         } catch (error) {
            console.error('Failed to fetch trips:', error);
         }
      };

      fetchTrips();
   }, []);

   // Add city to current trip
   const handleAddCity = async (city: Omit<City, 'id'>) => {
      if (!selectedTripId) return;

      try {
         const response = await fetch(`/api/trips/${selectedTripId}/cities`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               ...city,
               orderIndex: selectedTrip?.cities.length || 0,
            }),
         });

         if (response.ok) {
            const newCity = await response.json();
            setTrips(prev => prev.map(t =>
               t.id === selectedTripId
                  ? { ...t, cities: [...t.cities, newCity] }
                  : t
            ));
         }
      } catch (error) {
         console.error('Failed to add city:', error);
      }
   };

   // Update activities within a trip
   const handleUpdateActivities = async (newActivities: Activity[]) => {
      if (!selectedTripId) return;

      setTrips(prev => prev.map(t =>
         t.id === selectedTripId
            ? { ...t, activities: newActivities }
            : t
      ));

      // Also persist to backend
      try {
         await fetch(`/api/trips/${selectedTripId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ activities: newActivities }),
         });
      } catch (error) {
         console.error('Failed to update activities:', error);
      }
   };

   // Update entire trip
   const handleUpdateTrip = async (updates: Partial<Trip>) => {
      if (!selectedTripId) return;

      try {
         const response = await fetch(`/api/trips/${selectedTripId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
         });

         if (response.ok) {
            const updatedTrip = await response.json();
            setTrips(prev => prev.map(t => t.id === selectedTripId ? updatedTrip : t));
         }
      } catch (error) {
         console.error('Failed to update trip:', error);
      }
   };

   return (
      <div className="flex flex-col h-screen">
         <Header view={view} onViewChange={setView} />
         <div className="flex flex-1 overflow-hidden">
            <aside className="w-64 flex flex-col">
               <div className="px-4 py-8 flex-1">
                  <TripList
                     trips={trips}
                     selectedTripId={selectedTripId}
                     selectedCityId={selectedCityId}
                     onSelectTrip={setSelectedTripId}
                     onSelectCity={setSelectedCityId}
                     onAddCity={handleAddCity}
                  />
               </div>
            </aside>
            <main className="flex-1 flex flex-col">
               <div className="px-4 py-8 flex-1 w-full">
                  {selectedTrip && selectedCity ? (
                     <TripView
                        trip={selectedTrip}
                        city={selectedCity}
                        activities={selectedTrip.activities.filter(a => a.city.id === selectedCityId)}
                        onUpdateActivities={handleUpdateActivities}
                        onUpdateTrip={handleUpdateTrip}
                     />
                  ) : (
                     <div className="flex items-center justify-center h-full text-gray-500">
                        Select a trip and city to get started
                     </div>
                  )}
               </div>
            </main>
         </div>
      </div>
   );
}
```

---

### Step 3: Refactor CityList → TripList Component

**File:** Rename `src/components/city/cityList.tsx` → `src/components/trip/tripList.tsx`

**Changes needed:**

1. **Add trip selector dropdown at the top**
2. **Show cities for the selected trip only**
3. **Update props interface**

**New component structure:**
```typescript
'use client';

import { City, Trip } from '@/types';

interface TripListProps {
   trips: Trip[];
   selectedTripId: string | null;
   selectedCityId: string | null;
   onSelectTrip: (tripId: string) => void;
   onSelectCity: (cityId: string) => void;
   onAddCity: (city: Omit<City, 'id'>) => void;
}

export default function TripList({
   trips,
   selectedTripId,
   selectedCityId,
   onSelectTrip,
   onSelectCity,
   onAddCity,
}: TripListProps) {
   const selectedTrip = trips.find(t => t.id === selectedTripId);

   return (
      <div className="space-y-4">
         {/* Trip Selector Dropdown */}
         <div>
            <label className="block text-sm font-medium mb-2">Select Trip</label>
            <select
               value={selectedTripId || ''}
               onChange={(e) => onSelectTrip(e.target.value)}
               className="w-full px-3 py-2 border rounded-lg"
            >
               <option value="">Choose a trip...</option>
               {trips.map(trip => (
                  <option key={trip.id} value={trip.id}>
                     {trip.name || `Trip ${trip.id}`}
                  </option>
               ))}
            </select>
         </div>

         {/* Cities List for Selected Trip */}
         {selectedTrip && (
            <div>
               <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium">Cities</h3>
                  <button
                     onClick={() => {/* Open add city modal */}}
                     className="text-2xl hover:bg-gray-100 rounded"
                  >
                     +
                  </button>
               </div>

               <div className="space-y-2">
                  {selectedTrip.cities.map((city) => (
                     <button
                        key={city.id}
                        onClick={() => onSelectCity(city.id)}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                           selectedCityId === city.id
                              ? 'bg-blue-100 border-2 border-blue-500'
                              : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                     >
                        <div className="font-medium">{city.name}</div>
                        <div className="text-sm text-gray-600">{city.country}</div>
                     </button>
                  ))}
               </div>
            </div>
         )}
      </div>
   );
}
```

**Key changes:**
- Added trip selector dropdown at top
- Cities list now filtered by `selectedTrip.cities`
- Props updated to include trip management
- Handles both trip and city selection

---

### Step 4: Update TripView Component

**File:** `src/components/city/tripView.tsx`

**Current props:**
```typescript
// OLD
interface TripViewProps {
   city: City;
   trip?: Trip;
   activities: Activity[];
   onUpdateActivities: (activities: Activity[]) => void;
   onUpdateTrip: () => void;  // Empty function
}
```

**Updated props:**
```typescript
// NEW
interface TripViewProps {
   trip: Trip;           // Now required, not optional
   city: City;           // Current city being viewed
   activities: Activity[];  // Activities filtered for this city
   onUpdateActivities: (activities: Activity[]) => void;
   onUpdateTrip: (updates: Partial<Trip>) => void;  // Now functional
}
```

**Changes to component body:**

1. **Access trip data directly from `trip` prop**
2. **Filter activities by city within component if needed**
3. **Update accommodation/transportation handlers to update trip**

**Example changes:**
```typescript
export default function TripView({
   trip,
   city,
   activities,
   onUpdateActivities,
   onUpdateTrip,
}: TripViewProps) {
   // Get accommodations for this city
   const cityAccommodations = trip.accommodation.filter(a => a.city.id === city.id);

   // Handler for updating accommodation
   const handleUpdateAccommodation = (newAccommodation: Accommodation) => {
      const updatedAccommodations = [...trip.accommodation];
      const index = updatedAccommodations.findIndex(a => a.id === newAccommodation.id);

      if (index !== -1) {
         updatedAccommodations[index] = newAccommodation;
      } else {
         updatedAccommodations.push(newAccommodation);
      }

      onUpdateTrip({ accommodation: updatedAccommodations });
   };

   // Handler for updating notes
   const handleUpdateNotes = (newNote: string) => {
      const updatedNotes = [
         ...trip.notes,
         {
            id: Date.now().toString(),
            content: newNote,
            date: new Date().toISOString(),
         }
      ];

      onUpdateTrip({ notes: updatedNotes });
   };

   // Rest of component remains similar, but uses trip.* for data access
   return (
      <div className="grid grid-cols-3 gap-6 h-full">
         {/* Activities Column */}
         <div className="flex flex-col">
            {/* ... existing activity list code ... */}
         </div>

         {/* Map Column */}
         <div className="flex flex-col">
            <CityViewMap city={city} />
         </div>

         {/* Trip Details Column */}
         <div className="flex flex-col space-y-4">
            {/* Show trip dates */}
            <div className="bg-white p-4 rounded-lg shadow">
               <h3 className="font-semibold mb-2">Trip Dates</h3>
               <p className="text-sm">
                  {trip.dates.arrival} - {trip.dates.departure}
               </p>
            </div>

            {/* Accommodation form - use cityAccommodations */}
            <div className="bg-white p-4 rounded-lg shadow">
               {/* ... existing accommodation form ... */}
            </div>

            {/* Transportation - access trip.transportation */}
            <div className="bg-white p-4 rounded-lg shadow">
               {/* ... existing transportation form ... */}
            </div>
         </div>
      </div>
   );
}
```

---

### Step 5: Update ActivityCard Component

**File:** `src/components/ui/activityCard.tsx`

**Changes needed:** Minimal - this component is already well-structured

The ActivityCard component should continue to work as-is. You may want to add city information display if an activity could be in multiple cities:

```typescript
// Optional enhancement
export default function ActivityCard({ activity, onToggle }: ActivityCardProps) {
   return (
      <div className="border rounded-lg p-4">
         <h4 className="font-semibold">{activity.name}</h4>
         <p className="text-sm text-gray-600">{activity.description}</p>

         {/* NEW: Show which city this activity is in */}
         <p className="text-xs text-gray-500 mt-1">
            📍 {activity.city.name}
         </p>

         <button onClick={onToggle}>
            {activity.inTravelPlan ? 'Remove from plan' : 'Add to plan'}
         </button>
      </div>
   );
}
```

---

### Step 6: Update CityViewMap Component

**File:** `src/components/map/cityViewMap.tsx`

**No major changes needed** - this component already receives a `city` prop and displays it.

**Optional enhancement:** Show all cities in the trip with flight paths between them:

```typescript
interface CityViewMapProps {
   city: City;           // Current city (centered)
   allCities?: City[];   // NEW: All cities in the trip
   showFlightPaths?: boolean;  // NEW: Option to show connections
}

export default function CityViewMap({ city, allCities, showFlightPaths }: CityViewMapProps) {
   // ... existing map code ...

   // If allCities provided, show all markers and flight paths
   useEffect(() => {
      if (!map || !allCities) return;

      // Add markers for all cities
      allCities.forEach(c => {
         const marker = new google.maps.Marker({
            position: { lat: c.latitude, lng: c.longitude },
            map: map,
            title: c.name,
         });
      });

      // Draw flight paths between consecutive cities
      if (showFlightPaths && allCities.length > 1) {
         for (let i = 0; i < allCities.length - 1; i++) {
            const path = new google.maps.Polyline({
               path: [
                  { lat: allCities[i].latitude, lng: allCities[i].longitude },
                  { lat: allCities[i + 1].latitude, lng: allCities[i + 1].longitude },
               ],
               geodesic: true,
               strokeColor: '#4285F4',
               strokeOpacity: 0.7,
               strokeWeight: 2,
               map: map,
            });
         }
      }
   }, [map, allCities, showFlightPaths]);

   // ... rest of component ...
}
```

---

### Step 7: Create New Components (if needed)

**New component:** `src/components/trip/addTripModal.tsx`

This is a new component to allow users to create new trips:

```typescript
'use client';

import { useState } from 'react';

interface AddTripModalProps {
   isOpen: boolean;
   onClose: () => void;
   onTripAdded: (trip: Trip) => void;
}

export default function AddTripModal({ isOpen, onClose, onTripAdded }: AddTripModalProps) {
   const [name, setName] = useState('');
   const [arrivalDate, setArrivalDate] = useState('');
   const [departureDate, setDepartureDate] = useState('');

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      try {
         const response = await fetch('/api/trips', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               name,
               arrivalDate,
               departureDate,
            }),
         });

         if (response.ok) {
            const newTrip = await response.json();
            onTripAdded(newTrip);
            onClose();
            setName('');
            setArrivalDate('');
            setDepartureDate('');
         }
      } catch (error) {
         console.error('Failed to create trip:', error);
      }
   };

   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
         <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Create New Trip</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                  <label className="block text-sm font-medium mb-1">Trip Name</label>
                  <input
                     type="text"
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     className="w-full px-3 py-2 border rounded-lg"
                     placeholder="Summer Europe 2025"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium mb-1">Arrival Date</label>
                  <input
                     type="date"
                     value={arrivalDate}
                     onChange={(e) => setArrivalDate(e.target.value)}
                     required
                     className="w-full px-3 py-2 border rounded-lg"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium mb-1">Departure Date</label>
                  <input
                     type="date"
                     value={departureDate}
                     onChange={(e) => setDepartureDate(e.target.value)}
                     required
                     className="w-full px-3 py-2 border rounded-lg"
                  />
               </div>
               <div className="flex justify-end gap-2">
                  <button
                     type="button"
                     onClick={onClose}
                     className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                     Cancel
                  </button>
                  <button
                     type="submit"
                     className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                     Create Trip
                  </button>
               </div>
            </form>
         </div>
      </div>
   );
}
```

---

### Migration Checklist

Use this checklist to track your migration progress:

- [ ] **Types**: Add `userId` and `name` to Trip interface in `src/types/index.ts`
- [ ] **page.tsx**: Replace city-centric state with trip-centric state
- [ ] **page.tsx**: Add trip fetching useEffect
- [ ] **page.tsx**: Implement handleAddCity, handleUpdateActivities, handleUpdateTrip
- [ ] **page.tsx**: Update JSX to use new TripList component
- [ ] **Rename**: `cityList.tsx` → `trip/tripList.tsx`
- [ ] **TripList**: Add trip selector dropdown
- [ ] **TripList**: Filter cities by selected trip
- [ ] **TripList**: Update props interface
- [ ] **TripView**: Make `trip` prop required instead of optional
- [ ] **TripView**: Update handlers to use `onUpdateTrip` with partial updates
- [ ] **TripView**: Filter accommodations/notes by city where appropriate
- [ ] **ActivityCard**: Optional - add city name display
- [ ] **CityViewMap**: Optional - add support for showing all trip cities
- [ ] **Create**: `addTripModal.tsx` component
- [ ] **Test**: Verify all existing functionality still works with new structure

---

## What Needs To Be Implemented

### Priority 1: Database & API Layer

#### 1.1 Database Schema Setup
**Location:** Create `src/lib/db/` directory

**Steps:**
1. Create `src/lib/db/index.ts` - Database connection using Neon:
```typescript
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);
export default sql;
```

2. Create database tables (run via SQL or migration):
```sql
-- Users table (for future authentication)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trips table (PRIMARY data structure)
CREATE TABLE trips (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255),  -- e.g., "Summer Europe 2025"
  arrival_date DATE,
  departure_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trip Cities (many-to-many relationship)
CREATE TABLE trip_cities (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  order_index INTEGER NOT NULL,  -- Order of cities in the trip
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activities (belongs to a trip and associated with a city)
CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  city_id INTEGER REFERENCES trip_cities(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  time TIME,
  image_url TEXT,
  activity_url TEXT,
  in_travel_plan BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Accommodations (belongs to a trip and city)
CREATE TABLE accommodations (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  city_id INTEGER REFERENCES trip_cities(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  check_in DATE,
  check_out DATE,
  url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Flights (transportation within a trip)
CREATE TABLE flights (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  flight_number VARCHAR(50),
  airline VARCHAR(255),
  departure_airport VARCHAR(10) NOT NULL,
  arrival_airport VARCHAR(10) NOT NULL,
  departure_time TIMESTAMP,
  arrival_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trains (transportation within a trip)
CREATE TABLE trains (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  train_number VARCHAR(50),
  operator VARCHAR(255),
  departure_station VARCHAR(255) NOT NULL,
  arrival_station VARCHAR(255) NOT NULL,
  departure_time TIMESTAMP,
  arrival_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notes (belongs to a trip)
CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX idx_trips_user_id ON trips(user_id);
CREATE INDEX idx_trip_cities_trip_id ON trip_cities(trip_id);
CREATE INDEX idx_activities_trip_id ON activities(trip_id);
CREATE INDEX idx_accommodations_trip_id ON accommodations(trip_id);
CREATE INDEX idx_flights_trip_id ON flights(trip_id);
CREATE INDEX idx_trains_trip_id ON trains(trip_id);
CREATE INDEX idx_notes_trip_id ON notes(trip_id);
```

3. Add `DATABASE_URL` to `.env.local`:
```
DATABASE_URL=your_neon_connection_string
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_existing_key
```

#### 1.2 API Routes
**Location:** Create `src/app/api/` directory

**Files to create (Trip-Centric Architecture):**

| File | Purpose |
|------|---------|
| `src/app/api/trips/route.ts` | GET all trips for user, POST new trip |
| `src/app/api/trips/[id]/route.ts` | GET, PUT, DELETE single trip |
| `src/app/api/trips/[id]/cities/route.ts` | GET/POST cities for a trip |
| `src/app/api/trips/[id]/cities/[cityId]/route.ts` | PUT, DELETE city in trip |
| `src/app/api/trips/[id]/activities/route.ts` | GET/POST activities for a trip |
| `src/app/api/trips/[id]/activities/[activityId]/route.ts` | PUT, DELETE activity |
| `src/app/api/trips/[id]/accommodations/route.ts` | GET/POST accommodations |
| `src/app/api/trips/[id]/notes/route.ts` | GET/POST notes |
| `src/app/api/trips/[id]/transportation/route.ts` | GET/POST flights and trains |

**Example API route (`src/app/api/trips/route.ts`):**
```typescript
import { NextResponse } from 'next/server';
import sql from '@/lib/db';

// GET all trips for a user
export async function GET(request: Request) {
  try {
    // For now, hardcode userId = 1 (add auth later)
    const userId = 1;

    const trips = await sql`
      SELECT * FROM trips
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    // For each trip, fetch related data
    const tripsWithData = await Promise.all(
      trips.map(async (trip) => {
        const [cities, activities, accommodations, flights, trains, notes] = await Promise.all([
          sql`SELECT * FROM trip_cities WHERE trip_id = ${trip.id} ORDER BY order_index`,
          sql`SELECT * FROM activities WHERE trip_id = ${trip.id}`,
          sql`SELECT * FROM accommodations WHERE trip_id = ${trip.id}`,
          sql`SELECT * FROM flights WHERE trip_id = ${trip.id}`,
          sql`SELECT * FROM trains WHERE trip_id = ${trip.id}`,
          sql`SELECT * FROM notes WHERE trip_id = ${trip.id}`,
        ]);

        return {
          ...trip,
          cities,
          activities,
          accommodations,
          transportation: { flights, trainRides: trains },
          notes,
        };
      })
    );

    return NextResponse.json(tripsWithData);
  } catch (error) {
    console.error('Failed to fetch trips:', error);
    return NextResponse.json({ error: 'Failed to fetch trips' }, { status: 500 });
  }
}

// POST new trip
export async function POST(request: Request) {
  try {
    const userId = 1; // Hardcoded for now
    const body = await request.json();
    const { name, arrivalDate, departureDate } = body;

    const result = await sql`
      INSERT INTO trips (user_id, name, arrival_date, departure_date)
      VALUES (${userId}, ${name}, ${arrivalDate}, ${departureDate})
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Failed to create trip:', error);
    return NextResponse.json({ error: 'Failed to create trip' }, { status: 500 });
  }
}
```

**Example: Adding a city to a trip (`src/app/api/trips/[id]/cities/route.ts`):**
```typescript
import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tripId = parseInt(params.id);
    const { name, country, latitude, longitude, orderIndex } = await request.json();

    const result = await sql`
      INSERT INTO trip_cities (trip_id, name, country, latitude, longitude, order_index)
      VALUES (${tripId}, ${name}, ${country}, ${latitude}, ${longitude}, ${orderIndex})
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Failed to add city to trip:', error);
    return NextResponse.json({ error: 'Failed to add city' }, { status: 500 });
  }
}
```

---

### Priority 2: Forms & Modals

#### 2.1 Add City Modal
**Location:** Create `src/components/city/addCityModal.tsx`

**Current state:** Button exists in `cityList.tsx:42` but does nothing

**Implementation steps:**
1. Create modal component with form fields:
   - City name (required)
   - Country (required)
   - Latitude (required, number)
   - Longitude (required, number)
2. Add state in `page.tsx` to control modal visibility
3. Wire up the "+" button in `cityList.tsx` to open modal
4. On submit, POST to `/api/cities` and update local state

**Suggested UI:**
```typescript
interface AddCityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCityAdded: (city: City) => void;
}
```

#### 2.2 Add Activity Modal
**Location:** Create `src/components/activity/addActivityModal.tsx`

**Current state:** Button exists in `tripView.tsx:49-50` with empty function

**Implementation steps:**
1. Create modal with fields:
   - Activity name (required)
   - Description (optional)
   - Image URL (optional)
   - Activity URL (optional)
   - Duration in minutes (optional)
   - Add to travel plan (checkbox)
2. Wire up the "+" button in tripView to open modal
3. POST to `/api/activities` with selected city ID

#### 2.3 Complete Transportation Form
**Location:** `src/components/city/tripView.tsx:113-116`

**Current state:** Only has a "Transportation" label, no inputs

**Implementation steps:**
1. Add tabbed interface for Flight vs Train
2. For Flight, add inputs:
   - Airline
   - Departure airport code
   - Arrival airport code
   - Departure time (datetime picker)
   - Arrival time (datetime picker)
3. For Train, add inputs:
   - Operator
   - Departure station
   - Arrival station
   - Departure time
   - Arrival time

#### 2.4 Complete Accommodation Form
**Location:** `src/components/city/tripView.tsx:89-110`

**Current state:** Only has name input

**Missing fields:**
- Address (text input)
- Check-in date (date picker)
- Check-out date (date picker)

---

### Priority 3: State Management & Persistence

#### 3.1 Refactor State Management in page.tsx
**Location:** `src/app/page.tsx`

**Current state:** City-centric with separate records for activities, notes, etc.

**New state structure:**
```typescript
'use client';

import { useState, useEffect } from 'react';
import { Trip, City } from '@/types';

export default function HomePage() {
  // Core state - Trip-centric
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [view, setView] = useState<'list' | 'map'>('list');

  // Derived values
  const selectedTrip = trips.find(t => t.id === selectedTripId);
  const selectedCity = selectedTrip?.cities.find(c => c.id === selectedCityId);

  // Load all trips on mount
  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await fetch('/api/trips');
        const data = await response.json();
        setTrips(data);

        // Auto-select first trip and first city
        if (data.length > 0) {
          setSelectedTripId(data[0].id);
          if (data[0].cities.length > 0) {
            setSelectedCityId(data[0].cities[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch trips:', error);
      }
    };

    fetchTrips();
  }, []);

  // Update trip handler
  const handleUpdateTrip = async (tripId: string, updates: Partial<Trip>) => {
    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        const updatedTrip = await response.json();
        setTrips(prev => prev.map(t => t.id === tripId ? updatedTrip : t));
      }
    } catch (error) {
      console.error('Failed to update trip:', error);
    }
  };

  // Add city to current trip
  const handleAddCity = async (city: Omit<City, 'id'>) => {
    if (!selectedTripId) return;

    try {
      const response = await fetch(`/api/trips/${selectedTripId}/cities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...city,
          orderIndex: selectedTrip?.cities.length || 0,
        }),
      });

      if (response.ok) {
        const newCity = await response.json();
        setTrips(prev => prev.map(t =>
          t.id === selectedTripId
            ? { ...t, cities: [...t.cities, newCity] }
            : t
        ));
      }
    } catch (error) {
      console.error('Failed to add city:', error);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header view={view} onViewChange={setView} />
      <div className="flex flex-1 overflow-hidden">
        {/* Trip/City selector sidebar */}
        <aside className="w-64 flex flex-col">
          <div className="px-4 py-8 flex-1">
            {/* Show trip selector + city list */}
            <TripList
              trips={trips}
              selectedTripId={selectedTripId}
              selectedCityId={selectedCityId}
              onSelectTrip={setSelectedTripId}
              onSelectCity={setSelectedCityId}
              onAddCity={handleAddCity}
            />
          </div>
        </aside>

        {/* Main content area */}
        <main className="flex-1 flex flex-col">
          <div className="px-4 py-8 flex-1 w-full">
            {selectedTrip && selectedCity && (
              <CityView
                trip={selectedTrip}
                city={selectedCity}
                onUpdateTrip={handleUpdateTrip}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
```

---

### Priority 4: View Switching

#### 4.1 Implement List vs Map View Toggle
**Location:** `src/app/page.tsx`

**Current state:** `isListView` state exists, buttons toggle it, but view doesn't change

**Implementation:**
```typescript
// In the main content area, conditionally render:
{isListView ? (
  <ActivityListView
    activities={activities.filter(a => a.cityId === selectedCity?.id)}
  />
) : (
  <TripView
    city={selectedCity}
    activities={cityActivities}
    // ... other props
  />
)}
```

**Create new component:** `src/components/activity/activityListView.tsx`
- Display all activities in a scrollable list format
- Each activity shows full details
- Toggle button to add/remove from travel plan

---

### Priority 5: Edit & Delete Features

#### 5.1 Edit City
- Add edit button/icon to each city in the list
- Reuse AddCityModal with pre-filled values
- PUT to `/api/cities/[id]`

#### 5.2 Delete City
- Add delete button with confirmation dialog
- DELETE to `/api/cities/[id]`
- Remove from local state

#### 5.3 Edit/Delete Activity
- Add edit/delete buttons to activity cards
- Same pattern as cities

---

### Priority 6: Form Validation

Add validation to all forms using a library or custom logic:

**Suggested approach using Zod:**
```bash
npm install zod
```

```typescript
// src/lib/validations/city.ts
import { z } from 'zod';

export const citySchema = z.object({
  name: z.string().min(1, 'City name is required'),
  country: z.string().min(1, 'Country is required'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
```

---

### Priority 7: Testing

#### 7.1 Unit Tests
Install testing framework:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**Files to create:**
- `src/components/__tests__/header.test.tsx`
- `src/components/__tests__/cityList.test.tsx`
- `src/components/__tests__/activityCard.test.tsx`

#### 7.2 API Tests
- `src/app/api/__tests__/cities.test.ts`
- `src/app/api/__tests__/activities.test.ts`

---

## File Structure After Implementation

```
src/
├── app/
│   ├── api/
│   │   ├── cities/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── activities/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   └── trips/
│   │       ├── route.ts
│   │       └── [id]/route.ts
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── city/
│   │   ├── cityList.tsx
│   │   ├── tripView.tsx
│   │   └── addCityModal.tsx          ← NEW
│   ├── activity/
│   │   ├── activityListView.tsx      ← NEW
│   │   └── addActivityModal.tsx      ← NEW
│   ├── layout/
│   │   └── header.tsx
│   ├── map/
│   │   └── cityViewMap.tsx
│   └── ui/
│       ├── activityCard.tsx
│       ├── modal.tsx                  ← NEW (reusable)
│       └── confirmDialog.tsx          ← NEW
├── lib/
│   ├── db/
│   │   └── index.ts                   ← NEW
│   ├── hooks/
│   │   └── googleMapsHook.ts
│   └── validations/                   ← NEW
│       ├── city.ts
│       └── activity.ts
└── types/
    └── index.ts
```

---

## Environment Variables Needed

```env
# .env.local
DATABASE_URL=postgresql://user:password@host/database
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

---

## Quick Start Checklist

- [ ] Set up Neon database and get connection string
- [ ] Create `.env.local` with `DATABASE_URL`
- [ ] Run database migrations (create tables)
- [ ] Create `src/lib/db/index.ts` for database connection
- [ ] Create API routes for cities
- [ ] Create API routes for activities
- [ ] Create API routes for trips
- [ ] Create AddCityModal component
- [ ] Wire up city modal to "+" button
- [ ] Create AddActivityModal component
- [ ] Wire up activity modal to "+" button
- [ ] Implement `onUpdateTrip` handler
- [ ] Add data fetching on page mount
- [ ] Complete transportation form inputs
- [ ] Complete accommodation form inputs
- [ ] Implement view switching (list vs map)
- [ ] Add edit/delete functionality
- [ ] Add form validation
- [ ] Write tests

---

## Notes

- The `@neondatabase/serverless` package is already installed
- TypeScript types in `src/types/index.ts` need updates for userId
- Current data is hardcoded in `page.tsx` - needs refactoring to trip-centric model
- The TODO comment in `cityList.tsx:3` about icons can be addressed later

---

## Summary: Trip-Centric Architecture Benefits

### Before (City-Centric):
```typescript
// Separate records by city ID
const [activities, setActivities] = useState<Record<string, Activity[]>>({});
const [trips, setTrips] = useState<Record<string, Trip>>({});
const [notes, setNotes] = useState<Record<string, Note[]>>({});
const [cities, setCities] = useState<City[]>([]);
```

**Problems:**
- Data scattered across multiple state objects
- No user association
- Doesn't match real-world trip planning (trips span multiple cities)
- Transportation between cities hard to represent
- Trip dates not unified

### After (Trip-Centric):
```typescript
// Single source of truth
const [trips, setTrips] = useState<Trip[]>([]);
const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
```

**Benefits:**
- All trip data in one object (cities, activities, notes, accommodations, transportation)
- User differentiation via `userId` on each trip
- Matches real-world model: a trip contains multiple cities
- Transportation connects cities within a trip
- Trip-level dates (arrival/departure)
- Easier to add features like:
  - Multiple trips per user
  - Sharing trips with other users
  - Trip templates
  - Trip statistics (total cost, duration, etc.)

### Type Updates Required:
```typescript
// src/types/index.ts
export interface Trip {
  id: string;
  userId: string;        // NEW
  name?: string;         // NEW (optional trip name)
  cities: City[];
  dates: {
    arrival: string;
    departure: string;
  };
  accommodation: Accommodation[];
  activities: Activity[];
  transportation: {
    flights?: Flight[];
    trainRides?: Train[];
  };
  notes: Note[];
}
```

### Component Updates Required:
1. **CityList → TripList**: Show trip selector at top, then cities for selected trip
2. **TripView**: Receives full `trip` object instead of separate arrays
3. **page.tsx**: Simplified state management (trips array only)

This architecture sets you up for future features like authentication, trip sharing, and analytics!
