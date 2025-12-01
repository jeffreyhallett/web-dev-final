'use client';

import { useState } from 'react';
import { City, Accommodation } from '@/types';
import Modal from '@/components/ui/Modal';
import { motion } from 'framer-motion';

interface AddAccommodationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onAdd: (accommodation: Accommodation) => void;
	city: City;
}

export default function AddAccommodationModal({
	isOpen,
	onClose,
	onAdd,
	city,
}: AddAccommodationModalProps) {
	const [formData, setFormData] = useState({
		name: '',
		address: '',
		checkIn: '',
		checkOut: '',
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.name || !formData.address) {
			return;
		}

		const newAccommodation: Accommodation = {
			id: Date.now().toString(),
			name: formData.name,
			address: formData.address,
			checkIn: formData.checkIn,
			checkOut: formData.checkOut,
			city: city,
		};

		onAdd(newAccommodation);
		setFormData({ name: '', address: '', checkIn: '', checkOut: '' });
		onClose();
	};

	const handleClose = () => {
		setFormData({ name: '', address: '', checkIn: '', checkOut: '' });
		onClose();
	};

	return (
		<Modal isOpen={isOpen} onClose={handleClose} title="🏨 Add Accommodation">
			<form onSubmit={handleSubmit} className="space-y-4">
				{/* Name */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
				>
					<label className="block text-sm font-semibold text-gray-700 mb-2">
						Accommodation Name *
					</label>
					<input
						type="text"
						value={formData.name}
						onChange={(e) =>
							setFormData({ ...formData, name: e.target.value })
						}
						className="w-full px-4 py-2.5 glass rounded-lg focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
						placeholder="e.g., Grand Hotel Vienna"
						required
					/>
				</motion.div>

				{/* Address */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.15 }}
				>
					<label className="block text-sm font-semibold text-gray-700 mb-2">
						Address *
					</label>
					<input
						type="text"
						value={formData.address}
						onChange={(e) =>
							setFormData({ ...formData, address: e.target.value })
						}
						className="w-full px-4 py-2.5 glass rounded-lg focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
						placeholder="e.g., Kärntner Ring 9, 1010 Vienna"
						required
					/>
				</motion.div>

				{/* Check-in Date */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
				>
					<label className="block text-sm font-semibold text-gray-700 mb-2">
						Check-in Date
					</label>
					<input
						type="date"
						value={formData.checkIn}
						onChange={(e) =>
							setFormData({ ...formData, checkIn: e.target.value })
						}
						className="w-full px-4 py-2.5 glass rounded-lg focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
					/>
				</motion.div>

				{/* Check-out Date */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.25 }}
				>
					<label className="block text-sm font-semibold text-gray-700 mb-2">
						Check-out Date
					</label>
					<input
						type="date"
						value={formData.checkOut}
						onChange={(e) =>
							setFormData({ ...formData, checkOut: e.target.value })
						}
						className="w-full px-4 py-2.5 glass rounded-lg focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
					/>
				</motion.div>

				{/* Buttons */}
				<motion.div
					className="flex gap-3 pt-4"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.3 }}
				>
					<button
						type="button"
						onClick={handleClose}
						className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors font-medium"
					>
						Cancel
					</button>
					<motion.button
						type="submit"
						className="flex-1 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-lg transition-all shadow-md font-medium"
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
					>
						Add Accommodation
					</motion.button>
				</motion.div>
			</form>
		</Modal>
	);
}
