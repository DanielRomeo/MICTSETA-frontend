// src/app/api/organizations/[id]/members/[userId]/route.ts
import { NextResponse } from 'next/server';

export async function PUT(request: Request, { params }: { params: { id: string; userId: string } }) {
	try {
		const authHeader = request.headers.get('Authorization');
		const orgId = params.id;
		const userId = params.userId;
		const body = await request.json();

		if (!orgId || !userId) {
			return NextResponse.json({ error: 'Organization ID and User ID are required' }, { status: 400 });
		}

		const response = await fetch(`${process.env.NEXT_PRIVATE_API_URL}/api/organizations/${orgId}/members/${userId}`, {
			method: 'PUT',
			headers: {
				Authorization: authHeader || '',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			const errorMessage = await response.text();
			return NextResponse.json(
				{ error: `Error updating member role: ${errorMessage}` },
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

export async function DELETE(request: Request, { params }: { params: { id: string; userId: string } }) {
	try {
		const authHeader = request.headers.get('Authorization');
		const orgId = params.id;
		const userId = params.userId;

		if (!orgId || !userId) {
			return NextResponse.json({ error: 'Organization ID and User ID are required' }, { status: 400 });
		}

		const response = await fetch(`${process.env.NEXT_PRIVATE_API_URL}/api/organizations/${orgId}/members/${userId}`, {
			method: 'DELETE',
			headers: {
				Authorization: authHeader || '',
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			const errorMessage = await response.text();
			return NextResponse.json(
				{ error: `Error removing member from organization: ${errorMessage}` },
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