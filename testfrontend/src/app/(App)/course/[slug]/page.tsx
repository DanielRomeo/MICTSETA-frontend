import { Metadata } from 'next';
import { Container } from 'react-bootstrap';
import CourseDetailPage from './courseComponent';

export const metadata: Metadata = {
	title: 'Course',
	description: 'Course page',
};

const CoursePage = () => {
	return (
		<div>
			<CourseDetailPage></CourseDetailPage>
		</div>
	);
};

export default CoursePage;