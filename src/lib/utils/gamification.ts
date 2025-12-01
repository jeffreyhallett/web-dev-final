/**
 * Gamification System
 * XP rewards, achievements, and stats tracking for fun user engagement
 */

import { UserStats, Achievement } from '@/types';

// XP Reward Values
export const XP_REWARDS = {
	ADD_CITY: 50,
	ADD_ACTIVITY: 20,
	COMPLETE_ACTIVITY: 30,
	FILL_ACCOMMODATION: 25,
	ADD_NOTE: 10,
	PLAN_FULL_DAY: 100,
	REMOVE_ACTIVITY: -5,
} as const;

// Achievement Definitions
export const ACHIEVEMENTS = [
	{
		id: 'explorer',
		name: 'Globe Trotter',
		description: 'Add 5 cities to your travel list',
		icon: '🌍',
		requirement: (stats: UserStats) => stats.citiesVisited >= 5,
	},
	{
		id: 'planner',
		name: 'Master Planner',
		description: 'Plan 20 activities',
		icon: '📋',
		requirement: (stats: UserStats) => stats.activitiesPlanned >= 20,
	},
	{
		id: 'adventurer',
		name: 'Adventure Seeker',
		description: 'Plan a trip longer than 7 days',
		icon: '⛰️',
		requirement: (stats: UserStats) => stats.totalDays >= 7,
	},
	{
		id: 'traveler',
		name: 'World Traveler',
		description: 'Visit 3 different countries',
		icon: '✈️',
		requirement: (stats: UserStats) => stats.citiesVisited >= 3,
	},
	{
		id: 'organizer',
		name: 'Super Organizer',
		description: 'Reach level 5',
		icon: '⭐',
		requirement: (stats: UserStats) => stats.level >= 5,
	},
	{
		id: 'enthusiast',
		name: 'Travel Enthusiast',
		description: 'Earn 1000 XP',
		icon: '🎯',
		requirement: (stats: UserStats) => stats.xp >= 1000,
	},
] as const;

/**
 * Calculate level based on XP
 * Every 500 XP = 1 level
 */
export function calculateLevel(xp: number): number {
	return Math.floor(xp / 500) + 1;
}

/**
 * Get XP required for next level
 */
export function getXPForNextLevel(level: number): number {
	return level * 500;
}

/**
 * Get current progress toward next level (0-1)
 */
export function getLevelProgress(xp: number): number {
	const currentLevel = calculateLevel(xp);
	const xpForCurrentLevel = (currentLevel - 1) * 500;
	const xpForNextLevel = currentLevel * 500;
	const xpInCurrentLevel = xp - xpForCurrentLevel;
	const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;

	return xpInCurrentLevel / xpNeededForLevel;
}

/**
 * Check for newly unlocked achievements
 * Returns array of newly unlocked achievements
 */
export function checkAchievements(stats: UserStats): Achievement[] {
	return ACHIEVEMENTS.filter((ach) => {
		// Skip if already unlocked
		const alreadyUnlocked = stats.achievements.find((a) => a.id === ach.id);
		if (alreadyUnlocked) return false;

		// Check if requirement is met
		return ach.requirement(stats);
	}).map((ach) => ({
		...ach,
		unlocked: true,
		unlockedDate: new Date().toISOString(),
	}));
}

/**
 * Calculate trip completion percentage
 */
export function calculateTripCompletion(trip: {
	cities: unknown[];
	activities: unknown[];
	accommodation: unknown[];
	notes: unknown[];
}): number {
	let completed = 0;
	let total = 4; // cities, activities, accommodation, notes

	if (trip.cities.length > 0) completed++;
	if (trip.activities.length > 0) completed++;
	if (trip.accommodation.length > 0) completed++;
	if (trip.notes.length > 0) completed++;

	return (completed / total) * 100;
}

/**
 * Get gradient color for level badge
 */
export function getLevelGradient(level: number): string {
	const gradients = [
		'var(--gradient-ocean)', // 1-2
		'var(--gradient-forest)', // 3-4
		'var(--gradient-sunset)', // 5-6
		'var(--gradient-aurora)', // 7-8
		'var(--gradient-cosmic)', // 9+
	];

	const index = Math.min(Math.floor((level - 1) / 2), gradients.length - 1);
	return gradients[index];
}

/**
 * Get random fun message for XP gain
 */
export function getXPGainMessage(xpAmount: number): string {
	const messages = [
		`+${xpAmount} XP! Nice work!`,
		`Awesome! +${xpAmount} XP earned!`,
		`Keep it up! +${xpAmount} XP`,
		`Great job! +${xpAmount} XP added!`,
		`You're on fire! +${xpAmount} XP`,
		`Excellent! +${xpAmount} XP gained!`,
	];

	return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get fun level up message
 */
export function getLevelUpMessage(newLevel: number): string {
	const messages = [
		`🎉 Level ${newLevel} Unlocked!`,
		`🚀 You've reached Level ${newLevel}!`,
		`⭐ Level ${newLevel} Achieved!`,
		`🎊 Congratulations! Level ${newLevel}!`,
		`✨ Welcome to Level ${newLevel}!`,
	];

	return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Initialize default stats for new user
 */
export function createDefaultStats(): UserStats {
	return {
		level: 1,
		xp: 0,
		citiesVisited: 0,
		activitiesPlanned: 0,
		totalDays: 0,
		achievements: [],
	};
}

/**
 * Update stats after adding a city
 */
export function updateStatsForCity(stats: UserStats): UserStats {
	const newXP = stats.xp + XP_REWARDS.ADD_CITY;
	return {
		...stats,
		xp: newXP,
		level: calculateLevel(newXP),
		citiesVisited: stats.citiesVisited + 1,
	};
}

/**
 * Update stats after adding an activity
 */
export function updateStatsForActivity(stats: UserStats): UserStats {
	const newXP = stats.xp + XP_REWARDS.ADD_ACTIVITY;
	return {
		...stats,
		xp: newXP,
		level: calculateLevel(newXP),
		activitiesPlanned: stats.activitiesPlanned + 1,
	};
}

/**
 * Get achievement completion percentage
 */
export function getAchievementProgress(stats: UserStats): number {
	const unlockedCount = stats.achievements.filter((a) => a.unlocked).length;
	return (unlockedCount / ACHIEVEMENTS.length) * 100;
}
