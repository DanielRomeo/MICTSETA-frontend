import { Metadata } from 'next';
import SignupComponent from './signupComponent';

export const metadata: Metadata = {
	title: 'SignUp to IvyBrilliance',
	description: 'SignUp to access your IvyBrilliance.',
};

const SignupPage = () => {
	return (
		<div>
			<SignupComponent></SignupComponent>
		</div>
	);
};

export default SignupPage;
