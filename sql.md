# Travel Planner Database Schema

This file contains all SQL commands needed to set up the Travel Planner database using PostgreSQL (Neon).

## Overview

The database uses a **trip-centric** model where:
- **Users** can have multiple **Trips**
- **Trips** contain **Cities**, **Activities**, **Accommodations**, **Flights**, **Trains**, and **Notes**
- **Activities** and **Accommodations** are associated with specific **Cities** within a trip

## Design Decisions

1. **UUIDs for Primary Keys**: Using `gen_random_uuid()` for IDs to match frontend string IDs and enable client-side ID generation
2. **Cascading Deletes**: When a trip is deleted, all related data is automatically removed
3. **Soft References**: Activities and accommodations reference cities, but can exist without a city assignment
4. **Ordering Support**: Cities have `order_index` for maintaining display order
5. **Timestamps**: All tables have `created_at` and `updated_at` for auditing

---

## 1. Enable UUID Extension

```sql
-- Enable UUID generation (required for gen_random_uuid())
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

---

## 2. Create Tables

### 2.1 Users Table

```sql
-- Users table for authentication (future feature)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for email lookups (login)
CREATE INDEX idx_users_email ON users(email);
```

### 2.2 Trips Table

```sql
-- Trips table (PRIMARY entity)
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255),
    arrival_date DATE,
    departure_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Ensure departure is after or equal to arrival
    CONSTRAINT valid_trip_dates CHECK (
        departure_date IS NULL OR
        arrival_date IS NULL OR
        departure_date >= arrival_date
    )
);

-- Index for fetching user's trips
CREATE INDEX idx_trips_user_id ON trips(user_id);

-- Index for sorting by date
CREATE INDEX idx_trips_arrival_date ON trips(arrival_date);
```

### 2.3 Trip Cities Table

```sql
-- Cities within a trip
CREATE TABLE trip_cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Ensure valid coordinates
    CONSTRAINT valid_latitude CHECK (latitude >= -90 AND latitude <= 90),
    CONSTRAINT valid_longitude CHECK (longitude >= -180 AND longitude <= 180)
);

-- Index for fetching cities by trip
CREATE INDEX idx_trip_cities_trip_id ON trip_cities(trip_id);

-- Index for ordering cities
CREATE INDEX idx_trip_cities_order ON trip_cities(trip_id, order_index);
```

### 2.4 Activities Table

```sql
-- Activities within a trip (associated with a city)
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    city_id UUID REFERENCES trip_cities(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    scheduled_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    image_url TEXT,
    activity_url TEXT,
    in_travel_plan BOOLEAN DEFAULT false,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fetching activities by trip
CREATE INDEX idx_activities_trip_id ON activities(trip_id);

-- Index for fetching activities by city
CREATE INDEX idx_activities_city_id ON activities(city_id);

-- Index for planned activities
CREATE INDEX idx_activities_in_plan ON activities(trip_id, in_travel_plan) WHERE in_travel_plan = true;

-- Index for ordering
CREATE INDEX idx_activities_order ON activities(trip_id, city_id, order_index);
```

### 2.5 Accommodations Table

```sql
-- Accommodations within a trip (associated with a city)
CREATE TABLE accommodations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    city_id UUID REFERENCES trip_cities(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    check_in DATE,
    check_out DATE,
    confirmation_number VARCHAR(100),
    booking_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Ensure check_out is after or equal to check_in
    CONSTRAINT valid_accommodation_dates CHECK (
        check_out IS NULL OR
        check_in IS NULL OR
        check_out >= check_in
    )
);

-- Index for fetching accommodations by trip
CREATE INDEX idx_accommodations_trip_id ON accommodations(trip_id);

-- Index for fetching accommodations by city
CREATE INDEX idx_accommodations_city_id ON accommodations(city_id);

-- Index for date-based queries
CREATE INDEX idx_accommodations_dates ON accommodations(trip_id, check_in, check_out);
```

### 2.6 Flights Table

```sql
-- Flight transportation within a trip
CREATE TABLE flights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    flight_number VARCHAR(20),
    airline VARCHAR(255),
    departure_airport VARCHAR(10) NOT NULL,
    arrival_airport VARCHAR(10) NOT NULL,
    departure_time TIMESTAMP WITH TIME ZONE,
    arrival_time TIMESTAMP WITH TIME ZONE,
    confirmation_number VARCHAR(100),
    booking_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Ensure arrival is after departure
    CONSTRAINT valid_flight_times CHECK (
        arrival_time IS NULL OR
        departure_time IS NULL OR
        arrival_time >= departure_time
    )
);

