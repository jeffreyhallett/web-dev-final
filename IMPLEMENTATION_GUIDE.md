# Travel Planner - Implementation Guide

This guide outlines what has been implemented and what still needs to be built in the Travel Planner application.

---

## Current Status Overview

| Category | Status |
|----------|--------|
| UI Components | ~70% Complete |
| Type Definitions | Complete |
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
All TypeScript interfaces are fully defined:
- `Trip`, `City`, `Activity`, `Accommodation`, `Flight`, `Train`, `Note`

### Infrastructure
- TailwindCSS v4 styling
- ESLint + Prettier configuration
- Google Maps hook (`src/lib/hooks/googleMapsHook.ts`)
- Neon Database dependency installed (not used yet)

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
-- Cities table
CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(255) NOT NULL,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Trips table
CREATE TABLE trips (
  id SERIAL PRIMARY KEY,
  city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activities table
CREATE TABLE activities (
  id SERIAL PRIMARY KEY,
  city_id INTEGER REFERENCES cities(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  activity_url TEXT,
  in_travel_plan BOOLEAN DEFAULT FALSE,
  duration_minutes INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Accommodations table
CREATE TABLE accommodations (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT,
  check_in DATE,
  check_out DATE
);

-- Flights table
CREATE TABLE flights (
  id SERIAL PRIMARY KEY,
  trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
  airline VARCHAR(255),
  departure_airport VARCHAR(10),
  arrival_airport VARCHAR(10),
  departure_time TIMESTAMP,
  arrival_time TIMESTAMP
);
```

3. Add `DATABASE_URL` to `.env.local`:
```
DATABASE_URL=your_neon_connection_string
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_existing_key
```

#### 1.2 API Routes
**Location:** Create `src/app/api/` directory

**Files to create:**

| File | Purpose |
|------|---------|
| `src/app/api/cities/route.ts` | GET all cities, POST new city |
| `src/app/api/cities/[id]/route.ts` | GET, PUT, DELETE single city |
| `src/app/api/activities/route.ts` | GET all activities, POST new activity |
| `src/app/api/activities/[id]/route.ts` | GET, PUT, DELETE single activity |
| `src/app/api/trips/route.ts` | GET all trips, POST new trip |
| `src/app/api/trips/[id]/route.ts` | GET, PUT, DELETE single trip |

**Example API route (`src/app/api/cities/route.ts`):**
```typescript
import { NextResponse } from 'next/server';
import sql from '@/lib/db';

export async function GET() {
  try {
    const cities = await sql`SELECT * FROM cities ORDER BY name`;
    return NextResponse.json(cities);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, country, latitude, longitude } = body;

    const result = await sql`
      INSERT INTO cities (name, country, latitude, longitude)
      VALUES (${name}, ${country}, ${latitude}, ${longitude})
      RETURNING *
    `;

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create city' }, { status: 500 });
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

#### 3.1 Implement `onUpdateTrip` Handler
**Location:** `src/app/page.tsx:68`

**Current state:** Empty function `onUpdateTrip={() => {}}`

**Implementation:**
```typescript
const handleUpdateTrip = async (tripId: number, updates: Partial<Trip>) => {
  try {
    const response = await fetch(`/api/trips/${tripId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (response.ok) {
      const updatedTrip = await response.json();
      setTrips(prev => prev.map(t =>
        t.id === tripId ? updatedTrip : t
      ));
    }
  } catch (error) {
    console.error('Failed to update trip:', error);
  }
};
```

#### 3.2 Load Data on Mount
**Location:** `src/app/page.tsx`

**Add useEffect to fetch data:**
```typescript
useEffect(() => {
  const fetchData = async () => {
    const [citiesRes, activitiesRes, tripsRes] = await Promise.all([
      fetch('/api/cities'),
      fetch('/api/activities'),
      fetch('/api/trips'),
    ]);

    setCities(await citiesRes.json());
    setActivities(await activitiesRes.json());
    setTrips(await tripsRes.json());
  };

  fetchData();
}, []);
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
- All TypeScript types are already defined in `src/types/index.ts`
- Current data is hardcoded in `page.tsx` - replace with API calls
- The TODO comment in `cityList.tsx:3` about icons can be addressed later
