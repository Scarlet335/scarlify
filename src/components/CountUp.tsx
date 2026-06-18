'use client';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

interface CountUpProps {
    end: number;
    duration?: number;
    suffix?: string;
    prefix?: string;
}

export default function CountUp({ end, duration = 2000, suffix = '', prefix = '' }: CountUpProps) {
    const [count, setCount] = useState(0);
    const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });

    useEffect(() => {
        if (inView) {
            let start = 0;
            const increment = end / (duration / 16);
            const timer = setInterval(() => {
                start += increment;
                if (start >= end) {
                    setCount(end);
                    clearInterval(timer);
                } else {
                    setCount(Math.floor(start));
                }
            }, 16);
            return () => clearInterval(timer);
        }
    }, [inView, end, duration]);

    return (
        <div ref={ref}>
            {prefix}{count.toLocaleString()}{suffix}
        </div>
    );
}