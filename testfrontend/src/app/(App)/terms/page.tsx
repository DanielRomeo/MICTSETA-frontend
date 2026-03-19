import { Metadata } from 'next';
import ModernNavbar from '../_components/MainNavbar';
import MainFooter from '../_components/MainFooter';
import TermsComponent from './termsComponent';

export const metadata: Metadata = {
	title: 'Terms & Conditions — IvyLearner',
	description: 'Read the IvyLearner Terms and Conditions.',
};

const TermsPage = () => {
	return (
		<div>
			<ModernNavbar />
			<TermsComponent />
			<MainFooter />
		</div>
	);
};

export default TermsPage;
