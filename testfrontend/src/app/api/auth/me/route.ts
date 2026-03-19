// app/api/auth/me/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	const authHeader = request.headers.get('Authorization');

	const response = await fetch(`${process.env.NEXT_PRIVATE_API_URL}/api/auth/me`, {
		headers: {
			Authorization: authHeader || '',
		},
	});

	const data = await response.json();
	return NextResponse.json(data);
}
