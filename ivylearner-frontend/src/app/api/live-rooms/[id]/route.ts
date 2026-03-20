// src/app/api/live-rooms/[id]/route.ts
import { NextResponse } from 'next/server';
export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const authHeader = request.headers.get('Authorization');
        const res = await fetch(`${process.env.NEXT_PRIVATE_API_URL}/api/live-rooms/${params.id}`, {
            headers: { Authorization: authHeader || '' },
        });
        const data = await res.json();
        if (!res.ok) return NextResponse.json(data, { status: res.status });
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}