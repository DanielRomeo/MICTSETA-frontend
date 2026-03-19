'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './bossbattle.module.scss';

// ── Types ─────────────────────────────────────────────────────────────────
interface Question {
    question: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctAnswer: 'A' | 'B' | 'C' | 'D';
}

interface BossBattleProps {
    lessonId: number;
    lessonTitle: string;
    isFinalBoss?: boolean;
    questions?: Question[]; // from API
    onVictory: (score: number) => void;
    onDefeat: () => void;
    onExit: () => void;
}

// ── Mock questions (replace with API) ─────────────────────────────────────
const MOCK_QUESTIONS: Question[] = [
    {
        question: 'What does HTML stand for?',
        optionA: 'Hyperlinks and Text Markup Language',
        optionB: 'HyperText Markup Language',
        optionC: 'Home Tool Markup Language',
        optionD: 'Hyper Transfer Markup Language',
        correctAnswer: 'B',
    },
    {
        question: 'Which tag is used to create a hyperlink in HTML?',
        optionA: '<link>',
        optionB: '<url>',
        optionC: '<a>',
        optionD: '<href>',
        correctAnswer: 'C',
    },
    {
        question: 'What is the correct CSS property to change text color?',
        optionA: 'text-color',
        optionB: 'font-color',
        optionC: 'foreground-color',
        optionD: 'color',
        correctAnswer: 'D',
    },
    {
        question: 'Which CSS property controls the spacing between elements?',
        optionA: 'spacing',
        optionB: 'margin',
        optionC: 'indent',
        optionD: 'gap-size',
        correctAnswer: 'B',
    },
    {
        question: 'What does the DOM stand for in web development?',
        optionA: 'Document Object Model',
        optionB: 'Data Object Manager',
        optionC: 'Dynamic Output Module',
        optionD: 'Document Order Map',
        correctAnswer: 'A',
    },
];

// ── Constants ──────────────────────────────────────────────────────────────
const MAX_PLAYER_HP = 100;
const CORRECT_DAMAGE = 20;   // damage dealt to boss per correct answer
const WRONG_DAMAGE   = 15;   // damage player takes per wrong answer
const ANSWER_TIMEOUT = 15;   // seconds per question

