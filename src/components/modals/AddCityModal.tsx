'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import { City } from '@/types';
import { motion } from 'framer-motion';

interface AddCityModalProps {
	isOpen: boolean;
	onClose: () => void;
	onAdd: (city: City) => void;
}

export default function AddCityModal({
	isOpen,
	onClose,
	onAdd,
}: AddCityModalProps) {
	const [formData, setFormData] = useState({
		name: '',
		country: '',
		latitude: '',
		longitude: '',
	});

	const [errors, setErrors] = useState<Record<string, string>>({});

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.name.trim()) {
			newErrors.name = 'City name is required';
		}
		if (!formData.country.trim()) {
			newErrors.country = 'Country is required';
		}
		if (!formData.latitude || isNaN(Number(formData.latitude))) {
			newErrors.latitude = 'Valid latitude is required';
		}
		if (!formData.longitude || isNaN(Number(formData.longitude))) {
			newErrors.longitude = 'Valid longitude is required';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		const newCity: City = {
			id: Date.now().toString(),
			name: formData.name,
			country: formData.country,
			latitude: Number(formData.latitude),
			longitude: Number(formData.longitude),
		};

		onAdd(newCity);
		setFormData({ name: '', country: '', latitude: '', longitude: '' });
		setErrors({});
		onClose();
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Add New City">
			<form onSubmit={handleSubmit} className="space-y-4">
				{/* City Name */}
				<motion.div
					initial={{ x: -20, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					transition={{ delay: 0.1 }}
				>
					<label className="block text-sm font-semibold text-gray-700 mb-2">
						🏙️ City Name
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
						placeholder="e.g., Paris"
					/>
					{errors.name && (
						<p className="text-red-500 text-xs mt-1">{errors.name}</p>
					)}
				</motion.div>

				{/* Country */}
				<motion.div
					initial={{ x: -20, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					transition={{ delay: 0.2 }}
				>
					<label className="block text-sm font-semibold text-gray-700 mb-2">
						🌍 Country
					</label>
					<input
						type="text"
						value={formData.country}
						onChange={(e) =>
							setFormData({ ...formData, country: e.target.value })
						}
						className={`w-full px-4 py-2.5 glass rounded-lg focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all ${
							errors.country ? 'ring-2 ring-red-400' : ''
						}`}
						placeholder="e.g., France"
					/>
					{errors.country && (
						<p className="text-red-500 text-xs mt-1">{errors.country}</p>
					)}
				</motion.div>

				{/* Latitude */}
				<motion.div
					initial={{ x: -20, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					transition={{ delay: 0.3 }}
				>
					<label className="block text-sm font-semibold text-gray-700 mb-2">
						📍 Latitude
					</label>
					<input
						type="number"
						step="any"
						value={formData.latitude}
						onChange={(e) =>
							setFormData({ ...formData, latitude: e.target.value })
						}
						className={`w-full px-4 py-2.5 glass rounded-lg focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all ${
							errors.latitude ? 'ring-2 ring-red-400' : ''
						}`}
						placeholder="e.g., 48.8566"
					/>
					{errors.latitude && (
						<p className="text-red-500 text-xs mt-1">{errors.latitude}</p>
					)}
				</motion.div>

				{/* Longitude */}
				<motion.div
					initial={{ x: -20, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					transition={{ delay: 0.4 }}
				>
					<label className="block text-sm font-semibold text-gray-700 mb-2">
						📍 Longitude
					</label>
					<input
						type="number"
						step="any"
						value={formData.longitude}
						onChange={(e) =>
							setFormData({ ...formData, longitude: e.target.value })
						}
						className={`w-full px-4 py-2.5 glass rounded-lg focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all ${
							errors.longitude ? 'ring-2 ring-red-400' : ''
						}`}
						placeholder="e.g., 2.3522"
					/>
					{errors.longitude && (
						<p className="text-red-500 text-xs mt-1">{errors.longitude}</p>
					)}
				</motion.div>

				{/* Buttons */}
				<motion.div
					className="flex gap-3 pt-4"
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ delay: 0.5 }}
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
						Add City
					</motion.button>
				</motion.div>
			</form>
		</Modal>
	);
}
