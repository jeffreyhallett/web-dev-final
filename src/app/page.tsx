'use client';

import CityList from '@/components/city/cityList';
import { City, Activity, Note, Trip, Accommodation } from '@/types';
import { useState, useEffect } from 'react';
import CityView from '@/components/city/tripView';
import Header from '@/components/layout/header';
import { useGameStats } from '@/hooks/useGameStats';
import { useToast } from '@/hooks/useToast';
import { useConfetti } from '@/hooks/useConfetti';
import { ToastContainer } from '@/components/ui/Toast';

export default function HomePage() {
	const [view, setView] = useState<'list' | 'map'>('list');
	const [selectedCity, setSelectedCity] = useState<City>({
		id: '1',
		name: 'Vienna',
		country: 'Austria',
		latitude: 48.2082,
		longitude: 16.3738,
	});

	// Gamification hooks
	const { stats, addCity, addActivity } = useGameStats();
	const { toasts, removeToast, success, xp } = useToast();
	const { celebrate, celebrateBig } = useConfetti();

	// Track previous level to detect level-ups
	const [prevLevel, setPrevLevel] = useState(stats.level);

	// Detect level-ups and celebrate
	useEffect(() => {
		if (stats.level > prevLevel) {
			celebrateBig();
			success(`🎉 Level Up! You're now level ${stats.level}!`);
			setPrevLevel(stats.level);
		}
	}, [stats.level, prevLevel, celebrateBig, success]);

	// Initialize state with localStorage
	const [activities, setActivities] = useState<Record<string, Activity[]>>(() => {
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem('activities');
			if (saved) return JSON.parse(saved);
		}
		// Default sample activities
		return {
			'1': [
				{
					id: 'a1',
					name: 'Visit Schönbrunn Palace',
					description: 'Explore the magnificent baroque palace and gardens',
					location: 'Schönbrunner Schloßstraße 47',
					time: '10:00 AM',
					city: {
						id: '1',
						name: 'Vienna',
						country: 'Austria',
						latitude: 48.2082,
						longitude: 16.3738,
					},
					inTravelPlan: true,
				},
				{
					id: 'a2',
					name: "St. Stephen's Cathedral",
					description: 'Gothic architecture masterpiece in the city center',
					location: 'Stephansplatz 3',
					time: '2:00 PM',
					city: {
						id: '1',
						name: 'Vienna',
						country: 'Austria',
						latitude: 48.2082,
						longitude: 16.3738,
					},
					inTravelPlan: true,
				},
				{
					id: 'a3',
					name: 'Belvedere Palace',
					description: 'Art museum with stunning gardens',
					location: 'Prinz Eugen-Straße 27',
					time: '4:00 PM',
					city: {
						id: '1',
						name: 'Vienna',
						country: 'Austria',
						latitude: 48.2082,
						longitude: 16.3738,
					},
					inTravelPlan: false,
				},
			],
		};
	});

	const [trips, setTrips] = useState<Record<string, Trip>>(() => {
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem('trips');
			if (saved) return JSON.parse(saved);
		}
		return {};
	});

	const [notes, setNotes] = useState<Record<string, Note[]>>(() => {
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem('notes');
			if (saved) return JSON.parse(saved);
		}
		return {};
	});

	const [accommodations, setAccommodations] = useState<
		Record<string, Accommodation[]>
	>(() => {
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem('accommodations');
			if (saved) return JSON.parse(saved);
		}
		return {};
	});

	const [cities, setCities] = useState<City[]>(() => {
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem('cities');
			if (saved) return JSON.parse(saved);
		}
		// Default cities
		return [
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
		];
	});

	// Save to localStorage whenever state changes
	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('activities', JSON.stringify(activities));
		}
	}, [activities]);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('trips', JSON.stringify(trips));
		}
	}, [trips]);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('notes', JSON.stringify(notes));
		}
	}, [notes]);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('accommodations', JSON.stringify(accommodations));
		}
	}, [accommodations]);

	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('cities', JSON.stringify(cities));
		}
	}, [cities]);

	// Handle adding a new city with gamification
	const handleAddCity = (city: City) => {
		setCities([...cities, city]);
		const reward = addCity();
		celebrate();
		xp(`+${reward.amount} XP`);
		success(reward.reason || 'City added!');
	};

	// Handle adding a new activity with gamification
	const handleAddActivity = (activity: Activity) => {
		if (selectedCity) {
			const currentActivities = activities[selectedCity.id] || [];
			setActivities({
				...activities,
				[selectedCity.id]: [...currentActivities, activity],
			});
			const reward = addActivity();
			celebrate();
			xp(`+${reward.amount} XP`);
			success(reward.reason || 'Activity added!');
		}
	};

	return (
		<div
			className="flex flex-col h-screen relative overflow-hidden"
			style={{
				background:
					'linear-gradient(135deg, var(--pastel-blue) 0%, var(--pastel-purple) 50%, var(--pastel-pink) 100%)',
			}}
		>
			{/* Floating decoration circles */}
			<div
				className="absolute top-20 left-10 w-32 h-32 rounded-full opacity-30 blur-3xl animate-float"
				style={{ background: 'var(--accent-cyan)' }}
			/>
			<div
				className="absolute bottom-20 right-20 w-40 h-40 rounded-full opacity-30 blur-3xl"
				style={{
					background: 'var(--accent-violet)',
					animation: 'float 4s ease-in-out infinite',
					animationDelay: '1s',
				}}
			/>
			<div
				className="absolute top-1/2 right-1/4 w-24 h-24 rounded-full opacity-20 blur-2xl"
				style={{
					background: 'var(--accent-emerald)',
					animation: 'float 5s ease-in-out infinite',
					animationDelay: '2s',
				}}
			/>

			<Header view={view} onViewChange={setView} stats={stats} />
			<div className="flex flex-1 overflow-hidden">
				<aside className="w-64 flex flex-col">
					<div className="px-4 py-8 flex-1">
						<CityList
							cities={cities}
							currentCity={selectedCity}
							onCitySelect={setSelectedCity}
							onAddCity={handleAddCity}
						/>
					</div>
				</aside>
				<main className="flex-1 flex flex-col">
					<div className="px-4 py-8 flex-1 w-full">
						<CityView
							city={selectedCity}
							trip={selectedCity ? trips[selectedCity.id] : undefined}
							activities={
								selectedCity ? activities[selectedCity.id] || [] : []
							}
							onUpdateActivities={(newActivities) => {
								if (selectedCity) {
									setActivities({
										...activities,
										[selectedCity.id]: newActivities,
									});
								}
							}}
							onUpdateTrip={() => {}}
							onAddActivity={handleAddActivity}
						/>
					</div>
				</main>
			</div>

			{/* Toast notifications */}
			<ToastContainer toasts={toasts} onRemove={removeToast} />
		</div>
	);
}
