import { Metadata } from 'next';
import SignupComponent from './_signupComponent';

export const metadata: Metadata = {
	title: 'SignUp to Ivylearner',
	description: 'SignUp to access your Ivylearner account.',
};

const SignupPage = () => {
	return (
		<div>
			<SignupComponent></SignupComponent>
		</div>
	);
};

export default SignupPage;
