// src/app/api/live-rooms/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        const body = await request.json();

        const res = await fetch(`${process.env.NEXT_PRIVATE_API_URL}/api/live-rooms`, {
            method: 'POST',
            headers: {
                Authorization: authHeader || '',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await res.json();
        console.log(data);
        if (!res.ok) return NextResponse.json(data, { status: res.status });
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}