'use client';

import { Activity } from '@/types';
import ActivityCard from './activityCard';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';

interface SortableActivityCardProps {
	activity: Activity;
}

export default function SortableActivityCard({
	activity,
}: SortableActivityCardProps) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: activity.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
		cursor: isDragging ? 'grabbing' : 'grab',
	};

	return (
		<div ref={setNodeRef} style={style} {...attributes} {...listeners}>
			<motion.div
				animate={{
					scale: isDragging ? 1.05 : 1,
					rotate: isDragging ? 3 : 0,
				}}
				transition={{ type: 'spring', stiffness: 300, damping: 20 }}
			>
				<ActivityCard activity={activity} />
			</motion.div>
		</div>
	);
}
