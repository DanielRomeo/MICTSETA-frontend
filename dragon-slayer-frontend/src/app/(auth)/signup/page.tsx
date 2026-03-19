import { Metadata } from 'next';
import SignupComponent from './signupComponent';

export const metadata: Metadata = {
	title: 'Signin to Dragon slayer',
	description: 'Sign in To dragon slayer',
};

const SignupPage = () => {
	return (
		<div>
			<SignupComponent></SignupComponent>
		</div>
	);
};

export default SignupPage;