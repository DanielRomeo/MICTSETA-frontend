import { Metadata } from 'next';
import { Container } from 'react-bootstrap';
import CoursesComponent from './coursesComponent';

export const metadata: Metadata = {
	title: 'Course',
	description: 'Course page',
};

const CoursePage = () => {
	return (
		<div>
			<CoursesComponent></CoursesComponent>
		</div>
	);
};

export default CoursePage;