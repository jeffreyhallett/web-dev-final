'use client';

import { City } from '@/types';
import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import {
	staggerContainer,
	fadeInUp,
	slideInLeft,
	pulseAnimation,
} from '@/lib/utils/animations';
import AddCityModal from '@/components/modals/AddCityModal';

interface CityListProps {
	cities: City[];
	currentCity: City | null;
	onCitySelect: (city: City) => void;
	onAddCity: (city: City) => void;
}

const gradientColors = [
	'var(--accent-coral)',
	'var(--accent-cyan)',
	'var(--accent-violet)',
	'var(--accent-emerald)',
	'var(--accent-amber)',
];

export default function CityList({
	cities,
	currentCity,
	onCitySelect,
	onAddCity,
}: CityListProps) {
	const [showAddCity, setShowAddCity] = useState(false);

	return (
		<motion.div
			className="glass rounded-xl shadow-lg p-6 h-full flex flex-col"
			style={{ background: 'rgba(255, 255, 255, 0.6)' }}
			variants={slideInLeft}
			initial="initial"
			animate="animate"
		>
			{/* Header with badge */}
			<div className="flex items-center justify-between mb-4">
				<h2 className="text-xl font-bold text-gray-800">Your Saved Trips</h2>
				<motion.div
					className="bg-gradient-to-r from-violet-500 to-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md"
					variants={pulseAnimation}
					animate="animate"
				>
					{cities.length}
				</motion.div>
			</div>

			{/* City list with stagger animation */}
			<motion.ul
				className="space-y-3 flex-1 overflow-y-auto custom-scrollbar"
				variants={staggerContainer}
				initial="initial"
				animate="animate"
			>
				{cities.map((city, index) => (
					<motion.li key={city.id} variants={fadeInUp}>
						<motion.button
							onClick={() => onCitySelect(city)}
							className={`w-full text-left px-4 py-3 rounded-xl transition-all relative overflow-hidden ${
								currentCity?.id === city.id
									? 'bg-white shadow-lg'
									: 'bg-white/50 hover:bg-white/80'
							}`}
							style={{
								borderLeft: `4px solid ${gradientColors[index % gradientColors.length]}`,
							}}
							whileHover={{
								y: -4,
								scale: 1.02,
								boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
							}}
							whileTap={{ scale: 0.98 }}
							transition={{ type: 'spring', stiffness: 400, damping: 17 }}
						>
							{/* Active indicator pulse */}
							{currentCity?.id === city.id && (
								<motion.div
									className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-transparent"
									initial={{ opacity: 0 }}
									animate={{ opacity: [0.3, 0.6, 0.3] }}
									transition={{ duration: 2, repeat: Infinity }}
								/>
							)}

							<div className="relative z-10">
								<div className="font-semibold text-gray-900 flex items-center gap-2">
									<span className="text-xl">
										{index === 0 ? '🌟' : index === 1 ? '🗺️' : '📍'}
									</span>
									{city.name}
								</div>
								<div className="text-sm text-gray-600">{city.country}</div>
							</div>
						</motion.button>
					</motion.li>
				))}
			</motion.ul>

			{/* Add City button */}
			<motion.button
				onClick={() => setShowAddCity(true)}
				className="mt-4 w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 font-semibold shadow-lg"
				whileHover={{ scale: 1.02, y: -2 }}
				whileTap={{ scale: 0.98 }}
				transition={{ type: 'spring', stiffness: 400, damping: 17 }}
			>
				<PlusIcon className="h-5 w-5" />
				Add City
			</motion.button>

			{/* Add City Modal */}
			<AddCityModal
				isOpen={showAddCity}
				onClose={() => setShowAddCity(false)}
				onAdd={onAddCity}
			/>
		</motion.div>
	);
}
