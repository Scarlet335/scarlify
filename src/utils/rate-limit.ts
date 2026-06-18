import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextRequest, NextResponse } from 'next/server';

// Create a new ratelimiter
const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, '10 s'), // 10 requests per 10 seconds
    analytics: true,
});

export async function rateLimit(request: NextRequest, identifier?: string) {
    const ip = request.headers.get('x-forwarded-for') || 'anonymous';
    const id = identifier || ip;
    
    const { success, limit, reset, remaining } = await ratelimit.limit(id);
    
    return {
        success,
        limit,
        reset,
        remaining,
        headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': new Date(reset).toISOString(),
        }
    };
}

// Higher limits for authenticated users
export async function rateLimitAuth(request: NextRequest, userId: string) {
    return rateLimit(request, `auth-${userId}`);
}

// Stricter limits for public endpoints
export async function rateLimitPublic(request: NextRequest) {
    return rateLimit(request, `public-${request.headers.get('x-forwarded-for')}`);
}