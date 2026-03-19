import { NextResponse } from 'next/server';

export async function GET(request: Request) {
	try {
		const authHeader = request.headers.get('Authorization');

		// Make the request to the backend API
		const response = await fetch(`${process.env.NEXT_PRIVATE_API_URL}/api/courses/my-courses`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: authHeader || '',
			},
		});

		if (!response.ok) {
			const errorData = await response.json();
			return NextResponse.json(errorData, { status: response.status });
		}

		// Parse the data from the backend response
		const data = await response.json();
		return NextResponse.json(data, { status: 200 });
	} catch (error: any) {
		console.error('Error fetching courses:', error);
		return NextResponse.json(
			{ message: 'Failed to fetch courses', error: error.message },
			{ status: 500 }
		);
	}
}
