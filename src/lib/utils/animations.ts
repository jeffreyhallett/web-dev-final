/**
 * Framer Motion Animation Variants
 * Centralized animation configurations for consistent, fun interactions
 */

import { Variants } from 'framer-motion';

// Basic fade and slide animations
export const fadeInUp: Variants = {
	initial: { opacity: 0, y: 20 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: -20 },
};

export const fadeIn: Variants = {
	initial: { opacity: 0 },
	animate: { opacity: 1 },
	exit: { opacity: 0 },
};

export const slideInRight: Variants = {
	initial: { opacity: 0, x: 50 },
	animate: { opacity: 1, x: 0 },
	exit: { opacity: 0, x: 50 },
};

export const slideInLeft: Variants = {
	initial: { opacity: 0, x: -50 },
	animate: { opacity: 1, x: 0 },
	exit: { opacity: 0, x: -50 },
};

export const slideInDown: Variants = {
	initial: { opacity: 0, y: -50 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: -50 },
};

// Scale animations
export const scaleIn: Variants = {
	initial: { scale: 0.8, opacity: 0 },
	animate: { scale: 1, opacity: 1 },
	exit: { scale: 0.8, opacity: 0 },
};

export const popIn: Variants = {
	initial: { scale: 0, opacity: 0 },
	animate: {
		scale: 1,
		opacity: 1,
		transition: {
			type: 'spring',
			stiffness: 500,
			damping: 25,
		},
	},
	exit: { scale: 0, opacity: 0 },
};

// Stagger containers
export const staggerContainer: Variants = {
	initial: {},
	animate: {
		transition: {
			staggerChildren: 0.1,
			delayChildren: 0.05,
		},
	},
	exit: {
		transition: {
			staggerChildren: 0.05,
			staggerDirection: -1,
		},
	},
};

export const staggerFast: Variants = {
	animate: {
		transition: {
			staggerChildren: 0.05,
		},
	},
};

// Hover animations
export const hoverLift: Variants = {
	rest: { y: 0, scale: 1 },
	hover: {
		y: -8,
		scale: 1.02,
		transition: {
			type: 'spring',
			stiffness: 400,
			damping: 15,
		},
	},
};

export const hoverScale: Variants = {
	rest: { scale: 1 },
	hover: {
		scale: 1.05,
		transition: {
			type: 'spring',
			stiffness: 400,
			damping: 15,
		},
	},
};

export const hoverGlow: Variants = {
	rest: {
		boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
	},
	hover: {
		boxShadow: '0 10px 30px rgba(157, 107, 255, 0.4)',
		transition: {
			duration: 0.3,
		},
	},
};

// Tap/Click animations
export const tap3D: Variants = {
	whileTap: { scale: 0.95, rotateX: 5 },
};

export const tapShrink: Variants = {
	whileTap: { scale: 0.95 },
};

// Continuous animations
export const floatAnimation: Variants = {
	animate: {
		y: [0, -10, 0],
		transition: {
			duration: 3,
			repeat: Infinity,
			ease: 'easeInOut',
		},
	},
};

export const pulseAnimation: Variants = {
	animate: {
		scale: [1, 1.05, 1],
		transition: {
			duration: 2,
			repeat: Infinity,
			ease: 'easeInOut',
		},
	},
};

export const rotateAnimation: Variants = {
	animate: {
		rotate: [0, 360],
		transition: {
			duration: 20,
			repeat: Infinity,
			ease: 'linear',
		},
	},
};

// Custom spring transitions
export const springTransition = {
	type: 'spring' as const,
	stiffness: 300,
	damping: 30,
};

export const bouncyTransition = {
	type: 'spring' as const,
	stiffness: 400,
	damping: 25,
};

export const smoothTransition = {
	type: 'spring' as const,
	stiffness: 200,
	damping: 20,
};

// Page transitions
export const pageTransition: Variants = {
	initial: { opacity: 0, y: 20 },
	animate: {
		opacity: 1,
		y: 0,
		transition: {
			duration: 0.4,
			ease: 'easeOut',
		},
	},
	exit: {
		opacity: 0,
		y: -20,
		transition: {
			duration: 0.3,
			ease: 'easeIn',
		},
	},
};

// Gradient shift animation
export const gradientShift = {
	animate: {
		backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
		transition: {
			duration: 5,
			repeat: Infinity,
			ease: 'linear',
		},
	},
};

// Card 3D tilt effect helper
export function calculate3DTilt(
	mouseX: number,
	mouseY: number,
	rect: DOMRect,
	intensity: number = 20
) {
	const x = (mouseX - rect.left) / rect.width;
	const y = (mouseY - rect.top) / rect.height;

	return {
		rotateX: (y - 0.5) * intensity,
		rotateY: (x - 0.5) * -intensity,
	};
}

// Confetti celebration animation config
export const confettiConfig = {
	particleCount: 100,
	spread: 70,
	origin: { y: 0.6 },
	colors: ['#FF6B9D', '#00D9FF', '#9D6BFF', '#FFB800', '#00D9A3'],
};

// Achievement unlock animation
export const achievementUnlock: Variants = {
	initial: { scale: 0, rotate: -180, opacity: 0 },
	animate: {
		scale: 1,
		rotate: 0,
		opacity: 1,
		transition: {
			type: 'spring',
			stiffness: 260,
			damping: 20,
		},
	},
	exit: {
		scale: 0,
		opacity: 0,
		transition: {
			duration: 0.2,
		},
	},
};

// Drag animation
export const dragAnimation: Variants = {
	drag: {
		scale: 1.05,
		rotate: 5,
		opacity: 0.8,
		boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
	},
};
