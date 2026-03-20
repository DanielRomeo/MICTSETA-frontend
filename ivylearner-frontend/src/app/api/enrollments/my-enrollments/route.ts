// src/app/api/enrollments/my-enrollments/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	try {
		const authHeader = request.headers.get('Authorization');

		const response = await fetch(`${process.env.NEXT_PRIVATE_API_URL}/api/enrollments/my-enrollments`, {
			headers: {
				Authorization: authHeader || '',
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			const errorMessage = await response.text();
			return NextResponse.json(
				{ error: `Error fetching enrollments: ${errorMessage}` },
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