-- Index for fetching flights by trip
CREATE INDEX idx_flights_trip_id ON flights(trip_id);

-- Index for chronological ordering
CREATE INDEX idx_flights_departure ON flights(trip_id, departure_time);
```

### 2.7 Trains Table

```sql
-- Train transportation within a trip
CREATE TABLE trains (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    train_number VARCHAR(50),
    operator VARCHAR(255),
    departure_station VARCHAR(255) NOT NULL,
    arrival_station VARCHAR(255) NOT NULL,
    departure_time TIMESTAMP WITH TIME ZONE,
    arrival_time TIMESTAMP WITH TIME ZONE,
    confirmation_number VARCHAR(100),
    booking_url TEXT,
    seat_info VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Ensure arrival is after departure
    CONSTRAINT valid_train_times CHECK (
        arrival_time IS NULL OR
        departure_time IS NULL OR
        arrival_time >= departure_time
    )
);

-- Index for fetching trains by trip
CREATE INDEX idx_trains_trip_id ON trains(trip_id);

-- Index for chronological ordering
CREATE INDEX idx_trains_departure ON trains(trip_id, departure_time);
```

### 2.8 Notes Table

```sql
-- Notes within a trip
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    note_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fetching notes by trip
CREATE INDEX idx_notes_trip_id ON notes(trip_id);

-- Index for date-based ordering
CREATE INDEX idx_notes_date ON notes(trip_id, note_date);
```

---

## 3. Create Updated_at Trigger Function

This function automatically updates the `updated_at` column when a row is modified.

```sql
-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';
```

---

## 4. Apply Updated_at Triggers to All Tables

```sql
-- Users
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trips
CREATE TRIGGER update_trips_updated_at
    BEFORE UPDATE ON trips
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trip Cities
CREATE TRIGGER update_trip_cities_updated_at
    BEFORE UPDATE ON trip_cities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Activities
CREATE TRIGGER update_activities_updated_at
    BEFORE UPDATE ON activities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Accommodations
CREATE TRIGGER update_accommodations_updated_at
    BEFORE UPDATE ON accommodations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Flights
CREATE TRIGGER update_flights_updated_at
    BEFORE UPDATE ON flights
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trains
CREATE TRIGGER update_trains_updated_at
    BEFORE UPDATE ON trains
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Notes
CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

## 5. Seed Data (Optional - For Development)

```sql
-- Create a test user
INSERT INTO users (id, email, name) VALUES
    ('00000000-0000-0000-0000-000000000001', 'test@example.com', 'Test User');

-- Create a sample trip
INSERT INTO trips (id, user_id, name, arrival_date, departure_date) VALUES
    ('00000000-0000-0000-0000-000000000001',
     '00000000-0000-0000-0000-000000000001',
     'Europe Summer 2025',
     '2025-06-15',
     '2025-07-01');

-- Add cities to the trip
INSERT INTO trip_cities (id, trip_id, name, country, latitude, longitude, order_index) VALUES
    ('00000000-0000-0000-0000-000000000001',
     '00000000-0000-0000-0000-000000000001',
     'Vienna', 'Austria', 48.2082, 16.3738, 0),
    ('00000000-0000-0000-0000-000000000002',
     '00000000-0000-0000-0000-000000000001',
     'Prague', 'Czech Republic', 50.0755, 14.4378, 1);

-- Add a sample activity
INSERT INTO activities (trip_id, city_id, name, description, location, in_travel_plan) VALUES
    ('00000000-0000-0000-0000-000000000001',
     '00000000-0000-0000-0000-000000000001',
     'Visit Schonbrunn Palace',
     'Explore the beautiful imperial summer residence',
     'Schonbrunner Schlossstrasse 47, 1130 Wien',
     true);

-- Add a sample accommodation
INSERT INTO accommodations (trip_id, city_id, name, address, check_in, check_out) VALUES
    ('00000000-0000-0000-0000-000000000001',
     '00000000-0000-0000-0000-000000000001',
     'Hotel Sacher Wien',
     'Philharmonikerstrasse 4, 1010 Wien',
     '2025-06-15',
     '2025-06-20');

-- Add a sample flight
INSERT INTO flights (trip_id, flight_number, airline, departure_airport, arrival_airport, departure_time, arrival_time) VALUES
    ('00000000-0000-0000-0000-000000000001',
     'OS87',
     'Austrian Airlines',
     'JFK',
     'VIE',
     '2025-06-14 22:00:00+00',
     '2025-06-15 12:00:00+00');

-- Add a sample train
INSERT INTO trains (trip_id, train_number, operator, departure_station, arrival_station, departure_time, arrival_time) VALUES
    ('00000000-0000-0000-0000-000000000001',
     'RJ 73',
     'OBB',
     'Wien Hauptbahnhof',
     'Praha hlavni nadrazi',
     '2025-06-20 08:00:00+00',
     '2025-06-20 12:00:00+00');

-- Add a sample note
INSERT INTO notes (trip_id, content, note_date) VALUES
    ('00000000-0000-0000-0000-000000000001',
     'Remember to bring adapter for European outlets!',
     '2025-06-15');
```

