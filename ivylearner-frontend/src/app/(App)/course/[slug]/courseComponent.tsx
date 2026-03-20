'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import {
	FaPlay,
	FaClock,
	FaUsers,
	FaLock,
	FaUnlock,
	FaCheckCircle,
	FaGlobe,
	FaAward,
	FaChalkboardTeacher,
	FaUser,
	FaBookOpen,
	FaTag,
} from 'react-icons/fa';
import Link from 'next/link';
import ModernNavbar from '../../_components/MainNavbar';
import styles from '../../_styles/course/courseComponent.module.scss';

const CourseDetailPage = () => {
	const { slug } = useParams();
	const router = useRouter();

	const [course, setCourse] = useState<any>(null);
	const [lessons, setLessons] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isEnrolled, setIsEnrolled] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [enrolling, setEnrolling] = useState(false);
	const [enrollmentCount, setEnrollmentCount] = useState(0);

	useEffect(() => {
		if (slug) fetchCourseData();
	}, [slug]);

	const fetchCourseData = async () => {
		try {
			setLoading(true);
			const token = localStorage.getItem('access_token');
			setIsLoggedIn(!!token);

			const authHeaders: Record<string, string> = {
				'Content-Type': 'application/json',
				...(token ? { Authorization: `Bearer ${token}` } : {}),
			};

			// 1. Fetch course by slug (instructors are already included in the response)
			const courseRes = await fetch(`/api/courses/slug/${slug}`, { headers: authHeaders });
			if (!courseRes.ok) throw new Error('Course not found');
			const courseData = await courseRes.json();
			const courseObj = courseData.data || courseData;
			setCourse(courseObj);

			const courseId = courseObj.id;

			// 2. Fetch lessons
			const lessonsRes = await fetch(`/api/lessons/course/${courseId}`, { headers: authHeaders });
			if (lessonsRes.ok) {
				const lessonsData = await lessonsRes.json();
				const sorted = (lessonsData.data || lessonsData || []).sort(
					(a: any, b: any) => (a.orderIndex ?? a.order ?? 0) - (b.orderIndex ?? b.order ?? 0)
				);
				setLessons(sorted);
			}

			// 3. Enrollment count
			const enrollRes = await fetch(`/api/enrollments/course/${courseId}`, { headers: authHeaders });
			if (enrollRes.ok) {
				const enrollData = await enrollRes.json();
				setEnrollmentCount((enrollData.data || enrollData || []).length);
			}

			// 4. Check if this user is enrolled
			if (token) {
				const myEnrollRes = await fetch('/api/enrollments/my-enrollments', { headers: authHeaders });
				if (myEnrollRes.ok) {
					const myEnrollData = await myEnrollRes.json();
					const enrollments = myEnrollData.data || myEnrollData || [];
					setIsEnrolled(enrollments.some((e: any) => e.courseId === courseId));
				}
			}
		} catch (err: any) {
			setError(err.message || 'Failed to load course');
		} finally {
			setLoading(false);
		}
	};

	const handleEnroll = async () => {
		const token = localStorage.getItem('access_token');
		if (!token) { router.push('/signin'); return; }

		if (isEnrolled) {
			const first = lessons[0];
			if (first) router.push(`/lesson/${first.id}`);
			return;
		}

		if (!course?.price || course.price === 0) {
			setEnrolling(true);
			try {
				const res = await fetch('/api/enrollments', {
					method: 'POST',
					headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
					body: JSON.stringify({ courseId: course.id }),
				});
				if (res.ok) {
					setIsEnrolled(true);
					setEnrollmentCount((c) => c + 1);
				} else {
					const d = await res.json();
					alert('Enrollment failed: ' + (d.error || 'Unknown error'));
				}
			} finally {
				setEnrolling(false);
			}
		} else {
			router.push(`/checkout/${course.id}`);
		}
	};

	const handleLessonClick = (lesson: any) => {
		if (lesson.isFreePreview) { router.push(`/lesson/${lesson.id}`); return; }
		if (!isLoggedIn) { router.push('/signin'); return; }
		if (isEnrolled) { router.push(`/lesson/${lesson.id}`); return; }
		// else: locked — do nothing (button is visually disabled)
	};

	const getLessonState = (lesson: any): 'free' | 'enrolled' | 'locked' => {
		if (lesson.isFreePreview) return 'free';
		if (isEnrolled) return 'enrolled';
		return 'locked';
	};

	const totalMinutes = lessons.reduce((s, l) => s + (l.durationMinutes || 0), 0);
	const isFree = !course?.price || course.price === 0;
	const instructors: any[] = course?.instructors || [];
	const tags: string[] = (() => {
		try { return JSON.parse(course?.tags || '[]'); } catch { return []; }
	})();

	if (loading) return (
		<div className={styles.loadingContainer}>
			<ModernNavbar />
			<div className={styles.loadingBody}>
				<Spinner animation="border" variant="success" />
				<p>Loading course…</p>
			</div>
		</div>
	);

	if (error || !course) return (
		<div>
			<ModernNavbar />
			<Container className="mt-5">
				<Alert variant="danger">{error || 'Course not found'}</Alert>
				<button className={styles.backBtn} onClick={() => router.push('/courses')}>← Back to Courses</button>
			</Container>
		</div>
	);

	return (
		<div className={styles.courseDetailPage}>
			<ModernNavbar />

			{/* ── HERO ─────────────────────────────────────────── */}
			<div className={styles.hero}>
				{course.thumbnailUrl && (
					<div className={styles.heroBg} style={{ backgroundImage: `url(${course.thumbnailUrl})` }} />
				)}
				<div className={styles.heroOverlay} />
				<Container className={styles.heroContent}>
					<Row className="align-items-center gy-4">
						<Col lg={7}>
							{/* Tags */}
							{tags.length > 0 && (
								<div className={styles.heroTags}>
									{tags.map((t, i) => <span key={i} className={styles.heroTag}>{t}</span>)}
								</div>
							)}

							<h1 className={styles.heroTitle}>{course.title}</h1>
							<p className={styles.heroSubtitle}>{course.shortDescription || course.description}</p>

							{/* Meta row */}
							<div className={styles.heroMeta}>
								<span><FaUsers /> {enrollmentCount.toLocaleString()} students</span>
								{totalMinutes > 0 && (
									<span><FaClock /> {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</span>
								)}
								{course.language && <span><FaGlobe /> {course.language}</span>}
								{course.certificateAvailable && <span><FaAward /> Certificate</span>}
								{isEnrolled && <span className={styles.enrolledPill}><FaCheckCircle /> Enrolled</span>}
							</div>

							{/* Instructors row */}
							{instructors.length > 0 && (
								<div className={styles.heroInstructors}>
									<span className={styles.instructorLabel}><FaChalkboardTeacher /> Instructors:</span>
									<div className={styles.instructorAvatars}>
										{instructors.map((inst, i) => (
											<div key={i} className={styles.instructorChip}>
												<div className={styles.instructorAvatar}>
													{inst.profilePictureUrl ? (
														<img src={inst.profilePictureUrl} alt={inst.firstName} />
													) : (
														<FaUser />
													)}
												</div>
												<span>{inst.firstName} {inst.lastName}</span>
											</div>
										))}
									</div>
								</div>
							)}
						</Col>

						{/* Enroll card */}
						<Col lg={5}>
							<div className={styles.enrollCard}>
								{course.thumbnailUrl && (
									<div className={styles.enrollCardThumb}>
										<img src={course.thumbnailUrl} alt={course.title} />
										<div className={styles.thumbPlayIcon}><FaPlay /></div>
									</div>
								)}
								<div className={styles.enrollCardBody}>
									<div className={styles.priceRow}>
										<span className={styles.price}>{isFree ? 'Free' : `R${course.price}`}</span>
									</div>

									<button
										className={`${styles.enrollBtn} ${isEnrolled ? styles.enrolledBtn : ''}`}
										onClick={handleEnroll}
										disabled={enrolling}
									>
										{enrolling ? 'Enrolling…'
											: isEnrolled ? '▶ Continue Learning'
											: isFree ? 'Enroll for Free'
											: 'Buy Now'}
									</button>

									<ul className={styles.enrollMeta}>
										<li><FaBookOpen /> {lessons.length} lessons</li>
										{totalMinutes > 0 && <li><FaClock /> {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m total</li>}
										{course.language && <li><FaGlobe /> {course.language}</li>}
										{course.certificateAvailable && <li><FaAward /> Certificate of completion</li>}
									</ul>
								</div>
							</div>
						</Col>
					</Row>
				</Container>
			</div>

			{/* ── BODY ──────────────────────────────────────────── */}
			<div className={styles.body}>
				<Container>
					<Row className="gy-4">
						{/* Left: description + instructors bio + lessons */}
						<Col lg={8}>

							{/* Description */}
							{course.description && (
								<section className={styles.section}>
									<h2 className={styles.sectionTitle}>About this course</h2>
									<p className={styles.descriptionText}>{course.description}</p>
								</section>
							)}

							{/* Instructor bios */}
							{instructors.length > 0 && (
								<section className={styles.section}>
									<h2 className={styles.sectionTitle}>Your Instructor{instructors.length > 1 ? 's' : ''}</h2>
									<div className={styles.instructorCards}>
										{instructors.map((inst, i) => (
											<div key={i} className={styles.instructorCard}>
												<div className={styles.instructorCardAvatar}>
													{inst.profilePictureUrl
														? <img src={inst.profilePictureUrl} alt={inst.firstName} />
														: <FaUser />}
												</div>
												<div className={styles.instructorCardInfo}>
													<h4>{inst.firstName} {inst.lastName}</h4>
													<p className={styles.instructorRole}>{inst.instructorRole === 'primary' ? 'Lead Instructor' : inst.instructorRole === 'ta' ? 'Teaching Assistant' : 'Co-Instructor'}</p>
													{inst.bio && <p className={styles.instructorBio}>{inst.bio}</p>}
												</div>
											</div>
										))}
									</div>
								</section>
							)}

							{/* Lessons */}
							<section className={styles.section}>
								<h2 className={styles.sectionTitle}>
									Course Content
									<span className={styles.lessonCount}>{lessons.length} lessons</span>
								</h2>

								{lessons.length === 0 ? (
									<p className={styles.noLessons}>No lessons available yet.</p>
								) : (
									<div className={styles.lessonList}>
										{lessons.map((lesson, i) => {
											const state = getLessonState(lesson);
											const clickable = state !== 'locked';
											return (
												<div
													key={lesson.id}
													className={`${styles.lessonRow} ${clickable ? styles.lessonClickable : styles.lessonLocked}`}
													onClick={clickable ? () => handleLessonClick(lesson) : undefined}
												>
													<div className={styles.lessonIndex}>{i + 1}</div>
													<div className={styles.lessonMeta}>
														<span className={styles.lessonTitle}>{lesson.title}</span>
														{lesson.durationMinutes > 0 && (
															<span className={styles.lessonDuration}>
																<FaClock /> {lesson.durationMinutes}m
															</span>
														)}
													</div>
													<div className={styles.lessonState}>
														{state === 'free' && (
															<span className={styles.freePreviewPill}>
																<FaUnlock /> Free Preview
															</span>
														)}
														{state === 'enrolled' && (
															<span className={styles.playPill}>
																<FaPlay />
															</span>
														)}
														{state === 'locked' && (
															<span className={styles.lockPill}>
																<FaLock />
															</span>
														)}
													</div>
												</div>
											);
										})}
									</div>
								)}

								{/* Not enrolled CTA under lessons */}
								{!isEnrolled && (
									<div className={styles.lessonCta}>
										{!isLoggedIn
											? <><p>Sign in to unlock all lessons.</p><Link href="/signin" className={styles.ctaLink}>Sign In</Link></>
											: <><p>Enroll to access all lessons.</p><button className={styles.enrollBtn} onClick={handleEnroll}>{isFree ? 'Enroll for Free' : `Buy for R${course.price}`}</button></>
										}
									</div>
								)}
							</section>
						</Col>

						{/* Right: tags + course info sidebar */}
						<Col lg={4}>
							<div className={styles.sidebar}>
								{tags.length > 0 && (
									<div className={styles.sidebarCard}>
										<h5><FaTag /> Tags</h5>
										<div className={styles.tagList}>
											{tags.map((t, i) => <span key={i} className={styles.sidebarTag}>{t}</span>)}
										</div>
									</div>
								)}

								<div className={styles.sidebarCard}>
									<h5>Course Info</h5>
									<ul className={styles.infoList}>
										{course.level && <li><strong>Level:</strong> {course.level}</li>}
										{course.durationWeeks && <li><strong>Duration:</strong> {course.durationWeeks} weeks</li>}
										{course.language && <li><strong>Language:</strong> {course.language}</li>}
										<li><strong>Lessons:</strong> {lessons.length}</li>
										<li><strong>Students:</strong> {enrollmentCount.toLocaleString()}</li>
										{course.certificateAvailable && <li><FaAward /> Certificate included</li>}
									</ul>
								</div>
							</div>
						</Col>
					</Row>
				</Container>
			</div>
		</div>
	);
};

export default CourseDetailPage;