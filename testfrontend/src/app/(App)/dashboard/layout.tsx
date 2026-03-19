'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/app/contexts/auth-context';
import DashboardLayout from './_components/DashboardLayout';

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
	const { user, isAuthenticated, isLoading } = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const [userRole, setUserRole] = useState<'student' | 'instructor'>('student');

	useEffect(() => {
		if (!isLoading && !isAuthenticated) {
			router.push('/signin');
		}
	}, [isAuthenticated, isLoading, router]);

	useEffect(() => {
		// TODO: Fetch user role from your API
		// For now, detect from URL or default to student
		if (pathname?.includes('/instructor')) {
			setUserRole('instructor');
		} else {
			setUserRole('student');
		}
	}, [pathname]);

	if (isLoading) {
		return (
			<div
				style={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					minHeight: '100vh',
					fontSize: '1.2rem',
					color: '#718096',
				}}
			>
				Loading dashboard...
			</div>
		);
	}

	if (!isAuthenticated) {
		return null;
	}

	return <DashboardLayout userRole={userRole}>{children}</DashboardLayout>;
}
