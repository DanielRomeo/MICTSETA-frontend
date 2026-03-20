// src/app/api/courses/[id]/instructors/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
	try {
		const authHeader = request.headers.get('Authorization');
		const courseId = params.id;

		if (!courseId) {
			return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
		}

		const response = await fetch(`${process.env.NEXT_PRIVATE_API_URL}/api/courses/${courseId}/instructors`, {
			headers: {
				Authorization: authHeader || '',
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			const errorMessage = await response.text();
			return NextResponse.json(
				{ error: `Error fetching course instructors: ${errorMessage}` },
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

export async function POST(request: Request, { params }: { params: { id: string } }) {
	try {
		const authHeader = request.headers.get('Authorization');
		const courseId = params.id;
		const body = await request.json();

		if (!courseId) {
			return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
		}

		const response = await fetch(`${process.env.NEXT_PRIVATE_API_URL}/api/courses/${courseId}/instructors`, {
			method: 'POST',
			headers: {
				Authorization: authHeader || '',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(body),
		});

		if (!response.ok) {
			const errorMessage = await response.text();
			return NextResponse.json(
				{ error: `Error adding instructor to course: ${errorMessage}` },
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