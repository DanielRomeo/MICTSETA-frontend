'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import BossBattle from './BossBattle';

interface Question {
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: 'A' | 'B' | 'C' | 'D';
}

interface LessonMeta {
    id: number;
    title: string;
    isFinalBoss: boolean;
    courseId: number;
}

export default function BattlePage() {
    const params   = useParams();
    const router   = useRouter();
    const lessonId = Number(params.lessonId);

    const [questions, setQuestions]   = useState<Question[]>([]);
    const [lesson, setLesson]         = useState<LessonMeta | null>(null);
    const [loading, setLoading]       = useState(true);
    const [error, setError]           = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('access_token');

        const fetchBattle = async () => {
            try {
                // 1. Get lesson meta
                const lessonRes = await fetch(`/api/lessons/${lessonId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!lessonRes.ok) throw new Error('Lesson not found');
                const lessonData = await lessonRes.json();
                setLesson(lessonData.data);

                // 2. Get quiz questions for this lesson
                const quizRes = await fetch(`/api/quizzes/lesson/${lessonId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!quizRes.ok) throw new Error('Quiz not found — generate it first');
                const quizData = await quizRes.json();
                setQuestions(quizData.data.questions);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchBattle();
    }, [lessonId]);

    const handleVictory = async (score: number) => {
        const token = localStorage.getItem('access_token');
        try {
            // POST progress to backend
            await fetch('/api/progress/complete-lesson', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ lessonId, score }),
            });
        } catch (e) {
            console.error('Failed to save progress:', e);
        }
        // Navigate back to course
        if (lesson) router.push(`/course/${lesson.courseId}`);
    };

    const handleDefeat = () => {
        // Stay on result screen — BossBattle handles retry internally
    };

    const handleExit = () => {
        if (lesson) router.push(`/course/${lesson.courseId}`);
        else router.back();
    };

    if (loading) {
        return (
            <div style={{
                position: 'fixed', inset: 0, background: '#000',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#a855f7', fontFamily: 'monospace', fontSize: '0.8rem',
                letterSpacing: '0.2em',
            }}>
                LOADING BATTLE...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                position: 'fixed', inset: 0, background: '#000',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', gap: '16px',
                color: '#ef4444', fontFamily: 'monospace', fontSize: '0.8rem',
            }}>
                <span>⚠ {error}</span>
                <button
                    onClick={() => router.back()}
                    style={{
                        background: 'transparent', border: '1px solid #44445a',
                        color: '#9999bb', padding: '8px 20px', cursor: 'pointer',
                        fontFamily: 'monospace', borderRadius: '4px',
                    }}
                >
                    ← Go Back
                </button>
            </div>
        );
    }

    return (
        <BossBattle
            lessonId={lessonId}
            lessonTitle={lesson?.title ?? 'Boss Battle'}
            isFinalBoss={lesson?.isFinalBoss ?? false}
            questions={questions}
            onVictory={handleVictory}
            onDefeat={handleDefeat}
            onExit={handleExit}
        />
    );
}