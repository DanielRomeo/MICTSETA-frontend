////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////// DOESNT WORK YET ///////////////////////////////
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
	const authHeader = request.headers.get('Authorization');

	const body = await request.json();
	console.log('body is ');
	console.log(body);

	const response = await fetch(`${process.env.NEXT_PRIVATE_API_URL}/api/courses/create`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: authHeader || '',
		},
		body: JSON.stringify(body),
	});

	const data = await response.json();
	return NextResponse.json(data);
}
