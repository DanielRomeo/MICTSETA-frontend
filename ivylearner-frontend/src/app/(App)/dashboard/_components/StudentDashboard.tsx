'use client';

import { useEffect, useState } from 'react';
import { Row, Col, Card, ProgressBar } from 'react-bootstrap';
import { FaBook, FaGraduationCap, FaClock, FaTrophy } from 'react-icons/fa';
import styles from '../_styles/StudentDashboard.module.scss';
import axios from 'axios';

const StudentDashboard = () => {
	const [stats, setStats] = useState({
		enrolledCourses: 0,
		completedCourses: 0,
		hoursLearned: 0,
		certificates: 0,
	});

	const [recentCourses, setRecentCourses] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchDashboardData();
	}, []);

	const fetchDashboardData = async () => {
		try {
			// Fetch enrollments
			const enrollmentsRes = await axios.get('/api/enrollments/my-enrollments');
			const enrollments = enrollmentsRes.data.data || [];

			setStats({
				enrolledCourses: enrollments.length,
				completedCourses: enrollments.filter((e: any) => e.completedAt).length,
				hoursLearned: Math.round(enrollments.length * 8.5), // Mock calculation
				certificates: enrollments.filter((e: any) => e.completedAt).length,
			});

			// Set recent courses (first 3)
			setRecentCourses(enrollments.slice(0, 3));
		} catch (error) {
			console.error('Error fetching dashboard data:', error);
		} finally {
			setLoading(false);
		}
	};

	const statCards = [
		{
			title: 'Enrolled Courses',
			value: stats.enrolledCourses,
			icon: <FaBook />,
			color: 'primary',
		},
		{
			title: 'Completed',
			value: stats.completedCourses,
			icon: <FaGraduationCap />,
			color: 'success',
		},
		{
			title: 'Hours Learned',
			value: stats.hoursLearned,
			icon: <FaClock />,
			color: 'info',
		},
		{
			title: 'Certificates',
			value: stats.certificates,
			icon: <FaTrophy />,
			color: 'warning',
		},
	];

	if (loading) {
		return <div className={styles.loading}>Loading dashboard...</div>;
	}

	return (
		<div className={styles.studentDashboard}>
			<div className={styles.header}>
				<h1>Welcome Back!</h1>
				<p>Continue your learning journey</p>
			</div>

			{/* Stats Cards */}
			<Row className="g-4 mb-4">
				{statCards.map((card, index) => (
					<Col key={index} lg={3} md={6}>
						<Card className={`${styles.statCard} ${styles[card.color]}`}>
							<Card.Body>
								<div className={styles.statIcon}>{card.icon}</div>
								<div className={styles.statContent}>
									<h3>{card.value}</h3>
									<p>{card.title}</p>
								</div>
							</Card.Body>
						</Card>
					</Col>
				))}
			</Row>

			{/* Continue Learning */}
			<div className={styles.section}>
				<div className={styles.sectionHeader}>
					<h2>Continue Learning</h2>
					<a href="/dashboard/my-courses" className={styles.viewAll}>
						View All →
					</a>
				</div>

				<Row className="g-4">
					{recentCourses.length > 0 ? (
						recentCourses.map((enrollment, index) => (
							<Col key={index} lg={4} md={6}>
								<Card className={styles.courseCard}>
									<div className={styles.courseImage}>
										<img
											src={`https://via.placeholder.com/400x200?text=Course+${enrollment.courseId}`}
											alt="Course"
										/>
									</div>
									<Card.Body>
										<h5>Course #{enrollment.courseId}</h5>
										<div className={styles.progressSection}>
											<div className={styles.progressHeader}>
												<span>Progress</span>
												<span className={styles.progressPercent}>
													{Math.round(enrollment.progressPercentage || 0)}
													%
												</span>
											</div>
											<ProgressBar
												now={enrollment.progressPercentage || 0}
												className={styles.progressBar}
											/>
										</div>
										<button className={styles.continueBtn}>
											Continue Learning
										</button>
									</Card.Body>
								</Card>
							</Col>
						))
					) : (
						<Col>
							<Card className={styles.emptyState}>
								<Card.Body className="text-center py-5">
									<FaBook size={48} className="mb-3 text-muted" />
									<h4>No Courses Yet</h4>
									<p>Start your learning journey by enrolling in a course</p>
									<a href="/courses" className={styles.browseBtn}>
										Browse Courses
									</a>
								</Card.Body>
							</Card>
						</Col>
					)}
				</Row>
			</div>

			{/* Learning Goals */}
			<div className={styles.section}>
				<h2>Learning Goals</h2>
				<Card className={styles.goalsCard}>
					<Card.Body>
						<div className={styles.goalItem}>
							<div className={styles.goalInfo}>
								<h5>Complete 5 courses this month</h5>
								<p>{stats.completedCourses}/5 completed</p>
							</div>
							<ProgressBar
								now={(stats.completedCourses / 5) * 100}
								className={styles.goalProgress}
							/>
						</div>
						<div className={styles.goalItem}>
							<div className={styles.goalInfo}>
								<h5>Study 20 hours this week</h5>
								<p>12/20 hours completed</p>
							</div>
							<ProgressBar now={60} className={styles.goalProgress} />
						</div>
					</Card.Body>
				</Card>
			</div>
		</div>
	);
};

export default StudentDashboard;
