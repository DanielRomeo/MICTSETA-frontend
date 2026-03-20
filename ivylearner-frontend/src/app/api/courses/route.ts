// app/api/organisations/create/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
	const authHeader = request.headers.get('Authorization');
	console.log('🔑 Authorization header:', authHeader); // Check this
	console.log('🔑 Token preview:', authHeader?.substring(0, 20) + '...'); // First 20 chars

	const body = await request.json();
	console.log('body is:', body);
	console.log('organizationId type:', typeof body.organizationId); // Check if it's a string

	const response = await fetch(`${process.env.NEXT_PRIVATE_API_URL}/api/courses`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: authHeader || '',
		},
		body: JSON.stringify(body),
	});
    console.log('API response status:', response.status);

	const data = await response.json();
	return NextResponse.json(data);
}


export async function GET(request: Request) {
    console.log('Received GET request for courses');
    try {
        const authHeader = request.headers.get('Authorization');
        
        const response = await fetch(`${process.env.NEXT_PRIVATE_API_URL}/api/courses`, {
            headers: {
                Authorization: authHeader || '',
                'Content-Type': 'application/json',
            },
        });
            console.log('API response status:', response.status);

        
        if (!response.ok) {
            console.error('Error fetching courses:', response.status, await response.text());
            const errorMessage = await response.text();
            return NextResponse.json(
                { error: `Error fetching courses: ${errorMessage}` },
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