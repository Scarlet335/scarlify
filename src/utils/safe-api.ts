import { NextResponse } from 'next/server';

export type ApiResponse<T = any> = {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
};

export function handleApiError(error: unknown, defaultMessage = 'Something went wrong'): NextResponse {
    console.error('API Error:', error);
    
    if (error instanceof Error) {
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
    
    return NextResponse.json(
        { success: false, error: defaultMessage },
        { status: 500 }
    );
}

export function successResponse<T>(data: T, message?: string): NextResponse {
    return NextResponse.json({
        success: true,
        data,
        message
    });
}

export function errorResponse(error: string, status = 400): NextResponse {
    return NextResponse.json({
        success: false,
        error
    }, { status });
}