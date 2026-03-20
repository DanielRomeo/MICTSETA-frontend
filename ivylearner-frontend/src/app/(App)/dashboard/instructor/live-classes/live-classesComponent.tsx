'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    FaVideo, FaBroadcastTower, FaSpinner, FaClock,
    FaBookOpen, FaCheckCircle, FaTimesCircle,
    FaExternalLinkAlt, FaPlus, FaHistory,
} from 'react-icons/fa';
import CreateLiveRoomModal from '../../../live/[roomId]/components/CreateLiveRoomModal';
// import styles from '../../../_styles/dashboard/liveClasses.module.scss';
import styles from '../../_styles/liveClassesComponent_.module.scss';


interface Course {
    id: number;
    title: string;
    thumbnail: string | null;
    publishStatus: string | null;
}

interface LiveRoom {
    id: number;
    title: string;
    courseId: number;
    status: 'active' | 'ended';
    createdAt: number;
}

export default function LiveClasses() {
    const router = useRouter();

    const [courses, setCourses] = useState<Course[]>([]);
    const [liveRooms, setLiveRooms] = useState<LiveRoom[]>([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

    const token = () => localStorage.getItem('access_token') || '';

    // ── Fetch instructor's courses from live-rooms/my-courses ──────
    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/live-rooms/my-courses', {
                    headers: { Authorization: `Bearer ${token()}` },
                });
                const data = await res.json();
                console.log('Fetched courses for live rooms:', data);
                const list: Course[] = Array.isArray(data) ? data : (data.data || []);
                setCourses(list);

                // Fetch rooms for each course
                if (list.length > 0) {
                    const allRooms: LiveRoom[] = [];
                    await Promise.all(
                        list.map(async (c) => {
                            const r = await fetch(`/api/live-rooms/course/${c.id}`, {
                                headers: { Authorization: `Bearer ${token()}` },
                            });
                            if (r.ok) {
                                const rd = await r.json();
                                const rooms: LiveRoom[] = Array.isArray(rd) ? rd : (rd.data || []);
                                allRooms.push(...rooms);
                            }
                        })
                    );
                    setLiveRooms(allRooms);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoadingCourses(false);
                setLoadingRooms(false);
            }
        })();
    }, []);

    const handleGoLive = (course: Course) => {
        setSelectedCourse(course);
        setShowModal(true);
    };

    const activeRooms = liveRooms.filter(r => r.status === 'active');
    const pastRooms = liveRooms.filter(r => r.status === 'ended').slice(-5).reverse();
    const isPublished = (c: Course) => c.publishStatus === 'published';

    return (
        <div className={styles.page}>

            {/* ── Page header ────────────────────────────────────── */}
            <div className={styles.pageHeader}>
                <div className={styles.headerIcon}><FaBroadcastTower /></div>
                <div>
                    <h1>Live Classes</h1>
                    <p>Host real-time sessions for your students</p>
                </div>
            </div>

            {/* ── Active session alert ───────────────────────────── */}
            {activeRooms.length > 0 && (
                <div className={styles.activeBanner}>
                    <div className={styles.activeDot} />
                    <span>
                        You have <strong>{activeRooms.length}</strong> session{activeRooms.length > 1 ? 's' : ''} running right now
                    </span>
                    <div className={styles.bannerActions}>
                        {activeRooms.map(room => (
                            <button
                                key={room.id}
                                className={styles.rejoinBtn}
                                onClick={() => router.push(`/live/${room.id}?mode=host`)}
                            >
                                <FaExternalLinkAlt /> Rejoin
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Courses ────────────────────────────────────────── */}
            <div className={styles.section}>
                <div className={styles.sectionHead}>
                    <h2><FaBookOpen /> Select a Course to Go Live</h2>
                    <span className={styles.courseCount}>{courses.length} course{courses.length !== 1 ? 's' : ''}</span>
                </div>

                {loadingCourses ? (
                    <div className={styles.centred}>
                        <FaSpinner className={styles.spinner} />
                        <span>Loading courses…</span>
                    </div>
                ) : courses.length === 0 ? (
                    <div className={styles.empty}>
                        <div className={styles.emptyIcon}><FaBookOpen /></div>
                        <h3>No courses found</h3>
                        <p>Create a course first before hosting a live session.</p>
                        <button className={styles.createBtn} onClick={() => router.push('/dashboard/createCourse')}>
                            <FaPlus /> Create a Course
                        </button>
                    </div>
                ) : (
                    <div className={styles.courseGrid}>
                        {courses.map(course => {
                            const activeRoom = activeRooms.find(r => r.courseId === course.id);
                            const published = isPublished(course);
                            return (
                                <div key={course.id} className={`${styles.courseCard} ${activeRoom ? styles.cardActive : ''}`}>
                                    {/* Thumbnail */}
                                    <div className={styles.thumb}>
                                        {course.thumbnail
                                            ? <img src={course.thumbnail} alt={course.title} />
                                            : <div className={styles.thumbPlaceholder}><FaBookOpen /></div>
                                        }
                                        {activeRoom && (
                                            <div className={styles.livePill}>
                                                <span className={styles.liveDot} /> LIVE
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className={styles.cardBody}>
                                        <span className={published ? styles.publishedBadge : styles.draftBadge}>
                                            {published
                                                ? <><FaCheckCircle /> Published</>
                                                : <><FaTimesCircle /> Draft</>}
                                        </span>
                                        <h3>{course.title}</h3>

                                        {activeRoom ? (
                                            <button
                                                className={styles.rejoinLiveBtn}
                                                onClick={() => router.push(`/live/${activeRoom.id}?mode=host`)}
                                            >
                                                <FaExternalLinkAlt /> Rejoin Live Session
                                            </button>
                                        ) : (
                                            <button
                                                className={styles.goLiveBtn}
                                                onClick={() => handleGoLive(course)}
                                            >
                                                <FaVideo /> Go Live
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Past sessions ──────────────────────────────────── */}
            {!loadingRooms && pastRooms.length > 0 && (
                <div className={styles.section}>
                    <div className={styles.sectionHead}>
                        <h2><FaHistory /> Recent Sessions</h2>
                    </div>
                    <div className={styles.sessionList}>
                        {pastRooms.map(room => {
                            const course = courses.find(c => c.id === room.courseId);
                            return (
                                <div key={room.id} className={styles.sessionRow}>
                                    <div className={styles.sessionIcon}><FaVideo /></div>
                                    <div className={styles.sessionInfo}>
                                        <span className={styles.sessionTitle}>{room.title}</span>
                                        <span className={styles.sessionCourse}>{course?.title || '—'}</span>
                                    </div>
                                    <span className={styles.endedBadge}>Ended</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* ── Modal ─────────────────────────────────────────── */}
            {selectedCourse && (
                <CreateLiveRoomModal
                    courseId={selectedCourse.id}
                    courseTitle={selectedCourse.title}
                    show={showModal}
                    onHide={() => { setShowModal(false); setSelectedCourse(null); }}
                />
            )}
        </div>
    );
}