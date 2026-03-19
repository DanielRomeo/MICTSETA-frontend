'use client';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const ProtectedComponent = () => {
	const [data, setData] = useState<any>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	useEffect(() => {
		// Check if the user is authenticated (i.e., if the token is available in localStorage)
		const token = localStorage.getItem('access_token');
		if (!token) {
			router.push('/signin'); // Redirect to login if no token is found
			return;
		}

		// Fetch protected data from the backend
		const fetchData = async () => {
			try {
				const response = await axios.get('http://localhost:5000/protected', {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				// Set the fetched data to state
				setData(response.data);
			} catch (error) {
				console.error('Failed to fetch protected data:', error);
				setError(
					'Failed to fetch protected data. Please check your credentials or try again later.'
				);
			} finally {
				setIsLoading(false);
			}
		};

		fetchData();
	}, [router]);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (error) {
		return <div>{error}</div>;
	}

	return (
		<div>
			<h1>Protected Page</h1>
			<p>This page is protected and you are authorized to view it!</p>

			<h2>User Data:</h2>
			<pre>{JSON.stringify(data, null, 2)}</pre>
		</div>
	);
};

export default ProtectedComponent;
