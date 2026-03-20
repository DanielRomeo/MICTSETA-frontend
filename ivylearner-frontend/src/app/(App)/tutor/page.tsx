import { Metadata } from 'next';
import ModernNavbar from '../_components/MainNavbar';
import MainFooter from '../_components/MainFooter';
import TutorComponent from './tutorComponent';


export const metadata: Metadata = {
	title: 'Tutoring — IvyBrilliance',
	description: 'Get A tutor to help you with your studies.',
};

const TutorPage = () => {
	return (
		<div>
			<ModernNavbar />
			<TutorComponent />
			{/* <MainFooter /> */}
		</div>
	);
};

export default TutorPage;
