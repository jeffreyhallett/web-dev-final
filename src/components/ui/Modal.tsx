'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ReactNode } from 'react';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
	return (
		<AnimatePresence>
			{isOpen && (
				<>
					{/* Backdrop */}
					<motion.div
						className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						onClick={onClose}
					/>

					{/* Modal */}
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
						<motion.div
							className="glass-strong rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
							initial={{ scale: 0.9, opacity: 0, y: 20 }}
							animate={{ scale: 1, opacity: 1, y: 0 }}
							exit={{ scale: 0.9, opacity: 0, y: 20 }}
							transition={{ type: 'spring', stiffness: 300, damping: 30 }}
							onClick={(e) => e.stopPropagation()}
						>
							{/* Header */}
							<div className="bg-gradient-to-r from-violet-500 to-purple-500 px-6 py-4 flex items-center justify-between">
								<motion.h2
									className="text-2xl font-bold text-white"
									initial={{ x: -20, opacity: 0 }}
									animate={{ x: 0, opacity: 1 }}
									transition={{ delay: 0.1 }}
								>
									{title}
								</motion.h2>
								<motion.button
									onClick={onClose}
									className="p-2 hover:bg-white/20 rounded-lg transition-colors"
									whileHover={{ scale: 1.1, rotate: 90 }}
									whileTap={{ scale: 0.9 }}
								>
									<XMarkIcon className="w-6 h-6 text-white" />
								</motion.button>
							</div>

							{/* Content */}
							<motion.div
								className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.2 }}
							>
								{children}
							</motion.div>
						</motion.div>
					</div>
				</>
			)}
		</AnimatePresence>
	);
}
