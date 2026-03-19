'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaVideo, FaSpinner, FaBroadcastTower, FaTimes, FaShieldAlt, FaDesktop, FaComments } from 'react-icons/fa';
import styles from '../../../_styles/live/createLiveRoomModal.module.scss';

interface Props {
    courseId: number;
    courseTitle: string;
    show: boolean;
    onHide: () => void;
}

export default function CreateLiveRoomModal({ courseId, courseTitle, show, onHide }: Props) {
    const router = useRouter();
    const [title, setTitle] = useState(`Live Class — ${courseTitle}`);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState('');

    if (!show) return null;

    const handleCreate = async () => {
        if (!title.trim()) { setError('Please enter a session title'); return; }
        if (!courseId) { setError('No course selected'); return; }
        setError('');
        setCreating(true);

        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch('/api/live-rooms', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ courseId, title }),
            });

            if (!res.ok) {
                const d = await res.json();
                throw new Error(d.message || d.error || 'Failed to create room');
            }

            const room = await res.json();
            onHide();
            router.push(`/live/${room.id}?mode=host`);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className={styles.backdrop} onClick={(e) => { if (e.target === e.currentTarget) onHide(); }}>
            <div className={styles.modal}>

                {/* Close */}
                <button className={styles.closeBtn} onClick={onHide}>
                    <FaTimes />
                </button>

                {/* Header */}
                <div className={styles.header}>
                    <div className={styles.headerGlow} />
                    <div className={styles.headerIcon}>
                        <FaBroadcastTower />
                    </div>
                    <h2>Start a Live Class</h2>
                    <p>for <span className={styles.courseName}>{courseTitle}</span></p>
                </div>

                {/* Feature pills */}
                <div className={styles.features}>
                    <div className={styles.feature}>
                        <FaDesktop /> Screen Share
                    </div>
                    <div className={styles.feature}>
                        <FaComments /> Live Chat
                    </div>
                    <div className={styles.feature}>
                        <FaShieldAlt /> Up to 200 students
                    </div>
                </div>

                {/* Form */}
                <div className={styles.body}>
                    <label className={styles.label}>Session Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={styles.input}
                        placeholder="e.g. Week 3 — Deep Dive into React Hooks"
                        disabled={creating}
                    />

                    <div className={styles.hint}>
                        Once live, copy the student link from the top bar and share it however you like.
                    </div>

                    {error && (
                        <div className={styles.error}>{error}</div>
                    )}
                </div>

                {/* Actions */}
                <div className={styles.footer}>
                    <button className={styles.cancelBtn} onClick={onHide} disabled={creating}>
                        Cancel
                    </button>
                    <button className={styles.startBtn} onClick={handleCreate} disabled={creating}>
                        {creating
                            ? <><FaSpinner className={styles.spin} /> Creating…</>
                            : <><FaVideo /> Go Live Now</>
                        }
                    </button>
                </div>
            </div>
        </div>
    );
}