import React from 'react';
import { Metadata } from 'next';
import CreateCourse from '../../_components/CreateCourse';
// import HomeComponent from './homeComponent';

const HomePage = () => {
	return (
		<div>
			<CreateCourse sidebarOpen={false} isMobile={false} />
		</div>
	);
};

export default HomePage;
