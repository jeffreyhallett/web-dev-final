'use client';

import { motion } from 'framer-motion';
import { slideInDown, floatAnimation, springTransition } from '@/lib/utils/animations';
import { UserStats } from '@/types';
import StatsPanel from '@/components/ui/StatsPanel';

interface headerProps {
	view: 'list' | 'map';
	onViewChange: (view: 'list' | 'map') => void;
	stats: UserStats;
}

export default function Header({ view, onViewChange, stats }: headerProps) {
	return (
		<motion.header
			className="mx-4 mt-4 mb-0"
			variants={slideInDown}
			initial="initial"
			animate="animate"
			transition={springTransition}
		>
			<div
				className="glass rounded-xl shadow-lg px-6 py-4 animate-gradient-shift"
				style={{
					background: 'var(--gradient-cosmic)',
					backgroundSize: '200% 200%',
				}}
			>
				<div className="flex justify-between items-center">
					{/* Floating title */}
					<motion.h1
						className="text-3xl font-bold text-white tracking-tight"
						variants={floatAnimation}
						animate="animate"
					>
						✈️ Travel Planner
					</motion.h1>

					{/* Right side: Toggle buttons and Stats Panel */}
					<div className="flex items-center gap-4">
						{/* Toggle buttons with 3D flip effect */}
						<div className="flex gap-2 bg-white/10 p-1 rounded-lg backdrop-blur-sm">
							<motion.button
								onClick={() => onViewChange('list')}
								className={`px-5 py-2.5 rounded-md transition-all font-medium ${
									view === 'list'
										? 'bg-white text-blue-600 shadow-md'
										: 'text-white hover:bg-white/20'
								}`}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								transition={{ type: 'spring', stiffness: 400, damping: 17 }}
							>
								List View
							</motion.button>
							<motion.button
								onClick={() => onViewChange('map')}
								className={`px-5 py-2.5 rounded-md transition-all font-medium ${
									view === 'map'
										? 'bg-white text-blue-600 shadow-md'
										: 'text-white hover:bg-white/20'
								}`}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								transition={{ type: 'spring', stiffness: 400, damping: 17 }}
							>
								Map View
							</motion.button>
						</div>

						{/* Stats Panel */}
						<StatsPanel stats={stats} />
					</div>
				</div>
			</div>
		</motion.header>
	);
}
