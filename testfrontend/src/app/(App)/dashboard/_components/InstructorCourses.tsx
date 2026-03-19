'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Row, Col, Card, Button, Badge, Form, InputGroup, Alert, Spinner } from 'react-bootstrap';
import {
	FaPlus,
	FaEdit,
	FaTrash,
	FaUsers,
	FaDollarSign,
	FaEye,
	FaSearch,
	FaChartLine,
	FaClock,
	FaChevronLeft,
	FaChevronRight,
} from 'react-icons/fa';
import styles from '../_styles/InstructorCourses.module.scss';

const ITEMS_PER_PAGE = 6;

interface InstructorCoursesProps {
	sidebarOpen?: boolean;
	isMobile?: boolean;
}

const InstructorCourses = ({ sidebarOpen, isMobile }: InstructorCoursesProps) => {
	const router = useRouter();
	const [searchQuery, setSearchQuery] = useState('');
	const [filterStatus, setFilterStatus] = useState('all');
	const [courses, setCourses] = useState<any[]>([]);
	const [enrollments, setEnrollments] = useState<any[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);

	useEffect(() => {
		fetchCourses();
	}, []);

	const fetchCourses = async () => {
		try {
			setLoading(true);
			const token = localStorage.getItem('access_token');

			// Fetch instructor's courses
			const response = await fetch('/api/courses/my-courses', {
				headers: {
					Authorization: `Bearer ${token || ''}`,
				},
			});

			if (!response.ok) {
				throw new Error('Failed to fetch courses');
			}

			const data = await response.json();
			const coursesList = data.data || data || [];
			setCourses(coursesList);

			// Fetch all enrollments to calculate stats
			try {
				const enrollmentsRes = await fetch('/api/enrollments/my-enrollments', {
					headers: {
						Authorization: `Bearer ${token || ''}`,
					},
				});
				
				if (enrollmentsRes.ok) {
					const enrollData = await enrollmentsRes.json();
					setEnrollments(enrollData.data || enrollData || []);
				}
			} catch (err) {
				console.error('Error fetching enrollments:', err);
			}

		} catch (err) {
			console.error('Error fetching courses:', err);
			setError('Failed to load courses');
		} finally {
			setLoading(false);
		}
	};

	const handleCreateNew = () => {
		router.push('/dashboard/instructor/create-course');
	};

	const handleDelete = async (id: number) => {
		if (confirm('Are you sure you want to delete this course?')) {
			try {
				const token = localStorage.getItem('access_token');
				const response = await fetch(`/api/courses/${id}`, {
					method: 'DELETE',
					headers: {
						Authorization: `Bearer ${token || ''}`,
					},
				});

				if (response.ok) {
					setCourses(courses.filter((course) => course.id !== id));
					alert('Course deleted successfully!');
				} else {
					const errorData = await response.json();
					if (response.status === 403) {
						alert('You do not have permission to delete this course. Only the organization owner can delete courses.');
					} else {
						alert('Failed to delete course: ' + (errorData.error || 'Unknown error'));
					}
				}
			} catch (err: any) {
				console.error('Error deleting course:', err);
				alert('Failed to delete course');
			}
		}
	};

	// Filter courses
	const filteredCourses = courses.filter((course) => {
		const matchesSearch =
			course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			(course.category || '').toLowerCase().includes(searchQuery.toLowerCase());
		
		let matchesFilter = true;
		if (filterStatus === 'published') {
			matchesFilter = course.isPublished === true || course.status === 'published';
		} else if (filterStatus === 'draft') {
			matchesFilter = course.isPublished === false || course.status === 'draft';
		}
		
		return matchesSearch && matchesFilter;
	});

	// Pagination
	const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE);
	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
	const endIndex = startIndex + ITEMS_PER_PAGE;
	const currentCourses = filteredCourses.slice(startIndex, endIndex);

	// Reset to page 1 when filters change
	useEffect(() => {
		setCurrentPage(1);
	}, [searchQuery, filterStatus]);

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	// Calculate stats dynamically
	const getStudentCount = (courseId: number) => {
		return enrollments.filter(e => e.courseId === courseId).length;
	};

	const totalStudents = enrollments.length;
	const totalRevenue = courses.reduce((sum, course) => {
		const studentCount = getStudentCount(course.id);
		const coursePrice = course.price || 0;
		return sum + (studentCount * coursePrice);
	}, 0);

	const publishedCount = courses.filter(c => c.isPublished || c.status === 'published').length;
	const draftCount = courses.filter(c => !c.isPublished || c.status === 'draft').length;

	if (loading) {
		return (
			<div className={styles.loadingContainer}>
				<Spinner animation="border" variant="success" />
				<p>Loading your courses...</p>
			</div>
		);
	}

	return (
		<div
			className={`${styles.coursesPage} ${sidebarOpen && !isMobile ? styles.sidebarOpen : styles.sidebarClosed}`}
		>
			<div className={styles.header}>
				<div>
					<h1>My Courses</h1>
					<p>Manage and track your course performance</p>
				</div>
				<Button variant="primary" onClick={handleCreateNew} className={styles.createBtn}>
					<FaPlus /> Create New Course
				</Button>
			</div>

			{error && <Alert variant="danger">{error}</Alert>}

			{/* Stats Overview */}
			<Row className="g-4 mb-4">
				<Col md={4}>
					<Card className={styles.statCard}>
						<Card.Body>
							<div
								className={styles.statIcon}
								style={{
									background: 'linear-gradient(135deg, #00bf63 0%, #24570f 100%)',
								}}
							>
								<FaUsers />
							</div>
							<div className={styles.statContent}>
								<h3>{totalStudents}</h3>
								<p>Total Students</p>
							</div>
						</Card.Body>
					</Card>
				</Col>
				<Col md={4}>
					<Card className={styles.statCard}>
						<Card.Body>
							<div
								className={styles.statIcon}
								style={{
									background: 'linear-gradient(135deg, #5271ff 0%, #3451e6 100%)',
								}}
							>
								<FaDollarSign />
							</div>
							<div className={styles.statContent}>
								<h3>R{totalRevenue.toLocaleString()}</h3>
								<p>Total Revenue</p>
							</div>
						</Card.Body>
					</Card>
				</Col>
				<Col md={4}>
					<Card className={styles.statCard}>
						<Card.Body>
							<div
								className={styles.statIcon}
								style={{
									background: 'linear-gradient(135deg, #b9e185 0%, #8cc152 100%)',
								}}
							>
								<FaChartLine />
							</div>
							<div className={styles.statContent}>
								<h3>{courses.length}</h3>
								<p>Total Courses</p>
							</div>
						</Card.Body>
					</Card>
				</Col>
			</Row>

			{/* Filters and Search */}
			<Card className={styles.filterCard}>
				<Card.Body>
					<Row className="align-items-center">
						<Col md={6}>
							<InputGroup>
								<InputGroup.Text>
									<FaSearch />
								</InputGroup.Text>
								<Form.Control
									type="text"
									placeholder="Search courses..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									className={styles.searchInput}
								/>
							</InputGroup>
						</Col>
						<Col md={6}>
							<div className={styles.filterBtns}>
								<Button
									variant={filterStatus === 'all' ? 'success' : 'outline-secondary'}
									onClick={() => setFilterStatus('all')}
									className={styles.filterBtn}
								>
									All ({courses.length})
								</Button>
								<Button
									variant={filterStatus === 'published' ? 'success' : 'outline-secondary'}
									onClick={() => setFilterStatus('published')}
									className={styles.filterBtn}
								>
									Published ({publishedCount})
								</Button>
								<Button
									variant={filterStatus === 'draft' ? 'success' : 'outline-secondary'}
									onClick={() => setFilterStatus('draft')}
									className={styles.filterBtn}
								>
									Drafts ({draftCount})
								</Button>
							</div>
						</Col>
					</Row>
					<div className={styles.resultsInfo}>
						<p>
							Showing <strong>{currentCourses.length}</strong> of{' '}
							<strong>{filteredCourses.length}</strong> courses
						</p>
					</div>
				</Card.Body>
			</Card>

			{/* Courses Grid */}
			{currentCourses.length > 0 ? (
				<>
					<Row className="g-4">
						{currentCourses.map((course) => {
							const isFree = course.price === 0 || !course.price;
							const studentCount = getStudentCount(course.id);
							const revenue = studentCount * (course.price || 0);

							return (
								<Col key={course.id} md={6} lg={4}>
									<Card className={styles.courseCard}>
										<div className={styles.thumbnailContainer}>
											<img
												src={
													course.thumbnailUrl ||
													course.thumbnail_url ||
													'https://placehold.co/600x400/00bf63/white?text=No+Image'
												}
												alt={course.title}
												className={styles.thumbnail}
											/>
											<Badge
												className={`${styles.statusBadge} ${
													course.isPublished || course.status === 'published'
														? styles.published
														: styles.draft
												}`}
											>
												{course.isPublished || course.status === 'published'
													? 'Published'
													: 'Draft'}
											</Badge>
											<Badge
												className={`${styles.priceBadge} ${
													isFree ? styles.free : styles.paid
												}`}
											>
												{isFree ? 'Free' : `R${course.price}`}
											</Badge>
										</div>
										<Card.Body>
											<div className={styles.courseHeader}>
												<Badge className={styles.categoryBadge}>
													{course.category || 'Uncategorized'}
												</Badge>
												{course.durationWeeks && (
													<span className={styles.duration}>
														<FaClock /> {course.durationWeeks} weeks
													</span>
												)}
											</div>

											<h3 className={styles.courseTitle}>{course.title}</h3>

											<p className={styles.courseDescription}>
												{course.shortDescription || course.description
													? (course.shortDescription || course.description).substring(0, 80) + '...'
													: 'No description available'}
											</p>

											<div className={styles.courseStats}>
												<div className={styles.statItem}>
													<FaUsers />
													<span>{studentCount} students</span>
												</div>
											</div>

											{!isFree && (
												<div className={styles.revenue}>
													<FaDollarSign />
													<span>R{revenue.toLocaleString()} revenue</span>
												</div>
											)}

											<div className={styles.lastUpdated}>
												Last updated:{' '}
												{course.updatedAt || course.updated_at
													? new Date(
															course.updatedAt || course.updated_at
													  ).toLocaleDateString()
													: 'N/A'}
											</div>

											<div className={styles.actions}>
												<Button
													className={styles.editBtn}
													onClick={() =>
														router.push(
															`/dashboard/instructor/courses/${course.id}/edit`
														)
													}
												>
													<FaEdit /> Edit
												</Button>
												<Button
													className={styles.viewBtn}
													onClick={() =>
														router.push(`/course/${course.id}`)
													}
												>
													<FaEye /> View
												</Button>
												<Button
													className={styles.deleteBtn}
													onClick={() => handleDelete(course.id)}
												>
													<FaTrash />
												</Button>
											</div>
										</Card.Body>
									</Card>
								</Col>
							);
						})}
					</Row>

					{/* Pagination */}
					{totalPages > 1 && (
						<div className={styles.pagination}>
							<Button
								variant="outline-secondary"
								disabled={currentPage === 1}
								onClick={() => handlePageChange(currentPage - 1)}
								className={styles.paginationButton}
							>
								<FaChevronLeft size={16} />
								Previous
							</Button>

							<div className={styles.pageNumbers}>
								{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
									<Button
										key={page}
										variant={currentPage === page ? 'success' : 'outline-secondary'}
										onClick={() => handlePageChange(page)}
										className={styles.pageNumber}
									>
										{page}
									</Button>
								))}
							</div>

							<Button
								variant="outline-secondary"
								disabled={currentPage === totalPages}
								onClick={() => handlePageChange(currentPage + 1)}
								className={styles.paginationButton}
							>
								Next
								<FaChevronRight size={16} />
							</Button>
						</div>
					)}
				</>
			) : (
				<Card className={styles.emptyState}>
					<Card.Body className="text-center py-5">
						<FaChartLine size={64} style={{ color: '#00bf63', marginBottom: '1rem' }} />
						<h3>No courses found</h3>
						<p>
							{searchQuery || filterStatus !== 'all'
								? 'Try adjusting your search or filter'
								: "You haven't created any courses yet"}
						</p>
						{!searchQuery && filterStatus === 'all' && (
							<Button
								variant="success"
								onClick={handleCreateNew}
								className="mt-3"
							>
								<FaPlus /> Create Your First Course
							</Button>
						)}
					</Card.Body>
				</Card>
			)}
		</div>
	);
};

export default InstructorCourses;