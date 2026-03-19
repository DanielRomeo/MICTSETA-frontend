'use client';

import { useEffect, useState } from 'react';
import EditCourse from '../../../../_components/InstructorCoursesEdit';
// import { useAuth } from '@/app/contexts/auth-context';
// import DashboardLayout from './_components/DashboardLayout';
// import StudentDashboard from './_components/StudentDashboard';
// import InstructorDashboard from './_components/InstructorDashboard';
// import { useRouter } from 'next/navigation';
// import InstructorCourses from '../../_components/InstructorCourses';

export default function DashboardPage() {
	return (
		<div>
			{/* <InstructorCourses /> */}
            <EditCourse></EditCourse>
		</div>
	);
}
