import { NextResponse } from 'next/server';

export async function GET(
	request: Request,
	{ params }: { params: { id: string } } // Extracting `id` from URL
) {
	try {
		console.log('Reached instructors API with ID:', params.id);

		if (!params.id) {
			return NextResponse.json({ error: 'Instructor ID is required' }, { status: 400 });
		}

		console.log('SOMETHING HAS STARTED');

		const apiBaseUrl = process.env.NEXT_PRIVATE_API_URL;
		if (!apiBaseUrl) {
			return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
		}

		// Forward request to backend
		const apiResponse = await fetch(`${apiBaseUrl}/api/instructors/${params.id}`, {
			headers: {
				Authorization: request.headers.get('Authorization') || '',
			},
		});

		if (!apiResponse.ok) {
			return NextResponse.json(
				{ error: `Error fetching instructor: ${await apiResponse.text()}` },
				{ status: apiResponse.status }
			);
		}

		return NextResponse.json(await apiResponse.json());
	} catch (error: any) {
		return NextResponse.json(
			{ error: 'Internal Server Error', details: error.message },
			{ status: 500 }
		);
	}
}
