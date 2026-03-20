// app/api/organizations/[id]/route.ts
// For GET, PUT, DELETE /api/organizations/{id}
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
	try {
		const { id } = params;
		const authHeader = request.headers.get('Authorization');
		const response = await fetch(
			`${process.env.NEXT_PRIVATE_API_URL}/api/organizations/${id}`,
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
		console.error('Get organisation by ID API error:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
	try {
		const { id } = params;
		const body = await request.json();
		const authHeader = request.headers.get('Authorization');
		const response = await fetch(
			`${process.env.NEXT_PRIVATE_API_URL}/api/organizations/${id}`,
			{
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: authHeader || '',
				},
				body: JSON.stringify(body),
			}
		);

		const data = await response.json();

		console.log('fetching the organisation by ID response:', response); // Debug log
		console.log('fetching the organisation by ID data:', data); // Debug log
		

		if (!response.ok) {
			return NextResponse.json(data, { status: response.status });
		}

		return NextResponse.json(data, { status: 200 });
	} catch (error) {
		console.error('Update organisation API error:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
	try {
		const { id } = params;
		const authHeader = request.headers.get('Authorization');
		const response = await fetch(
			`${process.env.NEXT_PRIVATE_API_URL}/api/organizations/${id}`,
			{
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					Authorization: authHeader || '',
				},
			}
		);

		if (!response.ok) {
			const data = await response.json();
			return NextResponse.json(data, { status: response.status });
		}

		return NextResponse.json({ message: 'Organisation deleted successfully' }, { status: 200 });
	} catch (error) {
		console.error('Delete organisation API error:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}
