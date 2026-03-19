import { Metadata } from 'next';
import ModernNavbar from '../_components/MainNavbar';
import AboutComponent from './aboutComponent';
import MainFooter from '../_components/MainFooter';

export const metadata: Metadata = {
	title: 'About Us — IvyBrilliance',
	description: 'Learn about IvyBrilliance\'s mission, team, and values.',
};

const AboutPage = () => {
	return (
		<div>
			<ModernNavbar />
			<AboutComponent />
			<MainFooter />
		</div>
	);
};

export default AboutPage;
