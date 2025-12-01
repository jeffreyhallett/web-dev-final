'use client';

import { useState, useCallback } from 'react';
import { ToastProps } from '@/components/ui/Toast';

export function useToast() {
	const [toasts, setToasts] = useState<Array<ToastProps & { id: string }>>([]);

	const showToast = useCallback(
		(message: string, options?: Partial<Omit<ToastProps, 'message' | 'onClose'>>) => {
			const id = Date.now().toString();
			const toast = {
				id,
				message,
				onClose: () => {},
				...options,
			};
			setToasts((prev) => [...prev, toast]);
		},
		[]
	);

	const removeToast = useCallback((id: string) => {
		setToasts((prev) => prev.filter((toast) => toast.id !== id));
	}, []);

	const success = useCallback(
		(message: string) => showToast(message, { type: 'success' }),
		[showToast]
	);

	const error = useCallback(
		(message: string) => showToast(message, { type: 'error' }),
		[showToast]
	);

	const info = useCallback(
		(message: string) => showToast(message, { type: 'info' }),
		[showToast]
	);

	const xp = useCallback(
		(message: string) => showToast(message, { type: 'xp' }),
		[showToast]
	);

	return {
		toasts,
		removeToast,
		showToast,
		success,
		error,
		info,
		xp,
	};
}
