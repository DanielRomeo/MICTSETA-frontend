import './globals.scss';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Metadata } from 'next';


import { Montserrat } from 'next/font/google';
import { AuthProvider } from './contexts/auth-context';

const montserrat = Montserrat({
	subsets: ['latin'],
	weight: ['300'], // Light weight
});


export const metadata: Metadata = {
  title: {
    default: 'IvyBrilliance',
    template: '%s | IvyBrilliance',
  },
  description: 'IvyBrilliance – Learn without limits.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en">
			<body className={montserrat.className}>
				<AuthProvider>{children}</AuthProvider>
			</body>
		</html>
	);
}
