import { NextResponse } from 'next/server';

// Public endpoint - no auth required
// Returns total number of published courses and total enrolled students
// export async function GET() {
// 	try {
// 		const apiBaseUrl = process.env.NEXT_PRIVATE_API_URL;
// 		if (!apiBaseUrl) {
// 			return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
// 		}

// 		const response = await fetch(`${apiBaseUrl}/api/courses/public/stats`, {
// 			headers: { 'Content-Type': 'application/json' },
// 		});

// 		if (!response.ok) {
// 			return NextResponse.json(
// 				{ error: 'Failed to fetch stats' },
// 				{ status: response.status }
// 			);
// 		}

// 		const data = await response.json();
// 		return NextResponse.json(data);
// 	} catch (error: any) {
// 		return NextResponse.json(
// 			{ error: 'Internal Server Error', details: error.message },
// 			{ status: 500 }
// 		);
// 	}
// }


export async function GET(request: Request) {
	try {
		const authHeader = request.headers.get('Authorization');

		// Make the request to the backend API
		const response = await fetch(`${process.env.NEXT_PRIVATE_API_URL}/api/courses/public/stats`, {
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
		console.error('Error fetching stats:', error);
		return NextResponse.json(
			{ message: 'Failed to fetch stats', error: error.message },
			{ status: 500 }
		);
	}
}
