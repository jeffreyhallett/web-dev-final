'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { Activity, City } from '@/types';
import { motion } from 'framer-motion';

interface AddActivityModalProps {
	isOpen: boolean;
	onClose: () => void;
	onAdd: (activity: Activity) => void;
	city: City;
}

export default function AddActivityModal({
	isOpen,
	onClose,
	onAdd,
	city,
}: AddActivityModalProps) {
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		location: '',
		time: '',
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.name.trim()) {
			newErrors.name = 'Activity name is required';
		}
		if (!formData.description.trim()) {
			newErrors.description = 'Description is required';
		}
		if (!formData.location.trim()) {
			newErrors.location = 'Location is required';
		}
		if (!formData.time.trim()) {
			newErrors.time = 'Time is required';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		const newActivity: Activity = {
			id: Date.now().toString(),
			name: formData.name,
			description: formData.description,
			location: formData.location,
			time: formData.time,
			city: city,
			inTravelPlan: true,
		};

		onAdd(newActivity);
		setFormData({ name: '', description: '', location: '', time: '' });
		setErrors({});
		onClose();
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Add New Activity">
			<form onSubmit={handleSubmit} className="space-y-4">
				{/* Activity Name */}
				<motion.div
					initial={{ x: -20, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					transition={{ delay: 0.1 }}
				>
					<label className="block text-sm font-semibold text-gray-700 mb-2">
						🎯 Activity Name
					</label>
					<input
						type="text"
						value={formData.name}
						onChange={(e) =>
							setFormData({ ...formData, name: e.target.value })
						}
						className={`w-full px-4 py-2.5 glass rounded-lg focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all ${
							errors.name ? 'ring-2 ring-red-400' : ''
						}`}
						placeholder="e.g., Visit Museum"
					/>
					{errors.name && (
						<p className="text-red-500 text-xs mt-1">{errors.name}</p>
					)}
				</motion.div>

				{/* Description */}
				<motion.div
					initial={{ x: -20, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					transition={{ delay: 0.2 }}
				>
					<label className="block text-sm font-semibold text-gray-700 mb-2">
						📝 Description
					</label>
					<textarea
						value={formData.description}
						onChange={(e) =>
							setFormData({ ...formData, description: e.target.value })
						}
						rows={3}
						className={`w-full px-4 py-2.5 glass rounded-lg focus:ring-2 focus:ring-violet-400 focus:border-transparent resize-none transition-all ${
							errors.description ? 'ring-2 ring-red-400' : ''
						}`}
						placeholder="Describe what you'll do..."
					/>
					{errors.description && (
						<p className="text-red-500 text-xs mt-1">{errors.description}</p>
					)}
				</motion.div>

				{/* Location */}
				<motion.div
					initial={{ x: -20, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					transition={{ delay: 0.3 }}
				>
					<label className="block text-sm font-semibold text-gray-700 mb-2">
						📍 Location
					</label>
					<input
						type="text"
						value={formData.location}
						onChange={(e) =>
							setFormData({ ...formData, location: e.target.value })
						}
						className={`w-full px-4 py-2.5 glass rounded-lg focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all ${
							errors.location ? 'ring-2 ring-red-400' : ''
						}`}
						placeholder="e.g., Main Street 123"
					/>
					{errors.location && (
						<p className="text-red-500 text-xs mt-1">{errors.location}</p>
					)}
				</motion.div>

				{/* Time */}
				<motion.div
					initial={{ x: -20, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					transition={{ delay: 0.4 }}
				>
					<label className="block text-sm font-semibold text-gray-700 mb-2">
						⏰ Time
					</label>
					<input
						type="text"
						value={formData.time}
						onChange={(e) =>
							setFormData({ ...formData, time: e.target.value })
						}
						className={`w-full px-4 py-2.5 glass rounded-lg focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all ${
							errors.time ? 'ring-2 ring-red-400' : ''
						}`}
						placeholder="e.g., 10:00 AM"
					/>
					{errors.time && (
						<p className="text-red-500 text-xs mt-1">{errors.time}</p>
					)}
				</motion.div>

				{/* Info Badge */}
				<motion.div
					className="p-3 rounded-lg bg-blue-50 border border-blue-200"
					initial={{ y: 10, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ delay: 0.5 }}
				>
					<p className="text-xs text-blue-700">
						💡 This activity will be added to <strong>{city.name}</strong>
					</p>
				</motion.div>

				{/* Buttons */}
				<motion.div
					className="flex gap-3 pt-2"
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ delay: 0.6 }}
				>
					<motion.button
						type="button"
						onClick={onClose}
						className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
					>
						Cancel
					</motion.button>
					<motion.button
						type="submit"
						className="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-lg font-semibold hover:from-violet-600 hover:to-purple-600 transition-all shadow-lg"
						whileHover={{ scale: 1.02, y: -2 }}
						whileTap={{ scale: 0.98 }}
					>
						Add Activity
					</motion.button>
				</motion.div>
			</form>
		</Modal>
	);
}
