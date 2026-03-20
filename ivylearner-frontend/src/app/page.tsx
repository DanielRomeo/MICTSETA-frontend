import React from 'react';
import { Metadata } from 'next';
import HomeComponent from './(App)/home/homeComponent';
import MainFooter from './(App)/_components/MainFooter';

export const metadata: Metadata = {
	title: 'IvyBrilliance - Home',
	description: 'Welcome to IvyBrilliance, your ultimate destination for comprehensive educational resources and support. Our platform is designed to empower students, educators, and lifelong learners with a wide range of tools, materials, and guidance to enhance the learning experience. Whether you\'re looking for study guides, interactive lessons, or expert advice, IvyBrilliant is here to help you achieve your academic goals and unlock your full potential.',
};

const HomePage = () => {
	return (
		<div>
			<HomeComponent></HomeComponent>
			<MainFooter></MainFooter>
		</div>
	);
};

export default HomePage;
