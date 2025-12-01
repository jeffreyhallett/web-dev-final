'use client';

import { useState, useEffect, useCallback } from 'react';
import { UserStats } from '@/types';
import {
	createDefaultStats,
	calculateLevel,
	checkAchievements,
	XP_REWARDS,
} from '@/lib/utils/gamification';

export function useGameStats() {
	const [stats, setStats] = useState<UserStats>(() => {
		// Load from localStorage if available
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem('gameStats');
			if (saved) {
				return JSON.parse(saved);
			}
		}
		return createDefaultStats();
	});

	// Save to localStorage whenever stats change
	useEffect(() => {
		if (typeof window !== 'undefined') {
			localStorage.setItem('gameStats', JSON.stringify(stats));
		}
	}, [stats]);

	const addXP = useCallback(
		(amount: number, reason?: string) => {
			setStats((prev) => {
				const newXP = prev.xp + amount;
				const newLevel = calculateLevel(newXP);
				const leveledUp = newLevel > prev.level;

				const newStats = {
					...prev,
					xp: newXP,
					level: newLevel,
				};

				// Check for new achievements
				const newAchievements = checkAchievements(newStats);
				if (newAchievements.length > 0) {
					newStats.achievements = [...prev.achievements, ...newAchievements];
				}

				return newStats;
			});

			return {
				amount,
				reason,
			};
		},
		[]
	);

	const addCity = useCallback(() => {
		setStats((prev) => ({
			...prev,
			citiesVisited: prev.citiesVisited + 1,
		}));
		return addXP(XP_REWARDS.ADD_CITY, 'Added a new city!');
	}, [addXP]);

	const addActivity = useCallback(() => {
		setStats((prev) => ({
			...prev,
			activitiesPlanned: prev.activitiesPlanned + 1,
		}));
		return addXP(XP_REWARDS.ADD_ACTIVITY, 'Planned an activity!');
	}, [addXP]);

	const completeActivity = useCallback(() => {
		return addXP(XP_REWARDS.COMPLETE_ACTIVITY, 'Completed an activity!');
	}, [addXP]);

	const addAccommodation = useCallback(() => {
		return addXP(XP_REWARDS.FILL_ACCOMMODATION, 'Added accommodation!');
	}, [addXP]);

	const addNote = useCallback(() => {
		return addXP(XP_REWARDS.ADD_NOTE, 'Added a note!');
	}, [addXP]);

	const resetStats = useCallback(() => {
		const defaultStats = createDefaultStats();
		setStats(defaultStats);
		if (typeof window !== 'undefined') {
			localStorage.setItem('gameStats', JSON.stringify(defaultStats));
		}
	}, []);

	return {
		stats,
		addXP,
		addCity,
		addActivity,
		completeActivity,
		addAccommodation,
		addNote,
		resetStats,
	};
}
