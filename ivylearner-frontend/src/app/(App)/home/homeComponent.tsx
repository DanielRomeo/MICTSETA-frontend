'use client';
import React, { useEffect, useState } from 'react';
import ModernNavbar from '../_components/MainNavbar';
import { Container, Navbar, Nav, Button, Row, Col, Card , Spinner} from 'react-bootstrap';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import styles from '../_styles/homeComponent.module.scss';
import ResponsiveImage from '../_components/ResponsiveImage';

interface FeaturedCourse {
	id: number;
	title: string;
	slug: string;
	shortDescription: string | null;
	thumbnailUrl: string | null;
	instructorFirstName: string | null;
	instructorLastName: string | null;
	enrollmentCount: number;
}

interface PublicStats {
	totalCourses: number;
	totalStudents: number;
}

export default function HomeComponent() {
	const router = useRouter();
	const [stats, setStats] = useState<PublicStats>({ totalCourses: 200, totalStudents: 50000 });
	const [featuredCourses, setFeaturedCourses] = useState<FeaturedCourse[]>([]);
	const [loadingStats, setLoadingStats] = useState(true);
	const [loadingCourses, setLoadingCourses] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Animation variants
	const fadeIn = {
		hidden: { opacity: 0, y: 20 },
		visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
	};

	const staggerChildren = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.2,
			},
		},
	};

	
	useEffect(() => {
		console.log('HomeComponent mounted, fetching data...');
		 fetchfeaturedCourses();
		 fetchStatistics();
	}, []);

	const fetchStatistics = async () => {
		try {
            setLoadingStats(true);
            const token = localStorage.getItem('access_token');

            // Fetch statistics 
            const stats = await fetch('/api/courses/public/stats', {
                headers: { 
                    'Authorization': `Bearer ${token || ''}`,
                },
            });
			// console.log('Stats response:', stats);

			if (!stats.ok) throw new Error('Failed to fetch statistics');
			const statsData = await stats.json();
			// console.log('Stats data:', statsData);


			setStats(statsData.body);
		} catch (err: any) {
			setError('Failed to load statistics: ' + err.message);
			console.error(err);
		} finally {
			setLoadingStats(false);
		}
	}
	const fetchfeaturedCourses = async () => {
		try {			setLoadingCourses(true);
			const token = localStorage.getItem('access_token');
			const response = await fetch('/api/courses/public/featured', {
				headers: { 
					'Authorization': `Bearer ${token || ''}`,
				},
			});
			if (!response.ok) throw new Error('Failed to fetch featured courses');
			const data = await response.json();
			console.log(data);
			setFeaturedCourses(Array.isArray(data) ? data : []);
		} catch (err: any) {
			setError('Failed to load featured courses: ' + err.message);
			console.error(err);
		} finally {
			setLoadingCourses(false);
		}
	}



	// Format numbers nicely
	const formatStat = (n: number): string => {
		if (n >= 1000) return `${Math.floor(n / 1000)}k+`;
		return `${n}+`;
	};

	return (
		<div className={styles.container}>
			
			<ModernNavbar></ModernNavbar>

			{/* Hero Section */}
			<section className={styles.heroSection}>
				<Container>
					<Row className="align-items-center">
						<Col lg={6}>
							<motion.div
								initial="hidden"
								animate="visible"
								variants={fadeIn}
								className={styles.heroContent}
							>
								<h1>
									Learning that puts <span className={styles.highlight}>you</span>{' '}
									first
								</h1>
								<p>
									Empower your future with personalized courses taught by expert
									instructors. Track your progress, connect with tutors, and learn
									at your own pace.
								</p>
								<div className={styles.heroCta}>
									<Button
										variant="success"
										size="lg"
										className={styles.primaryBtn}
										onClick={() => router.push('/courses')}
									>
										Explore Courses
									</Button>
									<Button
										variant="outline-light"
										size="lg"
										className={styles.secondaryBtn}
										onClick={() => router.push('/tutor')}
									>
										Become a Tutor
									</Button>
								</div>
								<div className={styles.statBadges}>
									<div className={styles.statItem}>
										<span className={styles.statNumber}>
											{/* {loadingStats ? '...' : formatStat(stats.totalCourses)} */}
										</span>
										<span className={styles.statLabel}>Courses</span>
									</div>
									<div className={styles.statItem}>
										<span className={styles.statNumber}>
											{/* {loadingStats ? '...' : formatStat(stats.totalStudents)} */}
										</span>
										<span className={styles.statLabel}>Students</span>
									</div>
									<div className={styles.statItem}>
										<span className={styles.statNumber}>96%</span>
										<span className={styles.statLabel}>Satisfaction</span>
									</div>
								</div>
							</motion.div>
						</Col>
						<Col lg={6}>
							<motion.div
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.8 }}
								className={styles.heroImageContainer}
							>
								<div className={styles.heroImage}>
									<ResponsiveImage
										src="/pictureOfTeacher.jpg"
										alt={`New Arrival`}
										height={400}
										width={100}
									/>
								</div>
								
							</motion.div>
						</Col>
					</Row>
				</Container>
			</section>

			{/* Featured Courses Section */}
			<section className={styles.featuredSection}>
				<Container>
					<motion.div
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, amount: 0.2 }}
						variants={fadeIn}
						className={styles.sectionHeader}
					>
						<h2>Featured Courses</h2>
						<p>Start your learning journey with our most popular courses</p>
					</motion.div>

					<motion.div
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, amount: 0.2 }}
						variants={staggerChildren}
					>
						<Row className="g-4">
							
							{loadingCourses
								? 
								 <div className={styles.loadingContainer}>
									<Spinner animation="border" variant="primary" />
								</div> :<></>
							}
							{
							 !loadingCourses && featuredCourses.length > 0 ?
								  featuredCourses.map((course) => (
									
										<Col md={4} key={course.id}>
											{/* <motion.div variants={fadeIn}> */}
												<Card className={styles.courseCard}>
													<div className={styles.courseImageContainer}>
														<ResponsiveImage
															src={course.thumbnailUrl || '/pictureOfTeacher.jpg'}
															alt={course.title}
															height={400}
															width={100}
														/>
														<div className={styles.courseOverlay}>
															<Button
																variant="light"
																className={styles.previewBtn}
																onClick={() =>
																	router.push(`/course/${course.slug || course.id}`)
																}
															>
																Preview
															</Button>
														</div>
													</div>
													<Card.Body>
														<div className={styles.courseRating}>
															<span className={styles.studentCount}>
																({(course.enrollmentCount || 0).toLocaleString()}{' '}
																students)
															</span>
														</div>
														<Card.Title>{course.title}</Card.Title>
														<Card.Text>
															Instructor:{' '}
															{course.instructorFirstName && course.instructorLastName
																? `${course.instructorFirstName} ${course.instructorLastName}`
																: 'IvyBrilliance Instructor'}
														</Card.Text>
														<div className={styles.cardFooter}>
															<Button
																variant="outline-success"
																className={styles.courseBtn}
																onClick={() =>
																	router.push(`/course/${course.slug || course.id}`)
																}
															>
																Learn More
															</Button>
														</div>
													</Card.Body>
												</Card>
											{/* </motion.div> */}
										</Col>
								  ))
								: // Fallback if no courses returned yet
								  <>No courses available</>
							}
						</Row>
					</motion.div>

					<div className={styles.viewAllContainer}>
						<Button
							variant="link"
							className={styles.viewAllBtn}
							onClick={() => router.push('/courses')}
						>
							View All Courses <span className={styles.arrowIcon}>→</span>
						</Button>
					</div>
				</Container>
			</section>

			{/* How It Works Section */}
			<section className={styles.howItWorksSection}>
				<Container>
					<motion.div
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, amount: 0.2 }}
						variants={fadeIn}
						className={styles.sectionHeader}
					>
						<h2>How IvyBrilliance Works</h2>
						<p>A simple process to start your learning journey</p>
					</motion.div>

					<motion.div
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, amount: 0.2 }}
						variants={staggerChildren}
						className={styles.stepsContainer}
					>
						<Row>
							{[
								{
									number: '01',
									title: 'Find Your Course',
									description:
										'Browse through our catalog of premium courses taught by industry experts.',
								},
								{
									number: '02',
									title: 'Learn at Your Pace',
									description:
										'Access video lectures, quizzes, and resources whenever and wherever you want.',
								},
								{
									number: '03',
									title: 'Track Progress',
									description:
										'Monitor your learning journey with detailed progress tracking.',
								},
								{
									number: '04',
									title: 'Get Certified',
									description:
										'Earn certificates that showcase your newly acquired skills to employers.',
								},
							].map((step, index) => (
								<Col md={3} key={index}>
									<motion.div variants={fadeIn} className={styles.stepCard}>
										<div className={styles.stepNumber}>{step.number}</div>
										<h3>{step.title}</h3>
										<p>{step.description}</p>
									</motion.div>
								</Col>
							))}
						</Row>
					</motion.div>
				</Container>
			</section>

			{/* Become a course instructor */}
			<section className={styles.becomeInstructorSection}>
				<Container>
					<Row className="align-items-center">
						<Col lg={6}>
							<motion.div
								initial={{ opacity: 0, x: -50 }}
								whileInView={{ opacity: 1, x: 0 }}
								viewport={{ once: true, amount: 0.2 }}
								transition={{ duration: 0.6 }}
								className={styles.instructorImageContainer}
							>
								<ResponsiveImage
									src="/classroom.jpg"
									alt={`New Arrival`}
									height={550}
									width={450}
								/>
							</motion.div>
						</Col>
						<Col lg={6}>
							<motion.div
								initial={{ opacity: 0, x: 50 }}
								whileInView={{ opacity: 1, x: 0 }}
								viewport={{ once: true, amount: 0.2 }}
								transition={{ duration: 0.6 }}
								className={styles.instructorContent}
							>
								<h2>Share Your Knowledge</h2>
								<h3>Become A Course Instructor</h3>
								<p>
									Join our community of expert instructors and share your
									knowledge with students worldwide. Create engaging courses,
									build your audience, and earn income while making a difference.
								</p>

								<div className={styles.instructorBenefits}>
									{[
										'Reach thousands of eager students',
										'Flexible schedule on your terms',
										'Competitive compensation',
										'Full support from our team',
									].map((benefit, index) => (
										<div key={index} className={styles.benefitItem}>
											<span className={styles.checkIcon}>✓</span>
											{benefit}
										</div>
									))}
								</div>

								<Button
									variant="success"
									size="lg"
									className={styles.instructorCta}
									onClick={() => router.push('/signup')}
								>
									Apply as Instructor
								</Button>
							</motion.div>
						</Col>
					</Row>
				</Container>
			</section>

			{/* Become a Tutor Section */}
			<section className={styles.becomeTutorSection}>
				<Container>
					<Row className="align-items-center">
						
						<Col lg={6}>
							<motion.div
								initial={{ opacity: 0, x: 50 }}
								whileInView={{ opacity: 1, x: 0 }}
								viewport={{ once: true, amount: 0.2 }}
								transition={{ duration: 0.6 }}
								className={styles.tutorContent}
							>
								<h2>Share Your Knowledge In Real Time</h2>
								<h3>Become a Tutor</h3>
								<p>
									Join us as a tutor and provide personalized, real-time support to students. Help them overcome challenges,
									 deepen their understanding, and achieve their learning goals through one-on-one sessions while earning competitive compensation and flexible scheduling.
								</p>

								<div className={styles.tutorBenefits}>
									{[
										'Make a direct impact on student success',
										'Flexible hours that fit your schedule',
										'Competitive pay for your expertise',
										'Supportive community of educators',
									].map((benefit, index) => (
										<div key={index} className={styles.benefitItem}>
											<span className={styles.checkIcon}>✓</span>
											{benefit}
										</div>
									))}
								</div>

								<Button
									variant="success"
									size="lg"
									className={styles.tutorCta}
									onClick={() => router.push('/tutor')}
								>
									Apply as Tutor
								</Button>
							</motion.div>
						</Col>
						<Col lg={6}>
							<motion.div
								initial={{ opacity: 0, x: -50 }}
								whileInView={{ opacity: 1, x: 0 }}
								viewport={{ once: true, amount: 0.2 }}
								transition={{ duration: 0.6 }}
								className={styles.tutorImageContainer}
							>
								<ResponsiveImage
									src="/teacher.png"
									alt={`New Arrival`}
									height={550}
									width={450}
								/>
							</motion.div>
						</Col>
					</Row>
				</Container>
			</section>

			{/* Universities & Companies Section */}
			<section className={styles.partnersSection}>
				<Container>
					<motion.div
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true, amount: 0.2 }}
						variants={fadeIn}
						className={styles.sectionHeader}
					>
						<h2>Trusted By Leading Organizations</h2>
					</motion.div>

					<motion.div
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						transition={{ duration: 0.8 }}
						className={styles.partnersLogo}
					>
						<Row className={`align-items-center ${styles.partnersLogoRow}`}>
							{[
								'econlogo8-removebg-preview.png',
								'mainlogo.png',
								'unisalogo8-removebg-preview.png',
							].map((logo, index) => (
								<Col key={index} xs={6} md={2} className="text-center">
									<ResponsiveImage
										className={styles.image}
										src={`/${logo}`}
										alt="Partner logo"
										width={120}
										height={60}
									/>
								</Col>
							))}
						</Row>
					</motion.div>
				</Container>
			</section>

			{/* CTA Section */}
			<section className={styles.ctaSection}>
				<Container>
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						whileInView={{ opacity: 1, scale: 1 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
						className={styles.ctaCard}
					>
						<h2>Ready to Start Your Learning Journey?</h2>
						<p>Join thousands of students already learning on IvyBrilliance</p>
						<div className={styles.ctaButtons}>
							<Button
								variant="light"
								size="lg"
								className={styles.ctaBtn}
								onClick={() => router.push('/courses')}
							>
								View All Courses
							</Button>
							<Button
								variant="success"
								size="lg"
								className={styles.ctaBtnPrimary}
								onClick={() => router.push('/signup')}
							>
								Sign Up Free
							</Button>
						</div>
					</motion.div>
				</Container>
			</section>

		</div>
	);
}

