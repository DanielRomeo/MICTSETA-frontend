// app/api/courses/[id]/route.ts
import { NextResponse } from 'next/server';

export async function GET(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const authHeader = request.headers.get('Authorization');
		const response = await fetch(
			`${process.env.NEXT_PRIVATE_API_URL}/api/courses/${params.id}`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: authHeader || '',
				},
			}
		);

		const data = await response.json();
		console.log('Get course API response:', data);

		if (!response.ok) {
			return NextResponse.json(data, { status: response.status });
		}

		return NextResponse.json(data, { status: 200 });
	} catch (error) {
		console.error('Get course API error:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}

export async function PUT(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const authHeader = request.headers.get('Authorization');
		const body = await request.json();
		
		const response = await fetch(
			`${process.env.NEXT_PRIVATE_API_URL}/api/courses/${params.id}`,
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
		console.log('Update course API response:', data);

		if (!response.ok) {
			return NextResponse.json(data, { status: response.status });
		}

		return NextResponse.json(data, { status: 200 });
	} catch (error) {
		console.error('Update course API error:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}

export async function DELETE(
	request: Request,
	{ params }: { params: { id: string } }
) {
	try {
		const authHeader = request.headers.get('Authorization');
		
		const response = await fetch(
			`${process.env.NEXT_PRIVATE_API_URL}/api/courses/${params.id}`,
			{
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
					Authorization: authHeader || '',
				},
			}
		);

		const data = await response.json();
		console.log('Delete course API response:', data);

		if (!response.ok) {
			return NextResponse.json(data, { status: response.status });
		}

		return NextResponse.json(data, { status: 200 });
	} catch (error) {
		console.error('Delete course API error:', error);
		return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
	}
}