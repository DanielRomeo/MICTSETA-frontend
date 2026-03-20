import { Metadata } from 'next';
import ProtectedComponent from './protectedComponent';

export const metadata: Metadata = {
	title: 'Signin to IvydaleFashion',
	description: 'Sign in or Login here to access your Ivydalefashion account.',
};

const SigninPage = () => {
	return (
		<div>
			<ProtectedComponent></ProtectedComponent>
			{/* <Footer></Footer> */}
		</div>
	);
};

export default SigninPage;
