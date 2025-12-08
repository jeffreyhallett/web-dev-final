# Travel Planner - Implementation Guide

This guide outlines what has been implemented and what still needs to be built in the Travel Planner application.

## ✅ ARCHITECTURAL CHANGE: Trip-Centric Model (COMPLETED)

**The application now uses a trip-centric data model instead of city-centric:**
- **Primary data structure:** Trips (not cities)
- **User differentiation:** All trips are associated with a userId
- **Data organization:** Each trip contains cities, activities, accommodations, transportation, and notes
- **State management:** App manages trips array, not separate city/activity records

---

## Current Status Overview

| Category | Status |
|----------|--------|
| UI Components | ~80% Complete |
| Type Definitions | ✅ Complete |
| Trip-Centric Architecture | ✅ Complete |
| Google Maps Integration | ✅ Complete |
| Database Layer | Not Started |
| API Routes | Not Started |
| Data Persistence | Not Started |
| Forms & Validation | Partial |
| Testing | Not Started |

---

## What's Already Implemented

### Core Components
- **Header** (`src/components/layout/header.tsx`) - View toggle buttons (List/Map)
- **TripList** (`src/components/trip/tripList.tsx`) - Trip selector dropdown + city list for selected trip
- **Trip View** (`src/components/city/tripView.tsx`) - 3-column layout with activities, map, and trip form
- **Activity Card** (`src/components/ui/activityCard.tsx`) - Basic activity display
- **City View Map** (`src/components/map/cityViewMap.tsx`) - Google Maps with markers

### Data Types (`src/types/index.ts`)
All TypeScript interfaces are complete:
- `Trip` - includes `userId` and optional `name` field
- `City`, `Activity`, `Accommodation`, `Flight`, `Train`, `Note` - Complete

### State Management (`src/app/page.tsx`)
Trip-centric state management is implemented:
- `trips: Trip[]` - array of all trips
- `selectedTripId` / `selectedCityId` - selection state
- Derived values: `selectedTrip` and `selectedCity`
- Handlers: `handleAddCity`, `handleUpdateActivities`, `handleUpdateTrip`

### Infrastructure
- TailwindCSS v4 styling
- ESLint + Prettier configuration
- Google Maps hook (`src/lib/hooks/googleMapsHook.ts`)
- Neon Database dependency installed (not used yet)

### Deprecated (can be removed)
- `src/components/city/cityList.tsx` - replaced by `src/components/trip/tripList.tsx`

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
  name VARCHAR(255),
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
  order_index INTEGER NOT NULL,
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

---

### Priority 2: Forms & Modals

#### 2.1 Add Trip Modal
**Location:** Create `src/components/trip/addTripModal.tsx`

Create a modal to add new trips with:
- Trip name
- Arrival date
- Departure date

#### 2.2 Add City Modal
**Location:** Create `src/components/city/addCityModal.tsx`

**Current state:** Button exists in `tripList.tsx` but opens no modal

**Implementation steps:**
1. Create modal component with form fields:
   - City name (required)
   - Country (required)
   - Latitude (required, number)
   - Longitude (required, number)
2. Add state in `page.tsx` to control modal visibility
3. Wire up the "Add City" button in `tripList.tsx` to open modal

#### 2.3 Add Activity Modal
**Location:** Create `src/components/activity/addActivityModal.tsx`

**Current state:** Button exists in `tripView.tsx` with empty function

**Implementation steps:**
1. Create modal with fields:
   - Activity name (required)
   - Description (optional)
   - Image URL (optional)
   - Activity URL (optional)
   - Add to travel plan (checkbox)
2. Wire up the "+" button in tripView to open modal

#### 2.4 Complete Transportation Form
**Location:** `src/components/city/tripView.tsx`

**Current state:** Only has a "Transportation" label, no inputs

**Implementation steps:**
1. Add tabbed interface for Flight vs Train
2. For Flight, add inputs: Airline, departure/arrival airports, times
3. For Train, add inputs: Operator, departure/arrival stations, times

#### 2.5 Complete Accommodation Form
**Location:** `src/components/city/tripView.tsx`

**Current state:** Only has name input

**Missing fields:**
- Address (text input)
- Check-in date (date picker)
- Check-out date (date picker)

---

### Priority 3: View Switching

#### 3.1 Implement List vs Map View Toggle
**Location:** `src/app/page.tsx`

**Current state:** `view` state exists, buttons toggle it, but view doesn't change

**Implementation:**
- Create `ActivityListView` component for list view
- Conditionally render based on `view` state

---

### Priority 4: Edit & Delete Features

#### 4.1 Edit/Delete City
- Add edit/delete buttons to each city in TripList
- Reuse AddCityModal with pre-filled values for editing

#### 4.2 Edit/Delete Activity
- Add edit/delete buttons to activity cards

#### 4.3 Edit/Delete Trip
- Add ability to edit trip name/dates
- Add ability to delete entire trip

---

### Priority 5: Form Validation

Add validation using Zod:
```bash
npm install zod
```

---

### Priority 6: Testing

Install testing framework:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

---

## File Structure After Implementation

```
src/
├── app/
│   ├── api/
│   │   └── trips/
│   │       ├── route.ts
│   │       └── [id]/
│   │           ├── route.ts
│   │           ├── cities/route.ts
│   │           ├── activities/route.ts
│   │           ├── accommodations/route.ts
│   │           ├── notes/route.ts
│   │           └── transportation/route.ts
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── city/
│   │   ├── tripView.tsx
│   │   └── addCityModal.tsx          ← NEW
│   ├── trip/
│   │   ├── tripList.tsx              ✅ DONE
│   │   └── addTripModal.tsx          ← NEW
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
    └── index.ts                       ✅ DONE
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

### Completed
- [x] Add `userId` and `name` to Trip interface in `src/types/index.ts`
- [x] Replace city-centric state with trip-centric state in `page.tsx`
- [x] Implement handleAddCity, handleUpdateActivities, handleUpdateTrip
- [x] Create `trip/tripList.tsx` component with trip selector
- [x] Update TripView to require `trip` prop and accept partial updates

### To Do
- [ ] Set up Neon database and get connection string
- [ ] Create `.env.local` with `DATABASE_URL`
- [ ] Run database migrations (create tables)
- [ ] Create `src/lib/db/index.ts` for database connection
- [ ] Create API routes for trips
- [ ] Create AddTripModal component
- [ ] Create AddCityModal component
- [ ] Wire up city modal to "Add City" button
- [ ] Create AddActivityModal component
- [ ] Wire up activity modal to "+" button
- [ ] Complete transportation form inputs
- [ ] Complete accommodation form inputs
- [ ] Implement view switching (list vs map)
- [ ] Add edit/delete functionality
- [ ] Add form validation
- [ ] Write tests
- [ ] Remove deprecated `cityList.tsx`

---

## Notes

- The `@neondatabase/serverless` package is already installed
- Current data is hardcoded in `page.tsx` - will be replaced with API calls
- The old `cityList.tsx` component can be removed (replaced by `tripList.tsx`)
