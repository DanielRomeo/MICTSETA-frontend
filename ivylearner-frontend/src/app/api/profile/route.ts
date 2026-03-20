// src/app/api/profile/route.ts
import { NextResponse } from 'next/server';

// GET /api/profile  — returns logged-in user's profile (needs JWT)
export async function GET(request: Request) {
	try {
		const authHeader = request.headers.get('Authorization');

		const response = await fetch(`${process.env.NEXT_PRIVATE_API_URL}/api/profiles/me`, {
			headers: {
				Authorization: authHeader || '',
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			const errorMessage = await response.text();
			return NextResponse.json(
				{ error: `Error fetching profile: ${errorMessage}` },
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

// PATCH /api/profile  — update logged-in user's profile
export async function PATCH(request: Request) {
	try {
		const authHeader = request.headers.get('Authorization');
		const body = await request.json();

		const response = await fetch(`${process.env.NEXT_PRIVATE_API_URL}/api/profiles/me`, {
			method: 'PATCH',
			headers: {
				Authorization: authHeader || '',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			const errorMessage = await response.text();
			return NextResponse.json(
				{ error: `Error updating profile: ${errorMessage}` },
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