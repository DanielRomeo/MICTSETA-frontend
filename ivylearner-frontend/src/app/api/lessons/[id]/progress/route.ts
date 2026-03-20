// src/app/api/lessons/[id]/progress/route.ts
import { NextResponse } from 'next/server';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
	try {
		const authHeader = request.headers.get('Authorization');
		const lessonId = params.id;
		const body = await request.json();

		if (!lessonId) {
			return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 });
		}

		const response = await fetch(`${process.env.NEXT_PRIVATE_API_URL}/api/lessons/${lessonId}/progress`, {
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
				{ error: `Error updating lesson progress: ${errorMessage}` },
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

export async function GET(request: Request, { params }: { params: { id: string } }) {
	try {
		const authHeader = request.headers.get('Authorization');
		const lessonId = params.id;

		if (!lessonId) {
			return NextResponse.json({ error: 'Lesson ID is required' }, { status: 400 });
		}

		const response = await fetch(`${process.env.NEXT_PRIVATE_API_URL}/api/lessons/${lessonId}/progress`, {
			headers: {
				Authorization: authHeader || '',
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			const errorMessage = await response.text();
			return NextResponse.json(
				{ error: `Error fetching lesson progress: ${errorMessage}` },
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