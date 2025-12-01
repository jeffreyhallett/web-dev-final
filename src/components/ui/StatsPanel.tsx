'use client';

import { UserStats } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import {
	getXPForNextLevel,
	getLevelProgress,
	getLevelGradient,
	getAchievementProgress,
} from '@/lib/utils/gamification';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface StatsPanelProps {
	stats: UserStats;
}

export default function StatsPanel({ stats }: StatsPanelProps) {
	const [isOpen, setIsOpen] = useState(false);
	const xpForNext = getXPForNextLevel(stats.level);
	const progress = getLevelProgress(stats.xp);
	const achievementProgress = getAchievementProgress(stats);

	return (
		<div className="relative">
			{/* Toggle Button */}
			<motion.button
				onClick={() => setIsOpen(!isOpen)}
				className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
				whileHover={{ scale: 1.05 }}
				whileTap={{ scale: 0.95 }}
			>
				<div className="flex items-center gap-2">
					<motion.div
						className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg"
						style={{ background: getLevelGradient(stats.level) }}
						animate={{ rotate: [0, 5, -5, 0] }}
						transition={{ duration: 2, repeat: Infinity }}
					>
						{stats.level}
					</motion.div>
					<div className="text-left">
						<div className="text-xs text-white/80">Level {stats.level}</div>
						<div className="text-sm font-semibold text-white">
							{stats.xp} XP
						</div>
					</div>
				</div>
				<ChevronDownIcon
					className={`w-4 h-4 text-white transition-transform ${
						isOpen ? 'rotate-180' : ''
					}`}
				/>
			</motion.button>

			{/* Dropdown Panel */}
			<AnimatePresence>
				{isOpen && (
					<motion.div
						className="absolute top-full right-0 mt-2 w-80 glass-strong rounded-xl shadow-2xl overflow-hidden z-50"
						initial={{ opacity: 0, y: -10, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -10, scale: 0.95 }}
						transition={{ type: 'spring', stiffness: 300, damping: 25 }}
					>
						{/* Header */}
						<div
							className="px-6 py-4"
							style={{ background: getLevelGradient(stats.level) }}
						>
							<h3 className="text-xl font-bold text-white mb-2">
								Your Progress
							</h3>
							<div className="flex items-center gap-4 text-white/90 text-sm">
								<span>🏙️ {stats.citiesVisited} Cities</span>
								<span>📋 {stats.activitiesPlanned} Activities</span>
							</div>
						</div>

						{/* Stats Content */}
						<div className="p-6 space-y-4">
							{/* XP Progress */}
							<div>
								<div className="flex justify-between items-center mb-2">
									<span className="text-sm font-semibold text-gray-700">
										Level Progress
									</span>
									<span className="text-xs text-gray-500">
										{stats.xp} / {xpForNext} XP
									</span>
								</div>
								<div className="h-3 bg-gray-200 rounded-full overflow-hidden">
									<motion.div
										className="h-full bg-gradient-to-r from-violet-500 to-purple-500"
										initial={{ width: 0 }}
										animate={{ width: `${progress * 100}%` }}
										transition={{ duration: 0.5, ease: 'easeOut' }}
									/>
								</div>
							</div>

							{/* Achievements */}
							<div>
								<div className="flex justify-between items-center mb-2">
									<span className="text-sm font-semibold text-gray-700">
										Achievements
									</span>
									<span className="text-xs text-gray-500">
										{stats.achievements.filter((a) => a.unlocked).length} /{' '}
										{stats.achievements.length + 6}
									</span>
								</div>
								<div className="h-3 bg-gray-200 rounded-full overflow-hidden">
									<motion.div
										className="h-full bg-gradient-to-r from-amber-400 to-orange-400"
										initial={{ width: 0 }}
										animate={{ width: `${achievementProgress}%` }}
										transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
									/>
								</div>

								{/* Achievement Badges */}
								<div className="mt-3 flex flex-wrap gap-2">
									{stats.achievements
										.filter((a) => a.unlocked)
										.map((achievement) => (
											<motion.div
												key={achievement.id}
												className="px-3 py-1.5 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full text-xs font-semibold text-amber-800 flex items-center gap-1"
												initial={{ scale: 0, rotate: -180 }}
												animate={{ scale: 1, rotate: 0 }}
												whileHover={{ scale: 1.1 }}
												title={achievement.description}
											>
												<span>{achievement.icon}</span>
												<span>{achievement.name}</span>
											</motion.div>
										))}
								</div>
							</div>

							{/* Quick Stats */}
							<div className="grid grid-cols-2 gap-3 pt-2">
								<div className="text-center p-3 bg-blue-50 rounded-lg">
									<div className="text-2xl font-bold text-blue-600">
										{stats.level}
									</div>
									<div className="text-xs text-gray-600">Level</div>
								</div>
								<div className="text-center p-3 bg-purple-50 rounded-lg">
									<div className="text-2xl font-bold text-purple-600">
										{stats.totalDays}
									</div>
									<div className="text-xs text-gray-600">Days Planned</div>
								</div>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
