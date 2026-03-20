import React from 'react';
import { Metadata } from 'next';
// import HomeComponent from './homeComponent';

export const metadata: Metadata = {
	title: 'Ivy Learner Home',
	description: 'IvyLearner Home',
};

const HomePage = () => {
	return (
		<div>
			{/* <HomeComponent></HomeComponent>
			 */}
			hello worls
		</div>
	);
};

export default HomePage;
