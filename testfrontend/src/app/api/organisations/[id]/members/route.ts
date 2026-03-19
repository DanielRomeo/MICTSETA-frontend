// app/api/organizations/[id]/members/route.ts
// For POST /api/organizations/{id}/members - Add member
// For GET /api/organizations/{id}/members - Get members
import { NextResponse } from 'next/server';

export async function POST(request: Request, { params }: { params: { id: string } }) {
	try {
		const { id } = params;
		const body = await request.json();
		const authHeader = request.headers.get('Authorization');
		const response = await fetch(
			`${process.env.NEXT_PRIVATE_API_URL}/api/organizations/${id}/members`,
			{
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: authHeader || '',
				},
				body: JSON.stringify(body),
			}
		);

		const data = await response.json();

		if (!response.ok) {
			return NextResponse.json(data, { status: response.status });
		}

		return NextResponse.json(data, { status: 201 });
	} catch (error) {
		console.error('Add member to organisation API error:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
	try {
		const { id } = params;
		const authHeader = request.headers.get('Authorization');
		const response = await fetch(
			`${process.env.NEXT_PRIVATE_API_URL}/api/organizations/${id}/members`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: authHeader || '',
				},
			}
		);

		const data = await response.json();

		if (!response.ok) {
			return NextResponse.json(data, { status: response.status });
		}

		return NextResponse.json(data, { status: 200 });
	} catch (error) {
		console.error('Get organisation members API error:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
