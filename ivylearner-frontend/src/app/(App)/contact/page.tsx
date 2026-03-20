import { Metadata } from 'next';
import ModernNavbar from '../_components/MainNavbar';
import MainFooter from '../_components/MainFooter';
import ContactComponent from './contactComponent';
export const metadata: Metadata = {
	title: 'Contact Us — IvyBrilliance',
	description: 'Get in touch with the IvyBrilliance team.',
};

const ContactPage = () => {
	return (
		<div>
			<ModernNavbar />
			<ContactComponent />
			<MainFooter />
		</div>
	);
};

export default ContactPage;
