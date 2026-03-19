import { Metadata } from 'next';
import ModernNavbar from '../_components/MainNavbar';
import MainFooter from '../_components/MainFooter';
import FaqComponent from './faqComponent';

export const metadata: Metadata = {
	title: 'Help Center — IvyLearner',
	description: 'Find answers to common questions about IvyLearner.',
};

const FaqPage = () => {
	return (
		<div>
			<ModernNavbar />
			<FaqComponent />
			<MainFooter />
		</div>
	);
};

export default FaqPage;
