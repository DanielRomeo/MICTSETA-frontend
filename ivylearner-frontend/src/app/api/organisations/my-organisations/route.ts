// app/api/organisations/my-organisations/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	try {
		const authHeader = request.headers.get('Authorization');
		const response = await fetch(
			`${process.env.NEXT_PRIVATE_API_URL}/api/organizations/my-organizations`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: authHeader || '',
				},
			}
		);

		const data = await response.json();
		console.log('Get my organisations API response:', data);

		if (!response.ok) {
			return NextResponse.json(data, { status: response.status });
		}

		return NextResponse.json(data, { status: 200 });
	} catch (error) {
		console.error('Get my organisations API error:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
