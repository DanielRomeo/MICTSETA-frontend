// src/app/api/courses/[id]/instructors/[userId]/route.ts
import { NextResponse } from 'next/server';

export async function PUT(request: Request, { params }: { params: { id: string; userId: string } }) {
	try {
		const authHeader = request.headers.get('Authorization');
		const courseId = params.id;
		const userId = params.userId;
		const body = await request.json();

		if (!courseId || !userId) {
			return NextResponse.json({ error: 'Course ID and User ID are required' }, { status: 400 });
		}

		const response = await fetch(`${process.env.NEXT_PRIVATE_API_URL}/api/courses/${courseId}/instructors/${userId}`, {
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
				{ error: `Error updating instructor role: ${errorMessage}` },
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
		const courseId = params.id;
		const userId = params.userId;

		if (!courseId || !userId) {
			return NextResponse.json({ error: 'Course ID and User ID are required' }, { status: 400 });
		}

		const response = await fetch(`${process.env.NEXT_PRIVATE_API_URL}/api/courses/${courseId}/instructors/${userId}`, {
			method: 'DELETE',
			headers: {
				Authorization: authHeader || '',
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			const errorMessage = await response.text();
			return NextResponse.json(
				{ error: `Error removing instructor from course: ${errorMessage}` },
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