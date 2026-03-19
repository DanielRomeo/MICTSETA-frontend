import { Metadata } from 'next';
import SigninComponent from './signinComponent';

export const metadata: Metadata = {
	title: 'Signin to Dragon slayer',
	description: 'Sign in To dragon slayer',
};

const SigninPage = () => {
	return (
		<div>
			<SigninComponent></SigninComponent>
		</div>
	);
};

export default SigninPage;