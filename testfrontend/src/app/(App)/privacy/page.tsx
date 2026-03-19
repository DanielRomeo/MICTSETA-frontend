import { Metadata } from 'next';
import ModernNavbar from '../_components/MainNavbar';
import MainFooter from '../_components/MainFooter';
import PrivacyComponent from './privacyComponent';

export const metadata: Metadata = {
	title: 'Privacy Policy — IvyBrilliance',
	description: 'Read the IvyBrilliance Privacy Policy.',
};

const PrivacyPage = () => {
	return (
		<div>
			<ModernNavbar />
			<PrivacyComponent />
			<MainFooter />
		</div>
	);
};

export default PrivacyPage;
