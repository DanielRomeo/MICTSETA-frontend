import { Metadata } from 'next';
import { Container } from 'react-bootstrap';
import LessonPlayerPage from './lessonPlayerComponent';

export const metadata: Metadata = {
	title: 'Course',
	description: 'Course page',
};

const CoursePage = () => {
	return (
		<div>
			<LessonPlayerPage></LessonPlayerPage>
		</div>
	);
};

export default CoursePage;