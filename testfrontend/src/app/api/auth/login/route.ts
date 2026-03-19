// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
	try {
		const body = await request.json();
		// console.log('Login API request body:', body);
		const response = await fetch(`${process.env.NEXT_PRIVATE_API_URL}/api/users/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});

		const data = await response.json();

		if (!response.ok) {
			return NextResponse.json(data, { status: response.status });
		}

		return NextResponse.json(data, { status: 200 });
	} catch (error) {
		console.error('Login API error:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
