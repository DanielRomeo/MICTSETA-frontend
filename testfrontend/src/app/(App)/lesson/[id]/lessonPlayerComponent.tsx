'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container, Row, Col, Card, ListGroup, Button, Badge, Spinner, Alert, ProgressBar } from 'react-bootstrap';
import { FaPlay, FaCheck, FaLock, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
// import styles from './_styles/LessonPlayer.module.scss';
import styles from '../../_styles/lesson/lessonPlayerComponent.module.scss';
// import MainNavbar from '../../components/MainNavbar';
import ModernNavbar from '../../_components/MainNavbar';

const LessonPlayerPage = () => {
    const { id } = useParams();
    const router = useRouter();
    const [currentLesson, setCurrentLesson] = useState<any>(null);
    const [allLessons, setAllLessons] = useState<any[]>([]);
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [watchedPercentage, setWatchedPercentage] = useState(0);
    const [isEnrolled, setIsEnrolled] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/signin');
            return;
        }
        fetchLessonData();
    }, [id]);

    const fetchLessonData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('access_token');

            // Fetch current lesson
            const lessonRes = await fetch(`/api/lessons/${id}`, {
                headers: { 
                    'Authorization': `Bearer ${token || ''}`,
                },
            });
            
            if (!lessonRes.ok) throw new Error('Failed to fetch lesson');
            const lessonData = await lessonRes.json();
            const lesson = lessonData.data || lessonData;
            setCurrentLesson(lesson);

            // Fetch course details
            const courseRes = await fetch(`/api/courses/${lesson.courseId}`, {
                headers: { 
                    'Authorization': `Bearer ${token || ''}`,
                },
            });
            
            if (courseRes.ok) {
                const courseData = await courseRes.json();
                setCourse(courseData.data || courseData);
            }

            // Fetch all lessons for this course
            const lessonsRes = await fetch(`/api/lessons/course/${lesson.courseId}`, {
                headers: { 
                    'Authorization': `Bearer ${token || ''}`,
                },
            });
            
            if (lessonsRes.ok) {
                const lessonsData = await lessonsRes.json();
                setAllLessons(lessonsData.data || lessonsData || []);
            }

            // Check enrollment and progress
            // You can add enrollment check here
            setIsEnrolled(true); // For now, assume enrolled if they have access

        } catch (err: any) {
            setError('Failed to load lesson: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLessonClick = (lessonId: number) => {
        router.push(`/lesson/${lessonId}`);
    };

    const handleNextLesson = () => {
        const currentIndex = allLessons.findIndex(l => l.id === currentLesson?.id);
        if (currentIndex < allLessons.length - 1) {
            const nextLesson = allLessons[currentIndex + 1];
            router.push(`/lesson/${nextLesson.id}`);
        }
    };

    const handlePreviousLesson = () => {
        const currentIndex = allLessons.findIndex(l => l.id === currentLesson?.id);
        if (currentIndex > 0) {
            const prevLesson = allLessons[currentIndex - 1];
            router.push(`/lesson/${prevLesson.id}`);
        }
    };

    const markAsComplete = async () => {
        try {
            const token = localStorage.getItem('access_token');
            await fetch(`/api/lessons/${id}/progress`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token || ''}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    completed: true,
                    watchedPercentage: 100
                })
            });
            setWatchedPercentage(100);
            alert('Lesson marked as complete!');
        } catch (err) {
            console.error('Failed to mark lesson as complete:', err);
        }
    };

    if (loading) {
        return (
            <div className={styles.loadingContainer}>
                <Spinner animation="border" variant="success" />
                <p>Loading lesson...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Container className="mt-5">
                <Alert variant="danger">{error}</Alert>
                <Button onClick={() => router.push('/courses')}>Back to Courses</Button>
            </Container>
        );
    }

    const currentIndex = allLessons.findIndex(l => l.id === currentLesson?.id);
    const completedLessons = allLessons.filter((_, idx) => idx < currentIndex).length;
    const courseProgress = (completedLessons / allLessons.length) * 100;

    return (
        <div className={styles.lessonPlayerPage}>
            <ModernNavbar/>
            <Container fluid className={styles.playerContainer}>
                <Row className="g-0">
                    {/* Lessons Sidebar */}
                    <Col lg={4} xl={3} className={styles.sidebarCol}>
                        <div className={styles.sidebar}>
                            <div className={styles.sidebarHeader}>
                                <h5>{course?.title}</h5>
                                <div className={styles.progressSection}>
                                    <ProgressBar 
                                        now={courseProgress} 
                                        label={`${Math.round(courseProgress)}%`}
                                        variant="success"
                                        className={styles.progressBar}
                                    />
                                    <p className={styles.progressText}>
                                        {completedLessons} of {allLessons.length} lessons completed
                                    </p>
                                </div>
                            </div>

                            <ListGroup className={styles.lessonsList}>
                                {allLessons.map((lesson, index) => (
                                    <ListGroup.Item
                                        key={lesson.id}
                                        className={`${styles.lessonItem} ${lesson.id === currentLesson?.id ? styles.active : ''}`}
                                        onClick={() => handleLessonClick(lesson.id)}
                                    >
                                        <div className={styles.lessonNumber}>
                                            {index < currentIndex ? (
                                                <FaCheck className={styles.checkIcon} />
                                            ) : lesson.id === currentLesson?.id ? (
                                                <FaPlay className={styles.playIcon} />
                                            ) : (
                                                <span>{index + 1}</span>
                                            )}
                                        </div>
                                        <div className={styles.lessonInfo}>
                                            <h6>{lesson.title}</h6>
                                            <span className={styles.duration}>
                                                {lesson.durationMinutes || 0} min
                                            </span>
                                        </div>
                                        {lesson.isFreePreview && (
                                            <Badge bg="success" className={styles.previewBadge}>
                                                Free
                                            </Badge>
                                        )}
                                    </ListGroup.Item>
                                ))}
                            </ListGroup>
                        </div>
                    </Col>

                    {/* Video Player Area */}
                    <Col lg={8} xl={9} className={styles.playerCol}>
                        <div className={styles.videoSection}>
                            {currentLesson?.videoUrl ? (
                                <div className={styles.videoContainer}>
                                    <video
                                        key={currentLesson.id}
                                        controls
                                        className={styles.videoPlayer}
                                        onTimeUpdate={(e) => {
                                            const video = e.target as HTMLVideoElement;
                                            const percentage = (video.currentTime / video.duration) * 100;
                                            setWatchedPercentage(percentage);
                                        }}
                                    >
                                        <source src={currentLesson.videoUrl} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            ) : (
                                <div className={styles.noVideo}>
                                    <FaPlay size={80} />
                                    <p>No video available for this lesson</p>
                                </div>
                            )}

                            <div className={styles.lessonContent}>
                                <div className={styles.lessonHeader}>
                                    <div>
                                        <h2>{currentLesson?.title}</h2>
                                        <p className={styles.lessonMeta}>
                                            Lesson {currentIndex + 1} of {allLessons.length} • {currentLesson?.durationMinutes || 0} minutes
                                        </p>
                                    </div>
                                    <Button
                                        variant="success"
                                        onClick={markAsComplete}
                                        className={styles.completeBtn}
                                    >
                                        <FaCheck /> Mark as Complete
                                    </Button>
                                </div>

                                <div className={styles.navigation}>
                                    <Button
                                        variant="outline-secondary"
                                        onClick={handlePreviousLesson}
                                        disabled={currentIndex === 0}
                                        className={styles.navBtn}
                                    >
                                        <FaChevronLeft /> Previous Lesson
                                    </Button>
                                    <Button
                                        variant="success"
                                        onClick={handleNextLesson}
                                        disabled={currentIndex === allLessons.length - 1}
                                        className={styles.navBtn}
                                    >
                                        Next Lesson <FaChevronRight />
                                    </Button>
                                </div>

                                <Card className={styles.descriptionCard}>
                                    <Card.Body>
                                        <h5>About this lesson</h5>
                                        <p>{currentLesson?.contentText || 'No description available.'}</p>
                                    </Card.Body>
                                </Card>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default LessonPlayerPage;