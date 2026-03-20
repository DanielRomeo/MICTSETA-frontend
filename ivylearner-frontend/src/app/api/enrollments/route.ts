// src/app/api/enrollments/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
	try {
		const authHeader = request.headers.get('Authorization');
		const body = await request.json();

		const response = await fetch(`${process.env.NEXT_PRIVATE_API_URL}/api/enrollments`, {
			method: 'POST',
			headers: {
				Authorization: authHeader || '',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			const errorMessage = await response.text();
			return NextResponse.json(
				{ error: `Error enrolling in course: ${errorMessage}` },
				{ status: response.status }
			);
		}

		const data = await response.json();
		return NextResponse.json(data);
	} catch (error: any) {
		return NextResponse.json(
			{ error: 'Internal Server Error', details: error.message },
			{ status: 500 }
		);
	}
}