'use client';
import React, { useState } from 'react';
import styles from './style.module.scss';

// ── Mock Data (replace with API calls) ──────────────────────────────────────
const MOCK_COURSE = {
    id: 1,
    title: 'Intro to Web Development',
    description:
        'Master the fundamentals of the modern web. HTML, CSS, JavaScript — from zero to deployed. Each lesson is a boss fight. Beat all three and slay the Dragon to earn your certificate.',
    thumbnailUrl: null,
    lecturer: { firstName: 'Lena', lastName: 'Mbeki' },
    enrollmentCount: 342,
    isEnrolled: true,     // toggle to false to see pre-enroll state
    isCompleted: false,
};

const MOCK_LESSONS = [
    {
        id: 1,
        title: 'HTML & The DOM',
        orderIndex: 1,
        isFinalBoss: false,
        content:
            'Learn the skeleton of the web. We cover semantic HTML5, document structure, forms, tables, and how browsers parse the DOM tree.',
        isPassed: true,
        score: 88,
        isLocked: false,
    },
    {
        id: 2,
        title: 'CSS & Layout Systems',
        orderIndex: 2,
        isFinalBoss: false,
        content:
            'Flexbox, Grid, animations, and responsive design. You will build three real layouts from scratch.',
        isPassed: false,
        score: null,
        isLocked: false,
    },
    {
        id: 3,
        title: 'Slay the Dragon',
        orderIndex: 3,
        isFinalBoss: true,
        content:
            'The final boss. JavaScript, async/await, fetch API, and DOM manipulation. 20 questions. Defeat the Dragon and the course is yours.',
        isPassed: false,
        score: null,
        isLocked: true,
    },
];

// ── Types ────────────────────────────────────────────────────────────────────
interface Lesson {
    id: number;
    title: string;
    orderIndex: number;
    isFinalBoss: boolean;
    content: string;
    isPassed: boolean;
    score: number | null;
    isLocked: boolean;
}

// ── Sub-components ──────────────────────────────────────────────────────────

function RoadmapNode({
    lesson,
    index,
    isActive,
    onClick,
}: {
    lesson: Lesson;
    index: number;
    isActive: boolean;
    onClick: () => void;
}) {
    const state = lesson.isPassed ? 'passed' : lesson.isLocked ? 'locked' : 'available';

    return (
        <div className={`${styles.roadmapStep} ${styles[`step${index + 1}`]}`}>
            {/* Connector line (except first) */}
            {index > 0 && (
                <div className={`${styles.connector} ${lesson.isPassed || state === 'available' ? styles.connectorActive : ''}`} />
            )}

            {/* Node */}
            <button
                className={`${styles.roadmapNode} ${styles[`node_${state}`]} ${isActive ? styles.nodeSelected : ''} ${lesson.isFinalBoss ? styles.nodeBoss : ''}`}
                onClick={onClick}
                disabled={lesson.isLocked}
            >
                {lesson.isPassed ? (
                    <span className={styles.nodeIcon}>✓</span>
                ) : lesson.isLocked ? (
                    <span className={styles.nodeIcon}>🔒</span>
                ) : lesson.isFinalBoss ? (
                    <span className={styles.nodeIcon}>🐉</span>
                ) : (
                    <span className={styles.nodeNum}>{lesson.orderIndex}</span>
                )}

                {/* Pulse ring for available non-passed */}
                {!lesson.isPassed && !lesson.isLocked && (
                    <span className={styles.pulse} />
                )}
            </button>

            {/* Label below node */}
            <div className={styles.nodeLabel}>
                <span className={`${styles.nodeName} ${lesson.isFinalBoss ? styles.bossLabel : ''}`}>
                    {lesson.title}
                </span>
                {lesson.isPassed && lesson.score !== null && (
                    <span className={styles.nodeScore}>{lesson.score}%</span>
                )}
                {lesson.isLocked && (
                    <span className={styles.nodeLocked}>Complete previous</span>
                )}
            </div>
        </div>
    );
}

