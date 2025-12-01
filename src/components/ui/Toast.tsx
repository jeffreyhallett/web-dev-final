'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

export interface ToastProps {
	message: string;
	type?: 'success' | 'error' | 'info' | 'xp';
	icon?: string;
	duration?: number;
	onClose: () => void;
}

export default function Toast({
	message,
	type = 'info',
	icon,
	duration = 3000,
	onClose,
}: ToastProps) {
	useEffect(() => {
		const timer = setTimeout(onClose, duration);
		return () => clearTimeout(timer);
	}, [duration, onClose]);

	const bgColor = {
		success: 'bg-gradient-to-r from-emerald-500 to-green-500',
		error: 'bg-gradient-to-r from-red-500 to-pink-500',
		info: 'bg-gradient-to-r from-blue-500 to-indigo-500',
		xp: 'bg-gradient-to-r from-violet-500 to-purple-500',
	}[type];

	const defaultIcon = {
		success: '✅',
		error: '❌',
		info: 'ℹ️',
		xp: '⭐',
	}[type];

	return (
		<motion.div
			className={`${bgColor} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 min-w-[300px]`}
			initial={{ opacity: 0, y: 50, scale: 0.3 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
			transition={{ type: 'spring', stiffness: 500, damping: 30 }}
		>
			<span className="text-2xl">{icon || defaultIcon}</span>
			<p className="font-semibold">{message}</p>
		</motion.div>
	);
}

// Toast Container Component
export function ToastContainer({
	toasts,
	onRemove,
}: {
	toasts: Array<ToastProps & { id: string }>;
	onRemove: (id: string) => void;
}) {
	return (
		<div className="fixed bottom-6 right-6 z-[100] space-y-3">
			<AnimatePresence>
				{toasts.map((toast) => (
					<Toast key={toast.id} {...toast} onClose={() => onRemove(toast.id)} />
				))}
			</AnimatePresence>
		</div>
	);
}
