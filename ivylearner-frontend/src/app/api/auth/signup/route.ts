// app/api/auth/signup/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
	try {
		const body = await request.json();

		const response = await fetch(`${process.env.NEXT_PRIVATE_API_URL}/api/users/create`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});

		const data = await response.json();
		return NextResponse.json(data, { status: response.status });
	} catch (error: any) {
		return NextResponse.json(
			{ message: 'Failed to connect to server', error: error.message },
			{ status: 500 }
		);
	}
}
