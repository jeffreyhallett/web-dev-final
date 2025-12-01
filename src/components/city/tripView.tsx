'use client';

import { City, Activity, Trip } from '@/types';
import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import CityViewMap from '@/components/map/cityViewMap';
import SortableActivityCard from '@/components/ui/SortableActivityCard';
import { motion } from 'framer-motion';
import {
	slideInLeft,
	scaleIn,
	slideInRight,
	staggerContainer,
	fadeInUp,
} from '@/lib/utils/animations';
import AddActivityModal from '@/components/modals/AddActivityModal';
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
} from '@dnd-kit/core';
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
	useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CityViewProps {
	city: City;
	trip?: Trip;
	activities: Activity[];
	onUpdateActivities: (activities: Activity[]) => void;
	onUpdateTrip: (trip: Trip) => void;
	onAddActivity?: (activity: Activity) => void;
}

export default function TripView({
	city,
	trip,
	activities,
	onUpdateActivities,
	onUpdateTrip,
	onAddActivity,
}: CityViewProps) {
	const [unsavedTrip, setUnsavedTrip] = useState<Trip>(
		trip || {
			id: '',
			cities: [city],
			activities: [],
			dates: { arrival: '', departure: '' },
			accommodation: [],
			transportation: { flights: [], trainRides: [] },
			notes: [],
		}
	);

	const [showAddActivity, setShowAddActivity] = useState(false);

	const recommendedActivities = activities.filter(
		(a) => a.inTravelPlan === false
	);
	const plannedActivities = activities.filter((a) => a.inTravelPlan === true);

	// Drag and drop sensors
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;

		if (over && active.id !== over.id) {
			const oldIndex = plannedActivities.findIndex((a) => a.id === active.id);
			const newIndex = plannedActivities.findIndex((a) => a.id === over.id);

			const reorderedPlanned = arrayMove(
				plannedActivities,
				oldIndex,
				newIndex
			);
			const allActivities = [...reorderedPlanned, ...recommendedActivities];
			onUpdateActivities(allActivities);
		}
	};

	const handleAddActivity = (activity: Activity) => {
		onUpdateActivities([...activities, activity]);
		// Call the parent's onAddActivity for gamification
		if (onAddActivity) {
			onAddActivity(activity);
		}
	};

	return (
		<div className="grid grid-cols-[300px_1fr_350px] gap-6 h-full">
			{/* Left Column - Planned Activities */}
			<motion.div
				className="flex flex-col"
				variants={slideInLeft}
				initial="initial"
				animate="animate"
			>
				<div className="glass rounded-xl shadow-lg p-6 flex-1 overflow-y-auto custom-scrollbar">
					<div className="space-y-6">
						<div>
							<div className="flex justify-between items-center mb-4">
								<h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
									<span className="text-2xl">📋</span>
									Planned Activities
								</h3>
								<motion.button
									onClick={() => setShowAddActivity(true)}
									className="p-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg hover:from-violet-600 hover:to-purple-600 transition-all shadow-md"
									whileHover={{ scale: 1.1, rotate: 90 }}
									whileTap={{ scale: 0.9 }}
								>
									<PlusIcon className="w-5 h-5" />
								</motion.button>
							</div>

							{plannedActivities.length === 0 ? (
								<motion.div
									className="text-center py-8"
									initial={{ opacity: 0, scale: 0.9 }}
									animate={{ opacity: 1, scale: 1 }}
								>
									<p className="text-6xl mb-4">📝</p>
									<p className="text-gray-500 text-sm">
										No planned activities yet. Add some!
									</p>
								</motion.div>
							) : (
								<DndContext
									sensors={sensors}
									collisionDetection={closestCenter}
									onDragEnd={handleDragEnd}
								>
									<SortableContext
										items={plannedActivities.map((a) => a.id)}
										strategy={verticalListSortingStrategy}
									>
										<motion.div
											className="space-y-3"
											variants={staggerContainer}
											initial="initial"
											animate="animate"
										>
											{plannedActivities.map((activity) => (
												<motion.div key={activity.id} variants={fadeInUp}>
													<SortableActivityCard activity={activity} />
												</motion.div>
											))}
										</motion.div>
									</SortableContext>
								</DndContext>
							)}
						</div>
					</div>
				</div>
			</motion.div>

			{/* Center Column - City Info & Map */}
			<motion.div
				className="flex flex-col gap-4"
				variants={scaleIn}
				initial="initial"
				animate="animate"
			>
				{/* City Header */}
				<motion.div
					className="glass rounded-xl shadow-lg p-6 flex flex-col gap-2 justify-center items-center"
					style={{
						background: 'var(--gradient-ocean)',
						backgroundSize: '200% 200%',
					}}
					animate={{
						backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
					}}
					transition={{
						duration: 8,
						repeat: Infinity,
						ease: 'linear',
					}}
				>
					<motion.h2
						className="text-3xl font-bold text-white drop-shadow-lg"
						animate={{ y: [0, -5, 0] }}
						transition={{
							duration: 3,
							repeat: Infinity,
							ease: 'easeInOut',
						}}
					>
						{city.name}, {city.country}
					</motion.h2>
					<p className="text-sm text-white/90 drop-shadow">
						📍 Coordinates: {city.latitude.toFixed(4)}°,{' '}
						{city.longitude.toFixed(4)}°
					</p>
				</motion.div>

				{/* Map */}
				<motion.div
					className="glass rounded-xl shadow-lg overflow-hidden flex-1"
					whileHover={{ scale: 1.01 }}
					transition={{ type: 'spring', stiffness: 300 }}
				>
					<CityViewMap city={city} />
				</motion.div>
			</motion.div>

			{/* Right Column - Trip Plan */}
			<motion.div
				className="flex flex-col"
				variants={slideInRight}
				initial="initial"
				animate="animate"
			>
				<div className="glass rounded-xl shadow-lg p-6 flex-1 overflow-y-auto custom-scrollbar">
					<h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
						<span className="text-2xl">✈️</span>
						Trip Plan
					</h3>
					<div className="space-y-4">
						{/* Accommodation */}
						<motion.div
							whileHover={{ x: 2 }}
							transition={{ type: 'spring', stiffness: 400 }}
						>
							<label className="block text-sm font-semibold text-gray-700 mb-2">
								🏨 Accommodation:
							</label>
							<input
								type="text"
								value={unsavedTrip.accommodation[0]?.name || ''}
								onChange={(e) => {
									setUnsavedTrip({
										...unsavedTrip,
										accommodation: [
											{
												...unsavedTrip.accommodation[0],
												name: e.target.value,
											} as any,
										],
									});
								}}
								className="w-full px-4 py-2.5 glass rounded-lg focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
								placeholder="Enter accommodation name"
								onBlur={() => onUpdateTrip(unsavedTrip)}
							/>
						</motion.div>

						{/* Transportation */}
						<motion.div
							whileHover={{ x: 2 }}
							transition={{ type: 'spring', stiffness: 400 }}
						>
							<label className="block text-sm font-semibold text-gray-700 mb-2">
								🚆 Transportation:
							</label>
							<div className="glass rounded-lg p-3 text-sm text-gray-500">
								Add your flights or trains
							</div>
						</motion.div>

						{/* Notes */}
						<motion.div
							whileHover={{ x: 2 }}
							transition={{ type: 'spring', stiffness: 400 }}
						>
							<label className="block text-sm font-semibold text-gray-700 mb-2">
								📝 Notes:
							</label>
							<textarea
								value={unsavedTrip.notes[0]?.content || ''}
								onChange={(e) =>
									setUnsavedTrip({
										...unsavedTrip,
										notes: [
											{
												...unsavedTrip.notes[0],
												content: e.target.value,
											} as any,
										],
									})
								}
								onBlur={() => onUpdateTrip(unsavedTrip)}
								placeholder="Important information..."
								rows={4}
								className="w-full px-4 py-2.5 glass rounded-lg focus:ring-2 focus:ring-violet-400 focus:border-transparent resize-none transition-all"
							/>
						</motion.div>

						{/* Fun fact badge */}
						<motion.div
							className="mt-6 p-4 rounded-xl bg-gradient-to-r from-amber-400 to-orange-400 text-white"
							animate={{
								boxShadow: [
									'0 0 20px rgba(251, 191, 36, 0.3)',
									'0 0 30px rgba(251, 191, 36, 0.5)',
									'0 0 20px rgba(251, 191, 36, 0.3)',
								],
							}}
							transition={{ duration: 2, repeat: Infinity }}
						>
							<p className="text-xs font-semibold mb-1">💡 Travel Tip</p>
							<p className="text-sm">
								Save your trip plan to earn XP and unlock achievements!
							</p>
						</motion.div>
					</div>
				</div>
			</motion.div>

			{/* Add Activity Modal */}
			<AddActivityModal
				isOpen={showAddActivity}
				onClose={() => setShowAddActivity(false)}
				onAdd={handleAddActivity}
				city={city}
			/>
		</div>
	);
}
