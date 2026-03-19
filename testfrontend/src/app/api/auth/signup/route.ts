import { NextResponse } from "next/server";

// app/api/auth/signup/route.ts
export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log('Signup body being sent:', body); // ← add this
        console.log('Backend URL:', process.env.NEXT_PRIVATE_API_URL); // ← and this

        const response = await fetch(`${process.env.NEXT_PRIVATE_API_URL}/api/users/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        console.log('Backend response:', response.status, data); // ← and this
        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error('Signup error:', error); // ← and this
        return NextResponse.json(
            { message: 'Failed to connect to server', error: error.message },
            { status: 500 }
        );
    }
}