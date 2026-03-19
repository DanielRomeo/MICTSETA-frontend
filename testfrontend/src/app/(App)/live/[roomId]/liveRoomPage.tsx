'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Container } from 'react-bootstrap';
import {
    FaVideo,
    FaLink,
    FaCheck,
    FaStop,
    FaDoorOpen,
    FaUsers,
    FaSpinner,
    FaChalkboardTeacher,
    FaExclamationTriangle,
} from 'react-icons/fa';
// import styles from '../../../_styles/live/liveRoom.module.scss';
// import styles from '../../_styles/live/liveRoom.module.scss';
// import styles from '@_styles/live/liveRoom.module.scss';
import styles from '@/app/(App)/_styles/live/liveRoom.module.scss';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Room {
    id: number;
    title: string;
    dailyRoomUrl: string;
    status: 'active' | 'ended';
    instructorId: number;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function LiveRoomPage() {
    const { roomId } = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    // mode=host → tutor created this room and is hosting
    // mode=join → student joined via link
    const mode = searchParams.get('mode') || 'join';
    const isHost = mode === 'host';

    const [room, setRoom] = useState<Room | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [ending, setEnding] = useState(false);
    const [roomEnded, setRoomEnded] = useState(false);

    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (roomId) fetchRoom();
    }, [roomId]);

    const fetchRoom = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`/api/live-rooms/${roomId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Room not found or access denied');
            const data = await res.json();
            setRoom(data);
            if (data.status === 'ended') setRoomEnded(true);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyLink = () => {
        // Build the student join link
        const joinUrl = `${window.location.origin}/live/${roomId}?mode=join`;
        navigator.clipboard.writeText(joinUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    const handleEndClass = async () => {
        if (!window.confirm('End the class for everyone?')) return;
        setEnding(true);
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`/api/live-rooms/${roomId}/end`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error('Failed to end room');
            setRoomEnded(true);
        } catch (e: any) {
            alert(e.message);
        } finally {
            setEnding(false);
        }
    };

    // ── Build the Daily.co iframe URL with custom params ──────────────────────
    const buildIframeUrl = (roomUrl: string) => {
        const token = localStorage.getItem('access_token');
        // Daily.co URL params: https://docs.daily.co/reference/daily-iframe-class/iframe-url-params
        const params = new URLSearchParams({
            showLeaveButton: 'true',
            showFullscreenButton: 'true',
        });
        return `${roomUrl}?${params.toString()}`;
    };

    // ── Render: loading ───────────────────────────────────────────────────────
    if (loading) return (
        <div className={styles.page}>
            <div className={styles.centred}>
                <FaSpinner className={styles.spinner} />
                <p>Connecting to class…</p>
            </div>
        </div>
    );

    // ── Render: error ─────────────────────────────────────────────────────────
    if (error) return (
        <div className={styles.page}>
            <div className={styles.centred}>
                <FaExclamationTriangle className={styles.errorIcon} />
                <p>{error}</p>
                <button className={styles.backBtn} onClick={() => router.back()}>Go back</button>
            </div>
        </div>
    );

    // ── Render: ended ─────────────────────────────────────────────────────────
    if (roomEnded) return (
        <div className={styles.page}>
            <div className={styles.centred}>
                <div className={styles.endedIcon}><FaStop /></div>
                <h2>Class has ended</h2>
                <p>{isHost ? 'You ended the class.' : 'The instructor has ended this session.'}</p>
                <button className={styles.backBtn} onClick={() => router.push('/dashboard')}>
                    Back to Dashboard
                </button>
            </div>
        </div>
    );

    // ── Render: active room ───────────────────────────────────────────────────
    return (
        <div className={styles.page}>
            {/* Top bar */}
            <div className={styles.topBar}>
                <div className={styles.topBarLeft}>
                    <div className={styles.liveDot} />
                    <span className={styles.liveLabel}>LIVE</span>
                    <span className={styles.roomTitle}>{room?.title}</span>
                </div>

                <div className={styles.topBarRight}>
                    {/* Copy link — host only */}
                    {isHost && (
                        <button className={styles.copyBtn} onClick={handleCopyLink}>
                            {copied ? <><FaCheck /> Copied!</> : <><FaLink /> Copy Student Link</>}
                        </button>
                    )}

                    {/* End class — host only */}
                    {isHost && (
                        <button
                            className={styles.endBtn}
                            onClick={handleEndClass}
                            disabled={ending}
                        >
                            {ending
                                ? <><FaSpinner className={styles.spinnerSm} /> Ending…</>
                                : <><FaStop /> End Class</>}
                        </button>
                    )}

                    {/* Leave — student */}
                    {!isHost && (
                        <button className={styles.leaveBtn} onClick={() => router.push('/dashboard')}>
                            <FaDoorOpen /> Leave
                        </button>
                    )}
                </div>
            </div>

            {/* Daily.co iframe */}
            <div className={styles.iframeWrapper}>
                {room && (
                    <iframe
                        ref={iframeRef}
                        className={styles.iframe}
                        src={buildIframeUrl(room.dailyRoomUrl)}
                        allow="camera; microphone; fullscreen; speaker; display-capture; compute-pressure"
                        title="Live Class"
                    />
                )}
            </div>

            {/* Host info panel (only visible while in lobby before iframe loads) */}
            {isHost && (
                <div className={styles.hostHint}>
                    <FaChalkboardTeacher />
                    <span>You are the host. Share the student link above to invite your class.</span>
                </div>
            )}
        </div>
    );
}