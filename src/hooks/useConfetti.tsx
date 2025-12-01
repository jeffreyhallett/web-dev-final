'use client';

import { useCallback } from 'react';
import confetti from 'canvas-confetti';

export function useConfetti() {
	const celebrate = useCallback((options?: confetti.Options) => {
		confetti({
			particleCount: 100,
			spread: 70,
			origin: { y: 0.6 },
			colors: ['#FF6B9D', '#00D9FF', '#9D6BFF', '#FFB800', '#00D9A3'],
			...options,
		});
	}, []);

	const celebrateBig = useCallback(() => {
		const duration = 3 * 1000;
		const animationEnd = Date.now() + duration;
		const defaults = {
			startVelocity: 30,
			spread: 360,
			ticks: 60,
			zIndex: 100,
			colors: ['#FF6B9D', '#00D9FF', '#9D6BFF', '#FFB800', '#00D9A3'],
		};

		function randomInRange(min: number, max: number) {
			return Math.random() * (max - min) + min;
		}

		const interval: NodeJS.Timeout = setInterval(function () {
			const timeLeft = animationEnd - Date.now();

			if (timeLeft <= 0) {
				return clearInterval(interval);
			}

			const particleCount = 50 * (timeLeft / duration);

			confetti({
				...defaults,
				particleCount,
				origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
			});
			confetti({
				...defaults,
				particleCount,
				origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
			});
		}, 250);
	}, []);

	const celebrateAchievement = useCallback(() => {
		confetti({
			particleCount: 150,
			spread: 100,
			origin: { y: 0.5 },
			colors: ['#FFB800', '#FFA06B', '#FF6BD9'],
			shapes: ['star'],
			scalar: 1.2,
		});
	}, []);

	return {
		celebrate,
		celebrateBig,
		celebrateAchievement,
	};
}
