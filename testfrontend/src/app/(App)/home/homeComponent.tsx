'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../_styles/homeComponent.module.scss';

// ── Types ────────────────────────────────────────────────────
interface FeaturedCourse {
  id: number;
  title: string;
  slug: string;
  shortDescription: string | null;
  instructorFirstName: string | null;
  instructorLastName: string | null;
  enrollmentCount: number;
  lessonCount?: number;
}

// ── Helpers ──────────────────────────────────────────────────
const MOCK_COURSES: FeaturedCourse[] = [
  {
    id: 1,
    title: 'Intro to Web Development',
    slug: 'intro-web-dev',
    shortDescription: 'HTML, CSS & JS from zero to deployed.',
    instructorFirstName: 'Lena',
    instructorLastName: 'Mbeki',
    enrollmentCount: 342,
    lessonCount: 3,
  },
  {
    id: 2,
    title: 'Python for Data Science',
    slug: 'python-data-science',
    shortDescription: 'Pandas, NumPy and your first model.',
    instructorFirstName: 'Sipho',
    instructorLastName: 'Nkosi',
    enrollmentCount: 218,
    lessonCount: 3,
  },
  {
    id: 3,
    title: 'UI/UX Fundamentals',
    slug: 'ui-ux-fundamentals',
    shortDescription: 'Design thinking, Figma & prototyping.',
    instructorFirstName: 'Amara',
    instructorLastName: 'Dube',
    enrollmentCount: 190,
    lessonCount: 3,
  },
];

// ── Component ────────────────────────────────────────────────
export default function HomeComponent() {
  const router = useRouter();
  const [courses, setCourses] = useState<FeaturedCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch('/api/courses/public/featured', {
          headers: { Authorization: `Bearer ${token || ''}` },
        });
        if (!res.ok) throw new Error('fetch failed');
        const data = await res.json();
        setCourses(Array.isArray(data) && data.length > 0 ? data : MOCK_COURSES);
      } catch {
        setCourses(MOCK_COURSES);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const steps = [
    { num: '01', title: 'Enroll', desc: 'Pick a course created by a Lecturer. No payment. Just sign up.' },
    { num: '02', title: 'Battle', desc: 'Work through lessons. Each lesson ends with a boss fight quiz.' },
    { num: '03', title: 'Progress', desc: 'Beat the boss — the roadmap unlocks the next lesson automatically.' },
    { num: '04', title: 'Slay the Dragon', desc: 'The final quiz is the Dragon. Win it and the course is yours.' },
  ];

  return (
    <div className={styles.root}>

      {/* ── Navbar ── */}
      <nav className={styles.nav}>
        <a href="/" className={styles.navBrand}>
          Macbase<span>Dragon</span>Slayer
        </a>
        <ul className={styles.navLinks}>
          <li><a href="/courses">Courses</a></li>
          <li><a href="/signup">Become a Lecturer</a></li>
        </ul>
        <button className={styles.navCta} onClick={() => router.push('/signup')}>
          Sign Up
        </button>
      </nav>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <span className={styles.heroEyebrow}>⚔ MacbaseDragonSlayer Learner</span>
        <h1 className={styles.heroTitle}>
          Learn. Battle.<br /><em>Slay.</em>
        </h1>
        <p className={styles.heroSub}>
          An educational platform where every lesson is a boss fight.
          Pass quizzes, unlock your roadmap, and defeat the Dragon to master any course.
        </p>
        <div className={styles.heroActions}>
          <button className={styles.btnPrimary} onClick={() => router.push('/courses')}>
            Browse Courses
          </button>
          <button className={styles.btnGhost} onClick={() => router.push('/signup')}>
            Create a Course
          </button>
        </div>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <strong>3</strong>
            <span>Lessons per Course</span>
          </div>
          <div className={styles.statItem}>
            <strong>1</strong>
            <span>Quiz per Lesson</span>
          </div>
          <div className={styles.statItem}>
            <strong>🐉</strong>
            <span>Final Dragon Boss</span>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className={`${styles.howSection}`}>
        <div className={styles.section}>
          <p className={styles.sectionLabel}>The Loop</p>
          <h2 className={styles.sectionTitle}>How it works</h2>
          <p className={styles.sectionSub}>
            Courses are built by Lecturers with AI assistance. Students enroll, fight bosses, and climb the roadmap.
          </p>
          <div className={styles.steps}>
            {steps.map((s) => (
              <div className={styles.step} key={s.num}>
                <div className={styles.stepNum}>{s.num}</div>
                <div className={styles.stepTitle}>{s.title}</div>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Dragon Boss Feature ── */}
      <section className={`${styles.bossSection}`}>
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Final Challenge</p>
          <h2 className={styles.sectionTitle}>Slay the Dragon</h2>
          <div className={styles.bossCard}>
            <div className={styles.bossEmoji}>🐉</div>
            <div className={styles.bossText}>
              <h3>The last quiz is a <span>Dragon</span>.</h3>
              <p>
                Every lesson ends with a boss fight — answer questions correctly to drain the boss's HP.
                Get it wrong and you take damage. The final lesson unleashes the Dragon:
                a harder, longer quiz. Defeat it and the entire course is marked complete.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Courses ── */}
      <section className={styles.coursesSection}>
        <div className={styles.section}>
          <p className={styles.sectionLabel}>Available Now</p>
          <h2 className={styles.sectionTitle}>Featured Courses</h2>
          <p className={styles.sectionSub}>
            Each course has exactly 3 lessons. Each lesson has an AI-generated quiz. The last is the Dragon.
          </p>

          {loading ? (
            <p style={{ color: '#9999bb', fontSize: '0.8rem' }}>Loading courses…</p>
          ) : (
            <div className={styles.coursesGrid}>
              {courses.map((c) => (
                <div
                  key={c.id}
                  className={styles.courseCard}
                  onClick={() => router.push(`/course/${c.slug || c.id}`)}
                >
                  <span className={styles.courseTag}>⚔ 3 Lessons</span>
                  <div className={styles.courseTitle}>{c.title}</div>
                  <div className={styles.courseMeta}>
                    <span>
                      {c.instructorFirstName && c.instructorLastName
                        ? `${c.instructorFirstName} ${c.instructorLastName}`
                        : 'Lecturer'}
                    </span>
                    <span>·</span>
                    <span>{(c.enrollmentCount || 0).toLocaleString()} enrolled</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaBox}>
          <h2>Ready to fight?</h2>
          <p>Sign up free. Enroll in a course. Defeat your first boss today.</p>
          <button className={styles.btnPrimary} onClick={() => router.push('/signup')}>
            Start for Free
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className={styles.footerBrand}>
          Macbase<span>Dragon</span>Slayer Learner
        </div>
        <div className={styles.footerCredit}>
          Developed by Daniel Mamphekgo @ MERTCITA HACKATHON
        </div>
      </footer>

    </div>
  );
}