function LessonPanel({ lesson, onBattle }: { lesson: Lesson; onBattle: (id: number) => void }) {
    return (
        <div className={`${styles.lessonPanel} ${lesson.isFinalBoss ? styles.panelBoss : ''}`}>
            <div className={styles.panelHeader}>
                <div className={styles.panelMeta}>
                    <span className={`${styles.panelBadge} ${lesson.isFinalBoss ? styles.badgeDragon : lesson.isPassed ? styles.badgePassed : styles.badgeAvail}`}>
                        {lesson.isFinalBoss ? '🐉 Final Boss' : lesson.isPassed ? '✓ Passed' : `Lesson ${lesson.orderIndex}`}
                    </span>
                    {lesson.isPassed && lesson.score !== null && (
                        <span className={styles.panelScore}>Score: {lesson.score}%</span>
                    )}
                </div>
                <h2 className={`${styles.panelTitle} ${lesson.isFinalBoss ? styles.bossTitle : ''}`}>
                    {lesson.title}
                </h2>
            </div>

            <p className={styles.panelContent}>{lesson.content}</p>

            {/* XP reward indicator */}
            <div className={styles.xpRow}>
                <div className={styles.xpItem}>
                    <span className={styles.xpIcon}>⚡</span>
                    <span className={styles.xpLabel}>{lesson.isFinalBoss ? '150 XP' : '50 XP'} reward</span>
                </div>
                {lesson.isFinalBoss && (
                    <div className={styles.xpItem}>
                        <span className={styles.xpIcon}>🏆</span>
                        <span className={styles.xpLabel}>Certificate unlocked</span>
                    </div>
                )}
            </div>

            {/* CTA */}
            {!lesson.isLocked && (
                <button
                    className={`${styles.battleBtn} ${lesson.isFinalBoss ? styles.battleBtnBoss : lesson.isPassed ? styles.battleBtnRetry : ''}`}
                    onClick={() => onBattle(lesson.id)}
                >
                    {lesson.isPassed
                        ? 'Retry Battle'
                        : lesson.isFinalBoss
                        ? '🐉 Slay the Dragon'
                        : '⚔ Enter Battle'}
                </button>
            )}

            {lesson.isLocked && (
                <div className={styles.lockedMsg}>
                    🔒 Complete all previous lessons to unlock
                </div>
            )}
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function CoursePage() {
    const course = MOCK_COURSE;
    const lessons = MOCK_LESSONS;
    const [activeLesson, setActiveLesson] = useState<Lesson>(lessons[1]); // default to first available

    const passedCount = lessons.filter((l) => l.isPassed).length;
    const progress = Math.round((passedCount / lessons.length) * 100);

    const handleBattle = (lessonId: number) => {
        // TODO: router.push(`/battle/${lessonId}`)
        alert(`Entering battle for lesson ${lessonId}! (connect to /battle/${lessonId})`);
    };

    return (
        <div className={styles.root}>

            {/* ── Top hero bar ── */}
            <div className={styles.hero}>
                <div className={styles.heroInner}>
                    <div className={styles.heroText}>
                        <span className={styles.heroEyebrow}>⚔ MacbaseDragonSlayer</span>
                        <h1 className={styles.heroTitle}>{course.title}</h1>
                        <p className={styles.heroDesc}>{course.description}</p>
                        <div className={styles.heroBadges}>
                            <span className={styles.badge}>
                                👤 {course.lecturer.firstName} {course.lecturer.lastName}
                            </span>
                            <span className={styles.badge}>
                                🎓 {course.enrollmentCount} enrolled
                            </span>
                            <span className={styles.badge}>
                                ⚔ 3 Lessons
                            </span>
                        </div>
                    </div>

                    {/* Progress ring area */}
                    {course.isEnrolled && (
                        <div className={styles.progressBlock}>
                            <svg viewBox="0 0 80 80" className={styles.progressRing}>
                                <circle cx="40" cy="40" r="34" className={styles.ringBg} />
                                <circle
                                    cx="40" cy="40" r="34"
                                    className={styles.ringFill}
                                    strokeDasharray={`${(progress / 100) * 213.6} 213.6`}
                                    strokeDashoffset="53.4"
                                />
                                <text x="40" y="37" textAnchor="middle" className={styles.ringNum}>{progress}%</text>
                                <text x="40" y="51" textAnchor="middle" className={styles.ringSub}>done</text>
                            </svg>
                            <span className={styles.progressLabel}>
                                {passedCount} / {lessons.length} lessons
                            </span>
                        </div>
                    )}

                    {!course.isEnrolled && (
                        <button className={styles.enrollBtn}>
                            Enroll Free →
                        </button>
                    )}
                </div>
            </div>

            {/* ── Main layout: roadmap + panel ── */}
            <div className={styles.body}>

                {/* Roadmap column */}
                <aside className={styles.roadmapCol}>
                    <h3 className={styles.roadmapHeading}>Your Roadmap</h3>

                    <div className={styles.roadmap}>
                        {lessons.map((lesson, i) => (
                            <RoadmapNode
                                key={lesson.id}
                                lesson={lesson}
                                index={i}
                                isActive={activeLesson.id === lesson.id}
                                onClick={() => !lesson.isLocked && setActiveLesson(lesson)}
                            />
                        ))}
                    </div>

                    {/* Overall progress bar */}
                    <div className={styles.progressBar}>
                        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                    </div>
                    <span className={styles.progressText}>{progress}% complete</span>
                </aside>

                {/* Lesson detail panel */}
                <main className={styles.panelCol}>
                    {course.isEnrolled ? (
                        <LessonPanel lesson={activeLesson} onBattle={handleBattle} />
                    ) : (
                        <div className={styles.enrollPrompt}>
                            <span className={styles.enrollPromptIcon}>⚔</span>
                            <h2>Enroll to start your journey</h2>
                            <p>Free enrollment. Beat 3 bosses. Slay the Dragon. Earn your certificate.</p>
                            <button className={styles.enrollBtn}>Enroll Free →</button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}