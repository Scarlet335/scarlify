'use client';
import { motion } from 'framer-motion';

interface FloatingElementProps {
    children: React.ReactNode;
    delay?: number;
    duration?: number;
    amplitude?: number;
    className?: string;
}

export default function FloatingElement({ children, delay = 0, duration = 3, amplitude = 10, className = '' }: FloatingElementProps) {
    return (
        <motion.div
            animate={{
                y: [0, -amplitude, 0, amplitude, 0],
            }}
            transition={{
                duration: duration,
                delay: delay,
                repeat: Infinity,
                ease: 'easeInOut',
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}