'use client';
import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Application error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center max-w-md px-4">
                <div className="text-6xl mb-4">😢</div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Something went wrong!</h1>
                <p className="text-gray-600 mb-6">
                    {error.message || 'An unexpected error occurred. Please try again.'}
                </p>
                <button
                    onClick={reset}
                    className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90"
                >
                    Try again
                </button>
            </div>
        </div>
    );
}