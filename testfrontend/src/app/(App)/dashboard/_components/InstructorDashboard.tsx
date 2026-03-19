'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Row, Col, Card } from 'react-bootstrap';
import { FaChalkboardTeacher, FaUsers, FaDollarSign, FaStar, FaPlus } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import styles from '../_styles/InstructorDashboard.module.scss';
import axios from 'axios';

const InstructorDashboard = () => {
	// const router = useRouter();
	const [stats, setStats] = useState({
		totalCourses: 0,
		totalStudents: 0,
		totalRevenue: 0,
		avgRating: 0,
	});

	const [recentCourses, setRecentCourses] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchDashboardData();
	}, []);

	const fetchDashboardData = async () => {
		try {
			// TODO: Replace with actual API calls
			// Mock data for now
			setStats({
				totalCourses: 8,
				totalStudents: 342,
				totalRevenue: 15420,
				avgRating: 4.7,
			});

			setRecentCourses([
				{
					id: 1,
					title: 'React Masterclass',
					students: 145,
					revenue: 7250,
				},
				{
					id: 2,
					title: 'Advanced TypeScript',
					students: 98,
					revenue: 4900,
				},
				{
					id: 3,
					title: 'Node.js Backend Development',
					students: 99,
					revenue: 3270,
				},
			]);
		} catch (error) {
			console.error('Error fetching dashboard data:', error);
		} finally {
			setLoading(false);
		}
	};

	const statCards = [
		{
			title: 'Total Courses',
			value: stats.totalCourses,
			icon: <FaChalkboardTeacher />,
			color: 'primary',
		},
		{
			title: 'Total Students',
			value: stats.totalStudents,
			icon: <FaUsers />,
			color: 'success',
		},
		{
			title: 'Total Revenue',
			value: `$${stats.totalRevenue.toLocaleString()}`,
			icon: <FaDollarSign />,
			color: 'info',
		},
		{
			title: 'Avg Rating',
			value: stats.avgRating,
			icon: <FaStar />,
			color: 'warning',
		},
	];

	if (loading) {
		return <div className={styles.loading}>Loading dashboard...</div>;
	}

	return (
		<div className={styles.instructorDashboard}>
			<div className={styles.header}>
				<div>
					<h1>Instructor Dashboard</h1>
					<p>Manage your courses and track your performance</p>
				</div>
				<button className={styles.createBtn}>
					<FaPlus /> Create New Course
				</button>
			</div>

			{/* Stats Cards */}
			<Row className="g-4 mb-4">
				{statCards.map((card, index) => (
					<Col key={index} lg={6} md={6}>
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

			{/* Recent Courses Performance */}
			<div className={styles.section}>
				<div className={styles.sectionHeader}>
					<h2>Course Performance</h2>
					<a href="/dashboard/instructor/courses" className={styles.viewAll}>
						View All →
					</a>
				</div>

				<Card className={styles.performanceCard}>
					<Card.Body>
						<div className={styles.tableWrapper}>
							<table className={styles.performanceTable}>
								<thead>
									<tr>
										<th>Course</th>
										<th>Students</th>
										<th>Revenue</th>
										<th>Action</th>
									</tr>
								</thead>
								<tbody>
									{recentCourses.map((course) => (
										<tr key={course.id}>
											<td>
												<div className={styles.courseInfo}>
													<strong>{course.title}</strong>
												</div>
											</td>
											<td>
												<span className={styles.studentCount}>
													<FaUsers /> {course.students}
												</span>
											</td>
											<td>
												<span className={styles.revenue}>
													${course.revenue.toLocaleString()}
												</span>
											</td>
											<td>
												<button className={styles.manageBtn}>Manage</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</Card.Body>
				</Card>
			</div>

			{/* Recent Activity & Quick Actions */}
			<Row className="g-4">
				<Col lg={6}>
					<div className={styles.section}>
						<h2>Recent Activity</h2>
						<Card className={styles.activityCard}>
							<Card.Body>
								<div className={styles.activityItem}>
									<div className={styles.activityIcon}>
										<FaUsers />
									</div>
									<div className={styles.activityContent}>
										<strong>12 new students</strong> enrolled in React
										Masterclass
										<span className={styles.activityTime}>2 hours ago</span>
									</div>
								</div>
								<div className={styles.activityItem}>
									<div className={styles.activityIcon}>
										<FaStar />
									</div>
									<div className={styles.activityContent}>
										<strong>New 5-star review</strong> on Advanced TypeScript
										<span className={styles.activityTime}>5 hours ago</span>
									</div>
								</div>
								<div className={styles.activityItem}>
									<div className={styles.activityIcon}>
										<FaDollarSign />
									</div>
									<div className={styles.activityContent}>
										<strong>$850 earned</strong> this week
										<span className={styles.activityTime}>1 day ago</span>
									</div>
								</div>
							</Card.Body>
						</Card>
					</div>
				</Col>

				<Col lg={6}>
					<div className={styles.section}>
						<h2>Quick Actions</h2>
						<div className={styles.quickActions}>
							<button className={styles.actionCard}>
								<FaChalkboardTeacher size={32} />
								<span>Create Course</span>
							</button>
							<button className={styles.actionCard}>
								<FaPlus size={32} />
								<span>Add Lesson</span>
							</button>
							<button className={styles.actionCard}>
								<FaUsers size={32} />
								<span>View Students</span>
							</button>
							<button className={styles.actionCard}>
								<FaStar size={32} />
								<span>Reviews</span>
							</button>
						</div>
					</div>
				</Col>
			</Row>
		</div>
	);
};

export default InstructorDashboard;
