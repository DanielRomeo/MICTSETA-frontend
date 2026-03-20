'use client';

import { useEffect, useState } from 'react';
import { Row, Col, Card, Badge, ProgressBar, Button, Spinner } from 'react-bootstrap';
import { FaBook, FaClock, FaPlay, FaCheckCircle } from 'react-icons/fa';
import styles from '../_styles/MyCourses.module.scss';
import { useRouter } from 'next/navigation';

const MyCourses = () => {
	const [enrollments, setEnrollments] = useState<any[]>([]);
	const [courses, setCourses] = useState<Map<number, any>>(new Map());
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState<'all' | 'in-progress' | 'completed'>('all');
	const router = useRouter();

	useEffect(() => {
		fetchEnrollments();
	}, []);

	const fetchEnrollments = async () => {
		try {
			const token = localStorage.getItem('access_token');
			const response = await fetch('/api/enrollments/my-enrollments', {
				headers: {
					'Authorization': `Bearer ${token || ''}`
				}
			});
			
			if (!response.ok) {
				throw new Error('Failed to fetch enrollments');
			}

			const data = await response.json();
			const enrollmentsList = data.data || data || [];
			setEnrollments(enrollmentsList);

			// Fetch course details for each enrollment
			const coursesMap = new Map();
			for (const enrollment of enrollmentsList) {
				try {
					const courseRes = await fetch(`/api/courses/${enrollment.courseId}`, {
						headers: {
							'Authorization': `Bearer ${token || ''}`
						}
					});
					
					if (courseRes.ok) {
						const courseData = await courseRes.json();
						coursesMap.set(enrollment.courseId, courseData.data || courseData);
					}
				} catch (err) {
					console.error(`Failed to fetch course ${enrollment.courseId}:`, err);
				}
			}
			setCourses(coursesMap);
		} catch (error) {
			console.error('Error fetching enrollments:', error);
		} finally {
			setLoading(false);
		}
	};

	const filteredCourses = enrollments.filter((enrollment) => {
		if (filter === 'all') return true;
		if (filter === 'completed') return enrollment.completedAt;
		if (filter === 'in-progress') return !enrollment.completedAt && (enrollment.progressPercentage > 0);
		return true;
	});

	const getStatusBadge = (enrollment: any) => {
		if (enrollment.completedAt) {
			return <Badge bg="success">Completed</Badge>;
		} else if (enrollment.progressPercentage > 0) {
			return <Badge bg="primary">In Progress</Badge>;
		} else {
			return <Badge bg="secondary">Not Started</Badge>;
		}
	};

	const handleContinueLearning = (enrollment: any) => {
		// Navigate to the course or first lesson
		router.push(`/course/${enrollment.courseId}`);
	};

	if (loading) {
		return (
			<div className={styles.loading}>
				<Spinner animation="border" variant="success" />
				<p>Loading your courses...</p>
			</div>
		);
	}

	return (
		<div className={styles.myCoursesPage}>
			<div className={styles.header}>
				<div>
					<h1>My Courses</h1>
					<p>Continue learning and track your progress</p>
				</div>

				<div className={styles.filterButtons}>
					<button
						className={filter === 'all' ? styles.active : ''}
						onClick={() => setFilter('all')}
					>
						All ({enrollments.length})
					</button>
					<button
						className={filter === 'in-progress' ? styles.active : ''}
						onClick={() => setFilter('in-progress')}
					>
						In Progress ({enrollments.filter((e) => !e.completedAt && e.progressPercentage > 0).length})
					</button>
					<button
						className={filter === 'completed' ? styles.active : ''}
						onClick={() => setFilter('completed')}
					>
						Completed ({enrollments.filter((e) => e.completedAt).length})
					</button>
				</div>
			</div>

			{filteredCourses.length > 0 ? (
				<Row className="g-4">
					{filteredCourses.map((enrollment, index) => {
						const course = courses.get(enrollment.courseId);
						return (
							<Col key={index} lg={4} md={6}>
								<Card className={styles.courseCard}>
									<div className={styles.courseImage}>
										{course?.thumbnailUrl ? (
											<img
												src={course.thumbnailUrl}
												alt={course.title || 'Course'}
											/>
										) : (
											<div className={styles.placeholderImage}>
												<FaBook size={60} />
											</div>
										)}
										<div className={styles.statusBadge}>
											{getStatusBadge(enrollment)}
										</div>
									</div>
									<Card.Body>
										<h5 className={styles.courseTitle}>
											{course?.title || `Course #${enrollment.courseId}`}
										</h5>

										<p className={styles.courseDescription}>
											{course?.shortDescription || course?.description?.substring(0, 100) || 'No description available'}
										</p>

										<div className={styles.courseStats}>
											<span>
												<FaClock /> {course?.durationWeeks ? `${course.durationWeeks} weeks` : 'Self-paced'}
											</span>
											<span>
												<FaBook /> {course?.lessonCount || '0'} lessons
											</span>
										</div>

										<div className={styles.progressSection}>
											<div className={styles.progressHeader}>
												<span>Progress</span>
												<span className={styles.progressPercent}>
													{Math.round(enrollment.progressPercentage || 0)}%
												</span>
											</div>
											<ProgressBar
												now={enrollment.progressPercentage || 0}
												className={styles.progressBar}
												variant="success"
											/>
										</div>

										<div className={styles.actions}>
											{enrollment.completedAt ? (
												<>
													<Button 
														className={styles.certificateBtn}
														onClick={() => alert('Certificate feature coming soon!')}
													>
														<FaCheckCircle /> View Certificate
													</Button>
													<Button
														variant="outline-primary"
														className={styles.reviewBtn}
														onClick={() => handleContinueLearning(enrollment)}
													>
														Review Again
													</Button>
												</>
											) : (
												<Button 
													className={styles.continueBtn}
													onClick={() => handleContinueLearning(enrollment)}
												>
													<FaPlay /> {enrollment.progressPercentage > 0 ? 'Continue Learning' : 'Start Course'}
												</Button>
											)}
										</div>
									</Card.Body>
								</Card>
							</Col>
						);
					})}
				</Row>
			) : (
				<Card className={styles.emptyState}>
					<Card.Body className="text-center py-5">
						<FaBook size={64} className="mb-3" style={{ color: '#00bf63' }} />
						<h3>No {filter !== 'all' && filter} courses found</h3>
						<p>
							{filter === 'all'
								? "You haven't enrolled in any courses yet"
								: `You don't have any ${filter.replace('-', ' ')} courses`}
						</p>
						<Button
							className={styles.browseBtn}
							onClick={() => router.push('/courses')}
						>
							Browse Courses
						</Button>
					</Card.Body>
				</Card>
			)}
		</div>
	);
};

export default MyCourses;