// ── Dragon SVG ─────────────────────────────────────────────────────────────
function DragonSVG({
    hp,
    maxHp,
    isHit,
    isDead,
    isIdle,
}: {
    hp: number;
    maxHp: number;
    isHit: boolean;
    isDead: boolean;
    isIdle: boolean;
}) {
    const pct = hp / maxHp;
    const color = pct > 0.6 ? '#d946ef' : pct > 0.3 ? '#f59e0b' : '#ef4444';

    return (
        <div className={`${styles.dragonWrap} ${isHit ? styles.dragonHit : ''} ${isDead ? styles.dragonDead : ''} ${isIdle ? styles.dragonIdle : ''}`}>
            <svg
                viewBox="0 0 320 280"
                xmlns="http://www.w3.org/2000/svg"
                className={styles.dragonSvg}
            >
                {/* Glow filter */}
                <defs>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="4" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                    <filter id="redglow">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                </defs>

                {/* ── Wings ── */}
                {/* Left wing */}
                <path d="M100 120 Q40 60 20 30 Q50 70 60 100 Q80 80 100 120Z"
                    fill={color} opacity="0.7" />
                <path d="M100 120 Q40 60 20 30" fill="none" stroke={color} strokeWidth="1.5" opacity="0.9" />
                {/* Wing membrane lines */}
                <path d="M100 120 Q60 75 35 45" fill="none" stroke={color} strokeWidth="0.8" opacity="0.5" />
                <path d="M100 120 Q70 85 50 60" fill="none" stroke={color} strokeWidth="0.8" opacity="0.5" />

                {/* Right wing */}
                <path d="M220 120 Q280 60 300 30 Q270 70 260 100 Q240 80 220 120Z"
                    fill={color} opacity="0.7" />
                <path d="M220 120 Q280 60 300 30" fill="none" stroke={color} strokeWidth="1.5" opacity="0.9" />
                <path d="M220 120 Q260 75 285 45" fill="none" stroke={color} strokeWidth="0.8" opacity="0.5" />
                <path d="M220 120 Q250 85 270 60" fill="none" stroke={color} strokeWidth="0.8" opacity="0.5" />

                {/* ── Body ── */}
                <ellipse cx="160" cy="165" rx="55" ry="65" fill="#1a0a20" stroke={color} strokeWidth="1.5" />

                {/* Belly scales */}
                <ellipse cx="160" cy="175" rx="32" ry="40" fill="#2d1040" opacity="0.8" />
                <path d="M142 150 Q160 145 178 150 Q160 155 142 150Z" fill={color} opacity="0.3" />
                <path d="M138 165 Q160 158 182 165 Q160 172 138 165Z" fill={color} opacity="0.25" />
                <path d="M140 180 Q160 173 180 180 Q160 187 140 180Z" fill={color} opacity="0.2" />

                {/* ── Neck ── */}
                <path d="M140 115 Q150 95 160 88 Q170 95 180 115" fill="#1a0a20" stroke={color} strokeWidth="1.2" />

                {/* ── Head ── */}
                <ellipse cx="160" cy="78" rx="36" ry="28" fill="#1a0a20" stroke={color} strokeWidth="1.5" />

                {/* Snout */}
                <path d="M135 85 Q130 95 138 100 Q160 105 182 100 Q190 95 185 85"
                    fill="#110820" stroke={color} strokeWidth="1.2" />

                {/* Nostrils */}
                <circle cx="150" cy="95" r="3" fill={color} opacity="0.7" />
                <circle cx="170" cy="95" r="3" fill={color} opacity="0.7" />

                {/* Eyes */}
                <ellipse cx="145" cy="70" rx="9" ry="8" fill="#0a0010" stroke={color} strokeWidth="1.2" />
                <ellipse cx="175" cy="70" rx="9" ry="8" fill="#0a0010" stroke={color} strokeWidth="1.2" />
                {/* Pupils */}
                <ellipse cx="145" cy="70" rx="4" ry="6" fill={color} filter="url(#glow)" />
                <ellipse cx="175" cy="70" rx="4" ry="6" fill={color} filter="url(#glow)" />
                {/* Eye shine */}
                <circle cx="147" cy="67" r="1.5" fill="white" opacity="0.6" />
                <circle cx="177" cy="67" r="1.5" fill="white" opacity="0.6" />

                {/* ── Horns ── */}
                <path d="M145 52 Q138 32 142 22 Q148 38 148 52Z" fill={color} opacity="0.9" />
                <path d="M175 52 Q182 32 178 22 Q172 38 172 52Z" fill={color} opacity="0.9" />
                {/* Small side horns */}
                <path d="M132 62 Q122 52 124 44 Q130 54 135 62Z" fill={color} opacity="0.7" />
                <path d="M188 62 Q198 52 196 44 Q190 54 185 62Z" fill={color} opacity="0.7" />

                {/* ── Claws ── */}
                {/* Left arm */}
                <path d="M110 175 Q85 185 80 195" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M80 195 Q72 205 68 212" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M80 195 Q76 207 80 215" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M80 195 Q84 206 90 212" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />

                {/* Right arm */}
                <path d="M210 175 Q235 185 240 195" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" />
                <path d="M240 195 Q248 205 252 212" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M240 195 Q244 207 240 215" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M240 195 Q236 206 230 212" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />

                {/* ── Tail ── */}
                <path d="M205 210 Q240 230 260 220 Q275 215 270 235 Q255 245 230 235 Q210 228 200 220"
                    fill="#1a0a20" stroke={color} strokeWidth="1.5" />
                {/* Tail spike */}
                <path d="M270 235 Q285 240 280 250 Q268 248 270 235Z" fill={color} opacity="0.8" />

                {/* ── Fire breath (only when hp < 50%) ── */}
                {pct < 0.5 && (
                    <g className={styles.fireBreath}>
                        <path d="M160 100 Q140 115 120 125 Q100 130 85 128"
                            stroke="#f59e0b" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8" />
                        <path d="M160 100 Q145 118 130 132 Q115 142 98 138"
                            stroke="#ef4444" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.6" />
                        <circle cx="85" cy="128" r="8" fill="#f59e0b" opacity="0.6" filter="url(#glow)" />
                        <circle cx="85" cy="128" r="4" fill="#fbbf24" opacity="0.9" />
                    </g>
                )}

                {/* ── Death X eyes ── */}
                {isDead && (
                    <g>
                        <line x1="140" y1="65" x2="150" y2="75" stroke="white" strokeWidth="2.5" />
                        <line x1="150" y1="65" x2="140" y2="75" stroke="white" strokeWidth="2.5" />
                        <line x1="170" y1="65" x2="180" y2="75" stroke="white" strokeWidth="2.5" />
                        <line x1="180" y1="65" x2="170" y2="75" stroke="white" strokeWidth="2.5" />
                    </g>
                )}

                {/* Hit flash overlay */}
                {isHit && (
                    <ellipse cx="160" cy="150" rx="80" ry="90"
                        fill="white" opacity="0.15" className={styles.hitFlash} />
                )}
            </svg>

            {/* HP bar under dragon */}
            <div className={styles.bossHpWrap}>
                <div className={styles.bossHpLabel}>
                    <span className={styles.bossName}>🐉 {isDead ? 'DEFEATED' : 'DRAGON'}</span>
                    <span className={styles.bossHpNum}>{Math.max(0, hp)} / {maxHp}</span>
                </div>
                <div className={styles.bossHpBar}>
                    <div
                        className={styles.bossHpFill}
                        style={{
                            width: `${Math.max(0, (hp / maxHp) * 100)}%`,
                            background: pct > 0.6 ? '#d946ef' : pct > 0.3 ? '#f59e0b' : '#ef4444',
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

// ── Player HP bar ──────────────────────────────────────────────────────────
function PlayerHP({ hp, maxHp, isHit }: { hp: number; maxHp: number; isHit: boolean }) {
    const pct = hp / maxHp;
    return (
        <div className={`${styles.playerHpWrap} ${isHit ? styles.playerHit : ''}`}>
            <div className={styles.playerHpLabel}>
                <span>⚔ YOU</span>
                <span>{Math.max(0, hp)} HP</span>
            </div>
            <div className={styles.playerHpBar}>
                <div
                    className={styles.playerHpFill}
                    style={{
                        width: `${Math.max(0, pct * 100)}%`,
                        background: pct > 0.5 ? '#22c55e' : pct > 0.25 ? '#f59e0b' : '#ef4444',
                    }}
                />
            </div>
        </div>
    );
}

// ── Timer arc ─────────────────────────────────────────────────────────────
function TimerArc({ seconds, max }: { seconds: number; max: number }) {
    const r = 22;
    const circ = 2 * Math.PI * r;
    const progress = (seconds / max) * circ;
    const color = seconds > 8 ? '#a855f7' : seconds > 4 ? '#f59e0b' : '#ef4444';

    return (
        <svg viewBox="0 0 56 56" className={styles.timerSvg}>
            <circle cx="28" cy="28" r={r} fill="none" stroke="#1a1a26" strokeWidth="4" />
            <circle
                cx="28" cy="28" r={r}
                fill="none"
                stroke={color}
                strokeWidth="4"
                strokeDasharray={`${progress} ${circ}`}
                strokeDashoffset={circ / 4}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 1s linear, stroke 0.3s' }}
            />
            <text x="28" y="33" textAnchor="middle" fill={color}
                style={{ fontFamily: "'Syne', sans-serif", fontSize: '14px', fontWeight: 800 }}>
                {seconds}
            </text>
        </svg>
    );
}

// ── Result overlay ─────────────────────────────────────────────────────────
function ResultOverlay({
    type,
    score,
    isFinalBoss,
    onRetry,
    onContinue,
    onExit,
}: {
    type: 'victory' | 'defeat';
    score: number;
    isFinalBoss: boolean;
    onRetry: () => void;
    onContinue: () => void;
    onExit: () => void;
}) {
    return (
        <div className={`${styles.resultOverlay} ${type === 'victory' ? styles.victoryOverlay : styles.defeatOverlay}`}>
            <div className={styles.resultBox}>
                {type === 'victory' ? (
                    <>
                        <div className={styles.resultIcon}>
                            {isFinalBoss ? '🏆' : '⚔'}
                        </div>
                        <h2 className={styles.resultTitle}>
                            {isFinalBoss ? 'Dragon Slain!' : 'Boss Defeated!'}
                        </h2>
                        <p className={styles.resultSub}>
                            {isFinalBoss
                                ? 'You have mastered this course. The dragon falls.'
                                : 'Well fought. The next lesson is now unlocked.'}
                        </p>
                        <div className={styles.resultScore}>
                            <span className={styles.resultScoreNum}>{score}%</span>
                            <span className={styles.resultScoreLabel}>accuracy</span>
                        </div>
                        <div className={styles.resultXp}>
                            +{isFinalBoss ? 150 : 50} XP earned
                        </div>
                        <div className={styles.resultBtns}>
                            <button className={styles.resultBtnPrimary} onClick={onContinue}>
                                {isFinalBoss ? 'Claim Certificate' : 'Continue →'}
                            </button>
                            <button className={styles.resultBtnSecondary} onClick={onExit}>
                                Back to Course
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className={styles.resultIcon}>💀</div>
                        <h2 className={styles.resultTitle}>You Were Slain</h2>
                        <p className={styles.resultSub}>
                            The dragon was too strong. Study the lesson and try again.
                        </p>
                        <div className={styles.resultScore}>
                            <span className={styles.resultScoreNum}>{score}%</span>
                            <span className={styles.resultScoreLabel}>accuracy</span>
                        </div>
                        <div className={styles.resultBtns}>
                            <button className={styles.resultBtnPrimary} onClick={onRetry}>
                                ↺ Try Again
                            </button>
                            <button className={styles.resultBtnSecondary} onClick={onExit}>
                                Back to Course
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// ── Main BossBattle component ──────────────────────────────────────────────
export default function BossBattle({
    lessonId = 3,
    lessonTitle = 'Slay the Dragon',
    isFinalBoss = true,
    questions = MOCK_QUESTIONS,
    onVictory = (s) => console.log('Victory', s),
    onDefeat = () => console.log('Defeat'),
    onExit = () => console.log('Exit'),
}: Partial<BossBattleProps>) {
    const maxBossHp = questions.length * CORRECT_DAMAGE;

    const [qIndex, setQIndex]           = useState(0);
    const [bossHp, setBossHp]           = useState(maxBossHp);
    const [playerHp, setPlayerHp]       = useState(MAX_PLAYER_HP);
    const [selected, setSelected]       = useState<'A' | 'B' | 'C' | 'D' | null>(null);
    const [revealed, setRevealed]       = useState(false);
    const [bossIsHit, setBossIsHit]     = useState(false);
    const [playerIsHit, setPlayerIsHit] = useState(false);
    const [timeLeft, setTimeLeft]       = useState(ANSWER_TIMEOUT);
    const [correct, setCorrect]         = useState(0);
    const [gameState, setGameState]     = useState<'playing' | 'victory' | 'defeat'>('playing');
    const [particles, setParticles]     = useState<{ id: number; x: number; y: number; text: string; good: boolean }[]>([]);
    const [shake, setShake]             = useState(false);

    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const particleId = useRef(0);

    const currentQ = questions[qIndex];

    // ── Timer countdown ─────────────────────────────────────────────────
    useEffect(() => {
        if (gameState !== 'playing' || revealed) return;

        timerRef.current = setInterval(() => {
            setTimeLeft((t) => {
                if (t <= 1) {
                    clearInterval(timerRef.current!);
                    handleTimeout();
                    return 0;
                }
                return t - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current!);
    }, [qIndex, revealed, gameState]);

    const spawnParticle = (text: string, good: boolean) => {
        const id = particleId.current++;
        const x = 40 + Math.random() * 60;
        const y = 30 + Math.random() * 20;
        setParticles((p) => [...p, { id, x, y, text, good }]);
        setTimeout(() => setParticles((p) => p.filter((pp) => pp.id !== id)), 1200);
    };

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 500);
    };

    const handleTimeout = useCallback(() => {
        setRevealed(true);
        clearInterval(timerRef.current!);
        const newHp = playerHp - WRONG_DAMAGE;
        setPlayerHp(newHp);
        setPlayerIsHit(true);
        triggerShake();
        spawnParticle(`-${WRONG_DAMAGE} HP`, false);
        setTimeout(() => setPlayerIsHit(false), 600);

        if (newHp <= 0) {
            setTimeout(() => setGameState('defeat'), 900);
            return;
        }

        setTimeout(() => advanceQuestion(), 1600);
    }, [playerHp, qIndex]);

    const handleAnswer = (option: 'A' | 'B' | 'C' | 'D') => {
        if (revealed) return;
        clearInterval(timerRef.current!);
        setSelected(option);
        setRevealed(true);

        const isCorrect = option === currentQ.correctAnswer;

        if (isCorrect) {
            const newBossHp = bossHp - CORRECT_DAMAGE;
            setBossHp(newBossHp);
            setBossIsHit(true);
            spawnParticle(`-${CORRECT_DAMAGE}`, true);
            setCorrect((c) => c + 1);
            setTimeout(() => setBossIsHit(false), 600);

            if (newBossHp <= 0) {
                setTimeout(() => {
                    const score = Math.round(((correct + 1) / questions.length) * 100);
                    setGameState('victory');
                    onVictory(score);
                }, 900);
                return;
            }
        } else {
            const newPlayerHp = playerHp - WRONG_DAMAGE;
            setPlayerHp(newPlayerHp);
            setPlayerIsHit(true);
            triggerShake();
            spawnParticle(`-${WRONG_DAMAGE} HP`, false);
            setTimeout(() => setPlayerIsHit(false), 600);

            if (newPlayerHp <= 0) {
                setTimeout(() => setGameState('defeat'), 900);
                return;
            }
        }

        setTimeout(() => advanceQuestion(), 1600);
    };

    const advanceQuestion = useCallback(() => {
        const next = qIndex + 1;
        if (next >= questions.length) {
            const score = Math.round((correct / questions.length) * 100);
            if (playerHp > 0 && bossHp > 0) {
                // all questions done, boss still alive — victory on accuracy
                if (correct >= Math.ceil(questions.length * 0.6)) {
                    setGameState('victory');
                    onVictory(score);
                } else {
                    setGameState('defeat');
                    onDefeat();
                }
            }
            return;
        }
        setQIndex(next);
        setSelected(null);
        setRevealed(false);
        setTimeLeft(ANSWER_TIMEOUT);
    }, [qIndex, questions.length, correct, playerHp, bossHp]);

    const handleRetry = () => {
        setBossHp(maxBossHp);
        setPlayerHp(MAX_PLAYER_HP);
        setQIndex(0);
        setSelected(null);
        setRevealed(false);
        setTimeLeft(ANSWER_TIMEOUT);
        setCorrect(0);
        setGameState('playing');
        setParticles([]);
    };

    const score = Math.round((correct / questions.length) * 100);

    const optionLabels = ['A', 'B', 'C', 'D'] as const;
    const optionValues = [currentQ.optionA, currentQ.optionB, currentQ.optionC, currentQ.optionD];

    const getOptionState = (opt: 'A' | 'B' | 'C' | 'D') => {
        if (!revealed) return selected === opt ? 'selected' : 'idle';
        if (opt === currentQ.correctAnswer) return 'correct';
        if (opt === selected && opt !== currentQ.correctAnswer) return 'wrong';
        return 'idle';
    };

    return (
        <div className={`${styles.root} ${shake ? styles.rootShake : ''}`}>

            {/* Atmospheric BG particles */}
            <div className={styles.bgParticles}>
                {[...Array(20)].map((_, i) => (
                    <span key={i} className={styles.bgDot} style={{
                        left: `${(i * 5.3 + 3) % 100}%`,
                        animationDelay: `${(i * 0.37) % 4}s`,
                        animationDuration: `${3 + (i * 0.4) % 4}s`,
                    }} />
                ))}
            </div>

            {/* ── Header bar ── */}
            <header className={styles.header}>
                <button className={styles.exitBtn} onClick={onExit}>← Exit</button>
                <div className={styles.headerCenter}>
                    <span className={styles.headerTitle}>
                        {isFinalBoss ? '🐉 SLAY THE DRAGON' : '⚔ BOSS BATTLE'}
                    </span>
                    <span className={styles.headerSub}>{lessonTitle}</span>
                </div>
                <div className={styles.qCounter}>
                    {qIndex + 1} / {questions.length}
                </div>
            </header>

            {/* ── Arena ── */}
            <div className={styles.arena}>

                {/* Left: Player HP */}
                <div className={styles.playerSide}>
                    <PlayerHP hp={playerHp} maxHp={MAX_PLAYER_HP} isHit={playerIsHit} />
                </div>

                {/* Center: Dragon */}
                <div className={styles.dragonSide}>
                    {/* Damage particles */}
                    <div className={styles.particleLayer}>
                        {particles.map((p) => (
                            <span
                                key={p.id}
                                className={`${styles.particle} ${p.good ? styles.particleGood : styles.particleBad}`}
                                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                            >
                                {p.text}
                            </span>
                        ))}
                    </div>

                    <DragonSVG
                        hp={bossHp}
                        maxHp={maxBossHp}
                        isHit={bossIsHit}
                        isDead={gameState === 'victory'}
                        isIdle={gameState === 'playing' && !bossIsHit}
                    />
                </div>

                {/* Right: Timer */}
                <div className={styles.timerSide}>
                    <TimerArc seconds={timeLeft} max={ANSWER_TIMEOUT} />
                    <span className={styles.timerLabel}>sec</span>
                </div>
            </div>

            {/* ── Question card ── */}
            <div className={styles.questionSection}>
                <div className={styles.questionCard}>
                    <p className={styles.questionText}>{currentQ.question}</p>
                </div>

                {/* Answer options */}
                <div className={styles.optionsGrid}>
                    {optionLabels.map((opt, i) => {
                        const state = getOptionState(opt);
                        return (
                            <button
                                key={opt}
                                className={`${styles.option} ${styles[`option_${state}`]}`}
                                onClick={() => handleAnswer(opt)}
                                disabled={revealed}
                            >
                                <span className={styles.optionLetter}>{opt}</span>
                                <span className={styles.optionText}>{optionValues[i]}</span>
                                {state === 'correct' && <span className={styles.optionIcon}>✓</span>}
                                {state === 'wrong'   && <span className={styles.optionIcon}>✗</span>}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Result overlay ── */}
            {gameState !== 'playing' && (
                <ResultOverlay
                    type={gameState}
                    score={score}
                    isFinalBoss={isFinalBoss}
                    onRetry={handleRetry}
                    onContinue={() => onVictory(score)}
                    onExit={onExit}
                />
            )}
        </div>
    );
}