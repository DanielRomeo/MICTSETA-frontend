// app/api/courses/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
	console.log('🚀 NEXT.JS ROUTE HANDLER CALLED');

	const authHeader = request.headers.get('Authorization');
	console.log('🔑 Authorization header:', authHeader);

	const body = await request.json();
	console.log('📦 Request body:', body);
	console.log('📊 organizationId type:', typeof body.organizationId);

	try {
		const response = await fetch(`${process.env.NEXT_PRIVATE_API_URL}/api/courses`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: authHeader || '',
			},
			body: JSON.stringify(body),
		});

		console.log('✅ Backend response status:', response.status);

		const data = await response.json();
		console.log('📥 Backend response data:', data);

		return NextResponse.json(data, { status: response.status });
	} catch (error) {
		console.error('❌ Error calling backend:', error);
		return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
	}
}