---

## 6. Useful Queries

### Get all trips for a user with city count

```sql
SELECT
    t.*,
    COUNT(tc.id) as city_count
FROM trips t
LEFT JOIN trip_cities tc ON t.id = tc.trip_id
WHERE t.user_id = $1
GROUP BY t.id
ORDER BY t.arrival_date DESC NULLS LAST;
```

### Get a complete trip with all related data

```sql
-- Get trip with cities
SELECT
    t.*,
    json_agg(
        json_build_object(
            'id', tc.id,
            'name', tc.name,
            'country', tc.country,
            'latitude', tc.latitude,
            'longitude', tc.longitude
        ) ORDER BY tc.order_index
    ) FILTER (WHERE tc.id IS NOT NULL) as cities
FROM trips t
LEFT JOIN trip_cities tc ON t.id = tc.trip_id
WHERE t.id = $1
GROUP BY t.id;
```

### Get activities for a specific city in a trip

```sql
SELECT * FROM activities
WHERE trip_id = $1 AND city_id = $2
ORDER BY order_index, scheduled_time;
```

### Get all transportation for a trip (chronologically)

```sql
SELECT
    'flight' as type,
    id,
    flight_number as number,
    airline as operator,
    departure_airport as departure_location,
    arrival_airport as arrival_location,
    departure_time,
    arrival_time
FROM flights
WHERE trip_id = $1

UNION ALL

SELECT
    'train' as type,
    id,
    train_number as number,
    operator,
    departure_station as departure_location,
    arrival_station as arrival_location,
    departure_time,
    arrival_time
FROM trains
WHERE trip_id = $1

ORDER BY departure_time;
```

---

## 7. Drop Tables (For Reset)

**WARNING: This will delete all data!**

```sql
-- Drop all tables in reverse order of dependencies
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS trains CASCADE;
DROP TABLE IF EXISTS flights CASCADE;
DROP TABLE IF EXISTS accommodations CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS trip_cities CASCADE;
DROP TABLE IF EXISTS trips CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop the trigger function
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
```

---

## 8. Complete Setup Script

Run all commands in order:

```sql
-- 1. Enable extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Create trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 3. Create tables
-- (Copy all CREATE TABLE statements from sections 2.1-2.8 above)

-- 4. Create triggers
-- (Copy all CREATE TRIGGER statements from section 4 above)

-- 5. (Optional) Insert seed data
-- (Copy INSERT statements from section 5 above)
```

---

## Entity Relationship Diagram (Text)

```
users
  |
  | 1:N
  v
trips
  |
  +-- 1:N --> trip_cities
  |             |
  |             | N:1 (optional)
  |             v
  +-- 1:N --> activities
  |             ^
  |             | N:1 (optional)
  +-- 1:N --> accommodations
  |
  +-- 1:N --> flights
  |
  +-- 1:N --> trains
  |
  +-- 1:N --> notes
```

---

## Notes

1. **UUID Generation**: Neon PostgreSQL supports `gen_random_uuid()` via the pgcrypto extension
2. **Timezone**: All timestamps use `WITH TIME ZONE` for proper timezone handling
3. **Soft Deletes**: Currently using hard deletes with CASCADE. Add `deleted_at` column if soft deletes are needed
4. **Performance**: Indexes are created for all foreign keys and common query patterns
5. **Constraints**: Date validation ensures logical consistency (e.g., check-out after check-in)
