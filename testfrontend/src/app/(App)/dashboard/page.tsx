'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/app/contexts/auth-context';
import DashboardLayout from './_components/DashboardLayout';
import StudentDashboard from './_components/StudentDashboard';
import InstructorDashboard from './_components/InstructorDashboard';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
	const { user, isAuthenticated, isLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push('/signin');
		}
	}, [isAuthenticated, isLoading, router]);

	if (isLoading) {
		return <div>Loading...</div>;
	}

	if (!user) {
		// console.log('No user found after loading');
		return null;
	}

	// Determine which dashboard to show based on user role
	const userRole = user.role === 'instructor' || user.role === 'admin' ? 'instructor' : 'student';

	if (isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<DashboardLayout userRole={userRole}>
			{userRole === 'student' ? <StudentDashboard /> : <InstructorDashboard />}
		</DashboardLayout>
	);
}
