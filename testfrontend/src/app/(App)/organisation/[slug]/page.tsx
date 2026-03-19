import { Metadata } from 'next';
import { Container } from 'react-bootstrap';
import OrganisationIdComponent from './organisationIdComponent';

export const metadata: Metadata = {
	title: 'Organisations — IvyBrilliance',
	description: 'Read the IvyBrilliance Privacy Policy.',
};

const OrganisationPage = () => {
	return (
		<div>
			<OrganisationIdComponent></OrganisationIdComponent>
		</div>
	);
};
export default OrganisationPage;
