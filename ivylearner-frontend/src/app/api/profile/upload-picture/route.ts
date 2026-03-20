// src/app/api/profile/upload-picture/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
	try {
		const authHeader = request.headers.get('Authorization');
		const formData = await request.formData();
		const file = formData.get('file') as File;

		if (!file) {
			return NextResponse.json({ error: 'No file provided' }, { status: 400 });
		}

		// Upload to Cloudinary
		const cloudinaryFormData = new FormData();
		cloudinaryFormData.append('file', file);
		cloudinaryFormData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
		cloudinaryFormData.append('folder', 'ivylearner/profile-pictures');

		const cloudinaryRes = await fetch(
			`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
			{
				method: 'POST',
				body: cloudinaryFormData,
			}
		);

		if (!cloudinaryRes.ok) {
			const err = await cloudinaryRes.text();
			return NextResponse.json(
				{ error: `Cloudinary upload failed: ${err}` },
				{ status: 500 }
			);
		}

		const cloudinaryData = await cloudinaryRes.json();
		const profilePictureUrl = cloudinaryData.secure_url;

		// Now save the URL to the backend profile
		const profileRes = await fetch(`${process.env.NEXT_PRIVATE_API_URL}/api/profiles/me`, {
			method: 'PATCH',
			headers: {
				Authorization: authHeader || '',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ profilePictureUrl }),
		});

		if (!profileRes.ok) {
			const err = await profileRes.text();
			return NextResponse.json(
				{ error: `Profile update failed: ${err}` },
				{ status: profileRes.status }
			);
		}

		return NextResponse.json({ profilePictureUrl });
	} catch (error: any) {
		return NextResponse.json(
			{ error: 'Internal Server Error', details: error.message },
			{ status: 500 }
		);
	}
}