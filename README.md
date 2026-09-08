# AI Trip Planner

A full-stack trip planning app built with Next.js. Plan multi-city trips, keep track of
accommodations, activities, flights, trains, and notes, and get AI-generated activity
recommendations for each city on your itinerary.

Built as a final project for CSE 2004 (Web Development).

## Features

- **Trips & cities** — create trips with multiple destinations, each with its own map view
- **Itinerary planning** — add and edit activities per city, mark them as part of your travel plan
- **Accommodations & notes** — track where you're staying and jot down notes per trip
- **Transportation** — record flights and trains with confirmation numbers and booking links
- **AI recommendations** — get suggested activities for a city powered by the OpenAI API
- **Interactive maps** — view cities and activity locations with the Google Maps JavaScript API

## Tech stack

- [Next.js](https://nextjs.org) (App Router) + [React](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Neon](https://neon.tech) (serverless Postgres)
- [OpenAI API](https://platform.openai.com/docs) for activity recommendations
- [Google Maps JavaScript API](https://developers.google.com/maps) for map views
- [Vitest](https://vitest.dev) for API route tests

## Getting started

### Prerequisites

- Node.js 20+
- A [Neon](https://neon.tech) Postgres database (or any Postgres connection string)
- An [OpenAI API key](https://platform.openai.com/api-keys)
- A [Google Maps API key](https://developers.google.com/maps/documentation/javascript/get-api-key) with the Maps JavaScript API enabled

### Setup

1. Clone the repo and install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env.local` file in the project root with the following variables:

   ```bash
   DATABASE_URL=postgres://user:password@host/dbname
   OPENAI_API_KEY=sk-...
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
   ```

   `DATABASE_URL` should point at a Postgres database containing the tables this app
   expects (trips, cities, activities, accommodations, flights, trains, notes). If you're
   using Neon, the connection string is available from your project dashboard.

3. Run the development server:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to see the app.

### Other scripts

```bash
npm run build          # production build
npm run start           # run a production build
npm run lint             # lint with ESLint
npm run lint:fix       # lint and auto-fix
npm run format          # format with Prettier
npm run format:check   # check formatting without writing
npm test                 # run the test suite once
npm run test:watch     # run tests in watch mode
npm run test:coverage  # run tests with coverage
```

## Project structure

```
src/
  app/
    api/               # Next.js route handlers (trips, cities, activities, etc.)
    page.tsx           # main app page
  components/          # React components, grouped by feature
  lib/
    api/               # client-side API helpers and React hooks
    context/           # React context providers
    db/                # database client and types
    hooks/             # misc React hooks (Google Maps loader, etc.)
  types/               # shared TypeScript types
```

## CI

Pushes and pull requests to `main` run linting, tests, and a production build via
GitHub Actions (see [`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

## License

This project is licensed under the [MIT License](LICENSE).
