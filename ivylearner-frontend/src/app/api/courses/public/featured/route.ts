import { NextResponse } from 'next/server';

// Public endpoint - no auth required
// Returns top 3 courses ordered by enrollment count, with instructor info
export async function GET() {
	try {
		const apiBaseUrl = process.env.NEXT_PRIVATE_API_URL;
		if (!apiBaseUrl) {
			return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
		}

		const response = await fetch(`${apiBaseUrl}/api/courses/public/featured`, {
			headers: { 'Content-Type': 'application/json' },
		});

		if (!response.ok) {
			return NextResponse.json(
				{ error: 'Failed to fetch featured courses' },
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