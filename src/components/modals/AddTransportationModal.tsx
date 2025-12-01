'use client';

import { useState } from 'react';
import { City, Flight, TrainRide } from '@/types';
import Modal from '@/components/ui/Modal';
import { motion } from 'framer-motion';

interface AddTransportationModalProps {
	isOpen: boolean;
	onClose: () => void;
	onAddFlight?: (flight: Flight) => void;
	onAddTrain?: (train: TrainRide) => void;
	city: City;
}

export default function AddTransportationModal({
	isOpen,
	onClose,
	onAddFlight,
	onAddTrain,
	city,
}: AddTransportationModalProps) {
	const [transportType, setTransportType] = useState<'flight' | 'train'>(
		'flight'
	);
	const [formData, setFormData] = useState({
		from: '',
		to: city.name,
		departureTime: '',
		arrivalTime: '',
		flightNumber: '',
		trainNumber: '',
		carrier: '',
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.from || !formData.to) {
			return;
		}

		if (transportType === 'flight' && onAddFlight) {
			const newFlight: Flight = {
				id: Date.now().toString(),
				from: formData.from,
				to: formData.to,
				departureTime: formData.departureTime,
				arrivalTime: formData.arrivalTime,
				flightNumber: formData.flightNumber,
				carrier: formData.carrier,
			};
			onAddFlight(newFlight);
		} else if (transportType === 'train' && onAddTrain) {
			const newTrain: TrainRide = {
				id: Date.now().toString(),
				from: formData.from,
				to: formData.to,
				departureTime: formData.departureTime,
				arrivalTime: formData.arrivalTime,
				trainNumber: formData.trainNumber,
				carrier: formData.carrier,
			};
			onAddTrain(newTrain);
		}

		setFormData({
			from: '',
			to: city.name,
			departureTime: '',
			arrivalTime: '',
			flightNumber: '',
			trainNumber: '',
			carrier: '',
		});
		onClose();
	};

	const handleClose = () => {
		setFormData({
			from: '',
			to: city.name,
			departureTime: '',
			arrivalTime: '',
			flightNumber: '',
			trainNumber: '',
			carrier: '',
		});
		onClose();
	};

	return (
		<Modal isOpen={isOpen} onClose={handleClose} title="🚆 Add Transportation">
			<form onSubmit={handleSubmit} className="space-y-4">
				{/* Type Toggle */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.05 }}
				>
					<label className="block text-sm font-semibold text-gray-700 mb-2">
						Transportation Type
					</label>
					<div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
						<button
							type="button"
							onClick={() => setTransportType('flight')}
							className={`flex-1 px-4 py-2 rounded-md transition-all font-medium ${
								transportType === 'flight'
									? 'bg-white text-violet-600 shadow-md'
									: 'text-gray-600 hover:bg-white/50'
							}`}
						>
							✈️ Flight
						</button>
						<button
							type="button"
							onClick={() => setTransportType('train')}
							className={`flex-1 px-4 py-2 rounded-md transition-all font-medium ${
								transportType === 'train'
									? 'bg-white text-violet-600 shadow-md'
									: 'text-gray-600 hover:bg-white/50'
							}`}
						>
							🚆 Train
						</button>
					</div>
				</motion.div>

				{/* From */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
				>
					<label className="block text-sm font-semibold text-gray-700 mb-2">
						From *
					</label>
					<input
						type="text"
						value={formData.from}
						onChange={(e) =>
							setFormData({ ...formData, from: e.target.value })
						}
						className="w-full px-4 py-2.5 glass rounded-lg focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
						placeholder="e.g., Prague"
						required
					/>
				</motion.div>

				{/* To */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.15 }}
				>
					<label className="block text-sm font-semibold text-gray-700 mb-2">
						To *
					</label>
					<input
						type="text"
						value={formData.to}
						onChange={(e) => setFormData({ ...formData, to: e.target.value })}
						className="w-full px-4 py-2.5 glass rounded-lg focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
						placeholder="e.g., Vienna"
						required
					/>
				</motion.div>

				{/* Flight/Train Number */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.2 }}
				>
					<label className="block text-sm font-semibold text-gray-700 mb-2">
						{transportType === 'flight' ? 'Flight Number' : 'Train Number'}
					</label>
					<input
						type="text"
						value={
							transportType === 'flight'
								? formData.flightNumber
								: formData.trainNumber
						}
						onChange={(e) =>
							setFormData({
								...formData,
								[transportType === 'flight'
									? 'flightNumber'
									: 'trainNumber']: e.target.value,
							})
						}
						className="w-full px-4 py-2.5 glass rounded-lg focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
						placeholder={
							transportType === 'flight' ? 'e.g., OS501' : 'e.g., RJ73'
						}
					/>
				</motion.div>

				{/* Carrier */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.25 }}
				>
					<label className="block text-sm font-semibold text-gray-700 mb-2">
						Carrier
					</label>
					<input
						type="text"
						value={formData.carrier}
						onChange={(e) =>
							setFormData({ ...formData, carrier: e.target.value })
						}
						className="w-full px-4 py-2.5 glass rounded-lg focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
						placeholder={
							transportType === 'flight'
								? 'e.g., Austrian Airlines'
								: 'e.g., ÖBB'
						}
					/>
				</motion.div>

				{/* Departure Time */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.3 }}
				>
					<label className="block text-sm font-semibold text-gray-700 mb-2">
						Departure Time
					</label>
					<input
						type="datetime-local"
						value={formData.departureTime}
						onChange={(e) =>
							setFormData({ ...formData, departureTime: e.target.value })
						}
						className="w-full px-4 py-2.5 glass rounded-lg focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
					/>
				</motion.div>

				{/* Arrival Time */}
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.35 }}
				>
					<label className="block text-sm font-semibold text-gray-700 mb-2">
						Arrival Time
					</label>
					<input
						type="datetime-local"
						value={formData.arrivalTime}
						onChange={(e) =>
							setFormData({ ...formData, arrivalTime: e.target.value })
						}
						className="w-full px-4 py-2.5 glass rounded-lg focus:ring-2 focus:ring-violet-400 focus:border-transparent transition-all"
					/>
				</motion.div>

				{/* Buttons */}
				<motion.div
					className="flex gap-3 pt-4"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 0.4 }}
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
						Add {transportType === 'flight' ? 'Flight' : 'Train'}
					</motion.button>
				</motion.div>
			</form>
		</Modal>
	);
}
