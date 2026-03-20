// app/api/organizations/route.ts
// For POST /api/organizations - Create organization
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
	try {
		const body = await request.json();
		const authHeader = request.headers.get('Authorization');
		const response = await fetch(`${process.env.NEXT_PRIVATE_API_URL}/api/organizations`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: authHeader || '',
			},
			body: JSON.stringify(body),
		});

		const data = await response.json();

		if (!response.ok) {
			return NextResponse.json(data, { status: response.status });
		}

		return NextResponse.json(data, { status: 201 });
	} catch (error) {
		console.error('Create organisation API error:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
