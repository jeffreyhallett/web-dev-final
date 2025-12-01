'use client';

import { Activity } from '@/types';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { calculate3DTilt } from '@/lib/utils/animations';

interface ActivityCardProps {
	activity: Activity;
}

const gradientColors = [
	'var(--accent-coral)',
	'var(--accent-cyan)',
	'var(--accent-violet)',
	'var(--accent-emerald)',
	'var(--accent-amber)',
];

export default function ActivityCard({ activity }: ActivityCardProps) {
	const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
	const [isHovered, setIsHovered] = useState(false);

	// Random gradient color based on activity ID
	const borderColor =
		gradientColors[
			activity.id.charCodeAt(0) % gradientColors.length
		];

	const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
		const rect = e.currentTarget.getBoundingClientRect();
		const tiltValues = calculate3DTilt(e.clientX, e.clientY, rect, 8);
		setTilt(tiltValues);
	};

	const handleMouseLeave = () => {
		setTilt({ rotateX: 0, rotateY: 0 });
		setIsHovered(false);
	};

	return (
		<motion.div
			className="glass rounded-xl p-4 relative overflow-hidden preserve-3d"
			style={{
				borderLeft: `4px solid ${borderColor}`,
				background: 'rgba(255, 255, 255, 0.7)',
			}}
			onMouseMove={handleMouseMove}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={handleMouseLeave}
			animate={{
				rotateX: tilt.rotateX,
				rotateY: tilt.rotateY,
			}}
			whileHover={{
				y: -5,
				scale: 1.02,
				boxShadow: '0 15px 35px rgba(157, 107, 255, 0.3)',
			}}
			whileTap={{ scale: 0.98 }}
			transition={{
				type: 'spring',
				stiffness: 400,
				damping: 17,
			}}
		>
			{/* Shimmer effect on hover */}
			{isHovered && (
				<motion.div
					className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
					initial={{ x: '-100%' }}
					animate={{ x: '100%' }}
					transition={{ duration: 0.6, ease: 'easeInOut' }}
				/>
			)}

			<div className="relative z-10">
				<div className="flex justify-between items-start">
					<div className="flex-1">
						{/* Activity name with floating icon */}
						<div className="flex items-center gap-2">
							<motion.span
								className="text-2xl"
								animate={{ y: [0, -3, 0] }}
								transition={{
									duration: 2,
									repeat: Infinity,
									ease: 'easeInOut',
								}}
							>
								🎯
							</motion.span>
							<h4 className="font-semibold text-gray-900">
								{activity.name}
							</h4>
						</div>

						{/* Description */}
						<p className="text-sm text-gray-600 mt-2 leading-relaxed">
							{activity.description}
						</p>

						{/* Location and Time */}
						<div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
							<span className="flex items-center gap-1">
								📍 {activity.location}
							</span>
							<span className="flex items-center gap-1">
								⏰ {activity.time}
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Decorative gradient orb */}
			<motion.div
				className="absolute -right-10 -top-10 w-24 h-24 rounded-full opacity-20 blur-2xl"
				style={{ background: borderColor }}
				animate={{
					scale: isHovered ? 1.2 : 1,
					opacity: isHovered ? 0.3 : 0.2,
				}}
			/>
		</motion.div>
	);
}
