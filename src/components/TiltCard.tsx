'use client';
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface TiltCardProps {
    children: React.ReactNode;
    className?: string;
    glare?: boolean;
}

export default function TiltCard({ children, className = '', glare = false }: TiltCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const [rotate, setRotate] = useState({ x: 0, y: 0 });
    const [glarePosition, setGlarePosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
        const y = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
        setRotate({ x, y });
        if (glare) {
            setGlarePosition({
                x: ((e.clientX - rect.left) / rect.width) * 100,
                y: ((e.clientY - rect.top) / rect.height) * 100,
            });
        }
    };

    const handleMouseLeave = () => {
        setRotate({ x: 0, y: 0 });
    };

    return (
        <motion.div
            ref={ref}
            animate={{ rotateX: rotate.x, rotateY: rotate.y }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={`relative ${className}`}
            style={{ transformStyle: 'preserve-3d' }}
        >
            {children}
            {glare && (
                <div
                    className="absolute inset-0 pointer-events-none rounded-inherit opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                        background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 80%)`,
                    }}
                />
            )}
        </motion.div>
    );
}