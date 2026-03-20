'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { COURSES, Course } from './courseData';
import styles from './coursesComponent.module.scss';

// ── Difficulty badge ───────────────────────────────────────────────────────────
function DiffBadge({ level }: { level: string }) {
  const colors: Record<string, { bg: string; fg: string }> = {
    Beginner:     { bg: 'rgba(16,185,129,0.12)', fg: '#059669' },
    Intermediate: { bg: 'rgba(245,158,11,0.12)', fg: '#b45309' },
    Advanced:     { bg: 'rgba(239,68,68,0.12)',  fg: '#dc2626' },
  };
  const c = colors[level] ?? colors.Beginner;
  return (
    <span style={{
      fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.08em',
      textTransform: 'uppercase', padding: '3px 10px', borderRadius: '999px',
      background: c.bg, color: c.fg, border: `1px solid ${c.fg}30`,
    }}>
      {level}
    </span>
  );
}

// ── Game type badge ────────────────────────────────────────────────────────────
function GameBadge({ type }: { type: 'fps' | 'dragon' }) {
  return (
    <span style={{
      fontSize: '0.62rem', fontWeight: 600, letterSpacing: '0.08em',
      textTransform: 'uppercase', padding: '3px 10px', borderRadius: '999px',
      background: type === 'fps' ? 'rgba(220,38,38,0.1)' : 'rgba(124,58,237,0.1)',
      color:      type === 'fps' ? '#dc2626'              : '#7c3aed',
      border:     `1px solid ${type === 'fps' ? '#dc262630' : '#7c3aed30'}`,
    }}>
      {type === 'fps' ? '🎯 FPS Shooter' : '🐉 Dragon Boss'}
    </span>
  );
}

// ── Course card ────────────────────────────────────────────────────────────────
function CourseCard({ course }: { course: Course }) {
  const router  = useRouter();
  const [hov, setHov] = useState(false);

  return (
    <div
      className={styles.card}
      style={{ '--card-color': course.color, '--card-light': course.colorLight } as React.CSSProperties}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => router.push(course.route)}
    >
      {/* Top color stripe */}
      <div className={styles.cardStripe} style={{ background: course.color }} />

      {/* Icon */}
      <div className={styles.cardIcon} style={{ background: course.colorLight }}>
        <span>{course.icon}</span>
      </div>

      {/* Badges */}
      <div className={styles.cardBadges}>
        <GameBadge type={course.gameType} />
        <DiffBadge level={course.difficulty} />
      </div>

      {/* Title + description */}
      <h3 className={styles.cardTitle}>{course.title}</h3>
      <p className={styles.cardDesc}>{course.description}</p>

      {/* Meta row */}
      <div className={styles.cardMeta}>
        <span className={styles.metaItem}>📚 {course.lessons} Lessons</span>
        <span className={styles.metaItem}>⚡ {course.xpReward} XP</span>
        <span className={styles.metaItem}>{course.subject}</span>
      </div>

      {/* CTA */}
      <button
        className={styles.cardBtn}
        style={{
          background:  hov ? course.color : 'transparent',
          borderColor: course.color,
          color:       hov ? '#fff'        : course.color,
        }}
      >
        {course.gameType === 'fps' ? '🎯 Enter Battle' : '🐉 Face the Dragon'} →
      </button>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function CoursesComponent() {
  const [filter, setFilter] = useState<'all' | 'fps' | 'dragon'>('all');

  const filtered = filter === 'all' ? COURSES : COURSES.filter(c => c.gameType === filter);

  return (
    <div className={styles.root}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <span className={styles.eyebrow}>⚔ Choose Your Battle</span>
          <h1 className={styles.title}>
            Pick a course.<br />
            <em>Slay the knowledge.</em>
          </h1>
          <p className={styles.sub}>
            6 subjects. 2 game modes. One goal — beat the boss and prove you know your stuff.
          </p>

          {/* Filter tabs */}
          <div className={styles.filters}>
            {(['all', 'fps', 'dragon'] as const).map(f => (
              <button
                key={f}
                className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? '🎮 All Courses' : f === 'fps' ? '🎯 FPS Shooter' : '🐉 Dragon Boss'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats bar ── */}
      <div className={styles.statsBar}>
        {[
          { icon: '📚', label: '6 Courses', sub: 'Across 6 subjects' },
          { icon: '🎯', label: '3 FPS Games', sub: 'Shoot wrong answers' },
          { icon: '🐉', label: '3 Dragon Bosses', sub: 'Classic quiz battle' },
          { icon: '⚡', label: 'Up to 200 XP', sub: 'Per course clear' },
        ].map((s, i) => (
          <div key={i} className={styles.statItem}>
            <span className={styles.statIcon}>{s.icon}</span>
            <span className={styles.statLabel}>{s.label}</span>
            <span className={styles.statSub}>{s.sub}</span>
          </div>
        ))}
      </div>

      {/* ── Grid ── */}
      <div className={styles.grid}>
        {filtered.map(course => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <span className={styles.footerBrand}>
          Macbase<span>Dragon</span>Slayer Learner
        </span>
        <span className={styles.footerCredit}>
          Developed by Daniel Mamphekgo @ MERTCITA HACKATHON
        </span>
      </footer>
    </div>
  );
}