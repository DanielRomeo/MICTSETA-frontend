'use client';
import React, { useRef, useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../_styles/brand.module.scss';
// import '../_styles/brand.module.scss';
// import styles from ../

// ── Claude logo SVG (Anthropic's orange diamond mark) ─────────────────────
function ClaudeMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 2L28 9.5V22.5L16 30L4 22.5V9.5L16 2Z"
        fill="url(#claudeGrad)" opacity="0.95" />
      <path d="M11 16.5L14.5 11L18 16.5L14.5 22L11 16.5Z" fill="white" opacity="0.9" />
      <path d="M18 16.5L21.5 11L25 16.5L21.5 22L18 16.5Z" fill="white" opacity="0.6" />
      <defs>
        <linearGradient id="claudeGrad" x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#d97706" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ── Animated counter ──────────────────────────────────────────────────────
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      let start = 0;
      const step = Math.ceil(target / 60);
      const timer = setInterval(() => {
        start += step;
        if (start >= target) { setCount(target); clearInterval(timer); }
        else setCount(start);
      }, 20);
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ── Pill badge ────────────────────────────────────────────────────────────
function Pill({ children, color = 'violet' }: { children: React.ReactNode; color?: 'violet' | 'pink' | 'amber' }) {
  const bg: Record<string, string> = {
    violet: 'rgba(124,58,237,0.1)',
    pink:   'rgba(217,70,239,0.1)',
    amber:  'rgba(217,119,6,0.1)',
  };
  const fg: Record<string, string> = {
    violet: '#7c3aed',
    pink:   '#d946ef',
    amber:  '#d97706',
  };
  const br: Record<string, string> = {
    violet: 'rgba(124,58,237,0.2)',
    pink:   'rgba(217,70,239,0.2)',
    amber:  'rgba(217,119,6,0.2)',
  };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.08em',
      textTransform: 'uppercase', padding: '5px 12px', borderRadius: '999px',
      background: bg[color], color: fg[color], border: `1px solid ${br[color]}`,
    }}>
      {children}
    </span>
  );
}

// ── Section header ─────────────────────────────────────────────────────────
function SectionHead({ pill, pillColor, title, sub, center = false }: {
  pill: string; pillColor?: 'violet' | 'pink' | 'amber';
  title: React.ReactNode; sub: string; center?: boolean;
}) {
  return (
    <div style={{ textAlign: center ? 'center' : 'left', marginBottom: '56px' }}>
      <Pill color={pillColor}>{pill}</Pill>
      <h2 style={{
        fontFamily: "'Syne', sans-serif", fontWeight: 800,
        fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.03em',
        color: '#0f0720', lineHeight: 1.1, margin: '16px 0 16px',
      }}>{title}</h2>
      <p style={{
        fontSize: '1rem', lineHeight: 1.8, color: '#8a7aaa',
        maxWidth: center ? '560px' : '540px',
        margin: center ? '0 auto' : '0',
      }}>{sub}</p>
    </div>
  );
}

// ── Glow blob (decorative) ────────────────────────────────────────────────
function Blob({ top, left, right, bottom, color, size }: {
  top?: string; left?: string; right?: string; bottom?: string;
  color: string; size: number;
}) {
  return (
    <div aria-hidden style={{
      position: 'absolute',
      top, left, right, bottom,
      width: size, height: size,
      borderRadius: '50%',
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      pointerEvents: 'none',
      zIndex: 0,
    }} />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function AboutPage() {
  return (
    <div style={{ background: '#fff', color: '#3d2f5a', fontFamily: "'Plus Jakarta Sans', sans-serif", overflowX: 'hidden' }}>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600&display=swap" rel="stylesheet" />

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 48px',
        background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(124,58,237,0.08)',
      }}>
        <Link href="/" style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.05rem', color: '#0f0720', textDecoration: 'none', letterSpacing: '-0.02em' }}>
          Macbase<span style={{ background: 'linear-gradient(135deg, #7c3aed, #d946ef)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Dragon</span>Slayer
        </Link>
        <div style={{ display: 'flex', gap: '32px', listStyle: 'none' }}>
          {[['/', 'Home'], ['/about', 'About'], ['/courses', 'Courses'], ['/signin', 'Sign In']].map(([href, label]) => (
            <Link key={href} href={href} style={{ fontSize: '0.82rem', fontWeight: 500, color: '#8a7aaa', textDecoration: 'none' }}>
              {label}
            </Link>
          ))}
        </div>
        <Link href="/signup" style={{
          fontWeight: 600, fontSize: '0.82rem', padding: '9px 22px',
          background: 'linear-gradient(135deg, #7c3aed, #d946ef)', color: '#fff',
          borderRadius: '999px', textDecoration: 'none',
          boxShadow: '0 8px 32px rgba(124,58,237,0.35)',
        }}>
          Get Started
        </Link>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        background: 'linear-gradient(135deg, #fce8ff 0%, #ede8ff 45%, #ddd6fe 100%)',
        position: 'relative', overflow: 'hidden', paddingTop: '80px',
      }}>
        <Blob top="-200px" right="-150px" color="rgba(217,70,239,0.15)" size={700} />
        <Blob bottom="-100px" left="-100px" color="rgba(124,58,237,0.12)" size={500} />
        <Blob top="30%" left="40%" color="rgba(245,158,11,0.08)" size={400} />

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 32px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' }}>
            {/* Left copy */}
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
                <Pill color="violet">🎮 Gamified Learning</Pill>
                <Pill color="amber">🤖 Powered by Claude AI</Pill>
                <Pill color="pink">🐉 Beat the Dragon</Pill>
              </div>
              <h1 style={{
                fontFamily: "'Syne', sans-serif", fontWeight: 800,
                fontSize: 'clamp(2.6rem, 5vw, 4.2rem)', letterSpacing: '-0.04em',
                color: '#0f0720', lineHeight: 1.05, marginBottom: '24px',
              }}>
                Where Learning<br />
                Becomes a<br />
                <span style={{ background: 'linear-gradient(135deg, #7c3aed, #d946ef)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                  Boss Fight.
                </span>
              </h1>
              <p style={{ fontSize: '1.05rem', lineHeight: 1.8, color: '#8a7aaa', marginBottom: '36px', maxWidth: '480px' }}>
                MacbaseDragonSlayer combines AI-generated curriculum with RPG-style battles to make education unforgettable. Study. Battle. Level up. Repeat.
              </p>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <Link href="/courses" style={{
                  fontWeight: 600, fontSize: '0.9rem', padding: '14px 30px',
                  background: 'linear-gradient(135deg, #7c3aed, #d946ef)', color: '#fff',
                  borderRadius: '999px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px',
                  boxShadow: '0 8px 32px rgba(124,58,237,0.35)',
                }}>
                  ⚔ Start Learning
                </Link>
                <Link href="/tutorBoss/demo2" style={{
                  fontWeight: 600, fontSize: '0.9rem', padding: '13px 30px',
                  background: 'transparent', color: '#7c3aed',
                  border: '2px solid rgba(124,58,237,0.25)', borderRadius: '999px',
                  textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px',
                  transition: 'all 0.2s',
                }}>
                  🐉 Try Demo Battle
                </Link>
              </div>
            </div>

            {/* Right — feature stack */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { icon: '🐉', label: 'Boss Battle Quizzes', desc: 'Answer correctly — drain the boss HP. Wrong answers hurt you back.', color: '#d946ef' },
                { icon: '🗺️', label: 'Visual Roadmap', desc: 'Watch your learning path unlock lesson by lesson as you progress.', color: '#7c3aed' },
                { icon: '🤖', label: 'AI-Generated Quizzes', desc: 'Claude reads lesson content and instantly creates unique quiz questions.', color: '#d97706' },
                { icon: '⚡', label: 'XP & Level System', desc: 'Earn XP for every battle. Level up as your knowledge grows.', color: '#d946ef' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '16px',
                  padding: '20px', background: 'rgba(255,255,255,0.8)',
                  borderRadius: '16px', border: '1px solid rgba(124,58,237,0.1)',
                  backdropFilter: 'blur(8px)',
                  boxShadow: '0 2px 12px rgba(124,58,237,0.06)',
                  animation: `slideUp 0.5s ease ${i * 0.1}s both`,
                }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.4rem',
                    background: `linear-gradient(135deg, ${item.color}18, ${item.color}28)`,
                    border: `1px solid ${item.color}30`,
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: '#0f0720', marginBottom: '3px' }}>{item.label}</div>
                    <div style={{ fontSize: '0.78rem', color: '#8a7aaa', lineHeight: 1.6 }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{ background: '#fff', padding: '64px 32px', borderBottom: '1px solid rgba(124,58,237,0.08)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
          {[
            { label: 'Students Enrolled', value: 0, suffix: '+', note: 'Growing daily' },
            { label: 'AI-Generated Quizzes', value: 0, suffix: '+', note: 'Created instantly' },
            { label: 'Courses Published', value: 0, suffix: '+', note: 'By our lecturers' },
            { label: 'Dragons Slain', value: 0, suffix: '', note: 'And counting' },
          ].map((stat, i) => (
            <div key={i} style={{
              padding: '28px 24px', textAlign: 'center',
              background: 'linear-gradient(160deg, #fff 0%, #f8f4ff 100%)',
              border: '1px solid rgba(124,58,237,0.1)', borderRadius: '16px',
              boxShadow: '0 2px 12px rgba(124,58,237,0.05)',
            }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '2.4rem', lineHeight: 1, background: 'linear-gradient(135deg, #7c3aed, #d946ef)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '8px' }}>
                🚀
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8a7aaa', marginBottom: '4px' }}>{stat.label}</div>
              <div style={{ fontSize: '0.68rem', color: '#c4b8e0' }}>{stat.note}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── AI SECTION ── */}
      <section style={{ background: 'linear-gradient(180deg, #fafafa 0%, #f4f0ff 100%)', padding: '96px 32px', position: 'relative', overflow: 'hidden' }}>
        <Blob top="-100px" right="0" color="rgba(245,158,11,0.1)" size={500} />

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <SectionHead
            pill="🤖 AI Integration"
            pillColor="amber"
            title={<>Powered by <em style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Claude</em></>}
            sub="We've embedded Anthropic's Claude directly into the course creation pipeline. Lecturers write lesson content — Claude instantly generates contextual, adaptive quiz questions tailored to each lesson."
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
            {/* Claude card */}
            <div style={{
              background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
              border: '2px solid rgba(217,119,6,0.2)', borderRadius: '24px',
              padding: '40px 36px', position: 'relative', overflow: 'hidden',
            }}>
              <Blob top="-40px" right="-40px" color="rgba(245,158,11,0.12)" size={200} />

              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
                <ClaudeMark size={48} />
                <div>
                  <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '1.3rem', color: '#0f0720' }}>Claude AI</div>
                  <div style={{ fontSize: '0.75rem', color: '#d97706', fontWeight: 500 }}>by Anthropic</div>
                </div>
              </div>

              {/* Simulated quiz generation */}
              <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '12px', padding: '20px', marginBottom: '20px', border: '1px solid rgba(217,119,6,0.15)' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#d97706', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  📖 Lesson Content Input
                </div>
                <p style={{ fontSize: '0.8rem', color: '#6b5b3a', lineHeight: 1.7, fontStyle: 'italic' }}>
                  "CSS Flexbox allows you to create responsive layouts by distributing space along a main axis and cross axis..."
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <div style={{ flex: 1, height: '1px', background: 'rgba(217,119,6,0.2)' }} />
                <div style={{ fontSize: '0.7rem', color: '#d97706', fontWeight: 600 }}>Claude generates ↓</div>
                <div style={{ flex: 1, height: '1px', background: 'rgba(217,119,6,0.2)' }} />
              </div>

              <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '12px', padding: '20px', border: '1px solid rgba(217,119,6,0.15)' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 600, color: '#7c3aed', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  ⚔ Boss Battle Quiz
                </div>
                <p style={{ fontSize: '0.82rem', color: '#0f0720', fontWeight: 600, marginBottom: '12px', lineHeight: 1.5 }}>
                  Which CSS property defines the direction of the main axis in Flexbox?
                </p>
                {['flex-direction', 'flex-wrap', 'align-items', 'justify-content'].map((opt, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '7px 12px', borderRadius: '8px', marginBottom: '6px',
                    background: i === 0 ? 'rgba(34,197,94,0.1)' : 'rgba(0,0,0,0.03)',
                    border: `1px solid ${i === 0 ? 'rgba(34,197,94,0.3)' : 'rgba(0,0,0,0.06)'}`,
                    fontSize: '0.75rem', color: i === 0 ? '#059669' : '#8a7aaa',
                    fontWeight: i === 0 ? 600 : 400,
                  }}>
                    <span style={{ width: '20px', height: '20px', borderRadius: '4px', background: i === 0 ? 'rgba(34,197,94,0.15)' : 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: i === 0 ? '#059669' : '#c4b8e0', flexShrink: 0 }}>
                      {['A','B','C','D'][i]}
                    </span>
                    {opt}
                    {i === 0 && <span style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>✓</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Right text */}
            <div>
              {[
                { icon: '📝', title: 'Lecturer writes lesson', body: 'Lecturers focus on what they know — the content. They write the lesson, Claude handles the assessment.' },
                { icon: '🧠', title: 'Claude reads & understands', body: 'Claude\'s language model reads the lesson content and identifies key concepts worth testing.' },
                { icon: '⚡', title: 'Quiz generated instantly', body: '4 multiple-choice questions with correct answers appear immediately — no manual quiz writing ever.' },
                { icon: '🎯', title: 'Adaptive difficulty', body: 'The final "Dragon" boss gets harder questions because Claude generates more questions for that lesson.' },
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '20px', marginBottom: '28px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.3rem', background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)',
                    border: '1px solid rgba(124,58,237,0.15)',
                  }}>
                    {step.icon}
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.95rem', color: '#0f0720', marginBottom: '5px' }}>{step.title}</div>
                    <p style={{ fontSize: '0.82rem', color: '#8a7aaa', lineHeight: 1.7 }}>{step.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── GAMIFICATION SECTION ── */}
      <section style={{ background: '#fff', padding: '96px 32px', position: 'relative', overflow: 'hidden' }}>
        <Blob top="-80px" left="-80px" color="rgba(217,70,239,0.1)" size={500} />

        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <SectionHead
            center
            pill="🎮 Gamification"
            pillColor="pink"
            title={<>Why <em style={{ background: 'linear-gradient(135deg, #7c3aed, #d946ef)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>gamification</em> works</>}
            sub="Traditional education loses students because it lacks immediate feedback, stakes, and reward. Games don't have that problem. We stole the best parts."
          />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '64px' }}>
            {[
              { icon: '❤️', title: 'Health System', body: 'Wrong answers cost HP. Right answers drain the boss. Real stakes make students actually think before clicking.', color: '#d946ef' },
              { icon: '⏱️', title: '15-Second Timer', body: 'Time pressure activates the brain\'s focus. Students can\'t passively scroll — they have to engage.', color: '#7c3aed' },
              { icon: '🗺️', title: 'Roadmap Unlock', body: 'Seeing the next lesson locked creates genuine motivation to complete the current one first.', color: '#d97706' },
              { icon: '🐉', title: 'The Dragon Boss', body: 'The final lesson becomes a legendary challenge. Students actually talk about "slaying the dragon" together.', color: '#d946ef' },
              { icon: '⚡', title: 'XP & Levelling', body: 'Every battle awards XP. Levels increase. A visible progression system makes small wins feel big.', color: '#7c3aed' },
              { icon: '🏆', title: 'Completion Certificate', body: 'Slay the dragon, earn the certificate. A meaningful reward tied to a memorable moment.', color: '#d97706' },
            ].map((card, i) => (
              <div key={i} style={{
                padding: '28px 24px',
                background: 'linear-gradient(160deg, #fff 0%, #f8f4ff 100%)',
                border: '1px solid rgba(124,58,237,0.1)', borderRadius: '20px',
                boxShadow: '0 2px 16px rgba(124,58,237,0.06)',
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '14px', marginBottom: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem',
                  background: `linear-gradient(135deg, ${card.color}14, ${card.color}24)`,
                  border: `1px solid ${card.color}28`,
                }}>
                  {card.icon}
                </div>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#0f0720', marginBottom: '10px' }}>
                  {card.title}
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#8a7aaa', lineHeight: 1.7 }}>{card.body}</p>
              </div>
            ))}
          </div>

          {/* Research callout */}
          <div style={{
            padding: '40px 44px', borderRadius: '24px',
            background: 'linear-gradient(135deg, #ede8ff 0%, #fce8ff 100%)',
            border: '1px solid rgba(124,58,237,0.15)',
            display: 'flex', alignItems: 'center', gap: '40px', flexWrap: 'wrap',
          }}>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '3rem', lineHeight: 1, background: 'linear-gradient(135deg, #7c3aed, #d946ef)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '8px' }}>
                89%
              </div>
              <p style={{ fontSize: '0.85rem', color: '#7c6a9a', lineHeight: 1.7 }}>
                of students say they feel more motivated when learning involves game elements, according to a 2023 edtech study.
              </p>
            </div>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '3rem', lineHeight: 1, background: 'linear-gradient(135deg, #d97706, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '8px' }}>
                3×
              </div>
              <p style={{ fontSize: '0.85rem', color: '#7c6a9a', lineHeight: 1.7 }}>
                Higher knowledge retention when content is delivered through active recall challenges versus passive reading.
              </p>
            </div>
            <div style={{ flex: 1, minWidth: '240px' }}>
              <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: '3rem', lineHeight: 1, background: 'linear-gradient(135deg, #d946ef, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: '8px' }}>
                60%
              </div>
              <p style={{ fontSize: '0.85rem', color: '#7c6a9a', lineHeight: 1.7 }}>
                Course completion rate improvement when time-pressure mechanics are added to assessments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ background: 'linear-gradient(180deg, #f4f0ff 0%, #fce8ff 100%)', padding: '96px 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <SectionHead
            center
            pill="📍 The Journey"
            pillColor="violet"
            title={<>From zero to <em style={{ background: 'linear-gradient(135deg, #7c3aed, #d946ef)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>dragon slayer</em></>}
            sub="Six steps. One platform. Real results."
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0', position: 'relative' }}>
            {/* Connector line */}
            <div style={{ position: 'absolute', top: '40px', left: '16.66%', right: '16.66%', height: '2px', background: 'linear-gradient(90deg, #7c3aed, #d946ef)', opacity: 0.25, zIndex: 0 }} />

            {[
              { num: '01', icon: '📚', title: 'Enroll', body: 'Browse published courses. Hit enroll — it\'s free. No payment barriers.' },
              { num: '02', icon: '📖', title: 'Read the Lesson', body: 'Each lesson has rich content written by expert lecturers, powered by AI tools.' },
              { num: '03', icon: '⚔', title: 'Enter Battle', body: 'Face the boss quiz. 4 options, 15 seconds, real stakes. Answer right — boss loses HP.' },
              { num: '04', icon: '🗺️', title: 'Unlock Roadmap', body: 'Beat the boss and the next lesson unlocks on your visual roadmap.' },
              { num: '05', icon: '🔁', title: 'Repeat', body: 'Three lessons per course. Each one a new battle, a new boss, harder each time.' },
              { num: '06', icon: '🐉', title: 'Slay the Dragon', body: 'The final lesson is the Dragon. Defeat it, get your certificate, level up forever.' },
            ].map((step, i) => (
              <div key={i} style={{
                padding: '32px 24px', textAlign: 'center', position: 'relative', zIndex: 1,
              }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%', margin: '0 auto 20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg, #7c3aed, #d946ef)',
                  boxShadow: '0 8px 24px rgba(124,58,237,0.3)',
                  fontSize: '0.8rem', fontFamily: "'Syne', sans-serif", fontWeight: 800, color: '#fff',
                }}>
                  {step.num}
                </div>
                <div style={{ fontSize: '1.8rem', marginBottom: '12px' }}>{step.icon}</div>
                <h3 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '1rem', color: '#0f0720', marginBottom: '10px' }}>
                  {step.title}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#8a7aaa', lineHeight: 1.7 }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BECOME A LECTURER ── */}
      <section style={{ background: '#fff', padding: '96px 32px', position: 'relative', overflow: 'hidden' }}>
        <Blob top="0" right="0" color="rgba(124,58,237,0.07)" size={600} />
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div>
            <Pill color="violet">🏫 Lecturers</Pill>
            <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(2rem, 3.5vw, 2.8rem)', letterSpacing: '-0.03em', color: '#0f0720', lineHeight: 1.1, margin: '16px 0 20px' }}>
              Your knowledge.<br />
              <span style={{ background: 'linear-gradient(135deg, #7c3aed, #d946ef)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                Supercharged by AI.
              </span>
            </h2>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.8, color: '#8a7aaa', marginBottom: '32px' }}>
              Create a course in minutes. Write your lessons — Claude generates the quizzes automatically. Your content becomes an adventure students actually want to complete.
            </p>
            {['No quiz writing — Claude handles it', '3 lessons per course keeps it focused', 'AI boss fights keep students engaged', 'Full analytics on student progress'].map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #d946ef)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#fff', fontSize: '0.65rem', fontWeight: 700 }}>✓</span>
                </div>
                <span style={{ fontSize: '0.85rem', color: '#3d2f5a', fontWeight: 500 }}>{b}</span>
              </div>
            ))}
            <Link href="/signup" style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              marginTop: '28px', fontWeight: 600, fontSize: '0.9rem', padding: '14px 30px',
              background: 'linear-gradient(135deg, #7c3aed, #d946ef)', color: '#fff',
              borderRadius: '999px', textDecoration: 'none',
              boxShadow: '0 8px 32px rgba(124,58,237,0.35)',
            }}>
              Apply as Lecturer →
            </Link>
          </div>

          {/* Visual mock */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', borderRadius: '20px', padding: '28px', border: '1px solid rgba(124,58,237,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f87171' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fbbf24' }} />
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#34d399' }} />
                <span style={{ fontSize: '0.72rem', color: '#7c6a9a', marginLeft: '8px', fontFamily: "'Plus Jakarta Sans', monospace" }}>Create Course</span>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.7)', borderRadius: '10px', padding: '16px', marginBottom: '12px' }}>
                <div style={{ fontSize: '0.7rem', color: '#a855f7', fontWeight: 600, marginBottom: '8px' }}>Lesson 1 — Introduction</div>
                <div style={{ fontSize: '0.75rem', color: '#6b5b8a', lineHeight: 1.6 }}>CSS Flexbox allows you to create one-dimensional layouts. The flex container uses the display: flex property...</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.7rem', color: '#d97706', fontWeight: 600 }}>🤖 Claude is generating quiz...</span>
                <div style={{ display: 'flex', gap: '3px' }}>
                  {[0, 1, 2].map(i => (
                    <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#d97706', animation: `bounce 1s ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', borderRadius: '20px', padding: '24px', border: '1px solid rgba(217,119,6,0.2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <ClaudeMark size={28} />
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#0f0720' }}>Quiz generated ✓</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b5b3a', lineHeight: 1.6 }}>
                5 questions created • Correct answers set • Boss battle ready
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '96px 32px', background: 'linear-gradient(135deg, #ede8ff 0%, #fce8ff 100%)', position: 'relative', overflow: 'hidden' }}>
        <Blob top="0" left="50%" color="rgba(124,58,237,0.15)" size={600} />
        <div style={{ maxWidth: '640px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🐉</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '-0.03em', color: '#0f0720', lineHeight: 1.1, marginBottom: '20px' }}>
            Ready to{' '}
            <span style={{ background: 'linear-gradient(135deg, #7c3aed, #d946ef)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              slay your first dragon?
            </span>
          </h2>
          <p style={{ fontSize: '1rem', color: '#8a7aaa', lineHeight: 1.8, marginBottom: '36px' }}>
            Join the future of education. Free to enroll. Powered by AI. Proven by battle.
          </p>
          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" style={{ fontWeight: 600, fontSize: '0.95rem', padding: '15px 36px', background: 'linear-gradient(135deg, #7c3aed, #d946ef)', color: '#fff', borderRadius: '999px', textDecoration: 'none', boxShadow: '0 8px 32px rgba(124,58,237,0.4)' }}>
              ⚔ Start for Free
            </Link>
            <Link href="/tutorBoss/demo2" style={{ fontWeight: 600, fontSize: '0.95rem', padding: '14px 36px', background: 'transparent', color: '#7c3aed', border: '2px solid rgba(124,58,237,0.25)', borderRadius: '999px', textDecoration: 'none' }}>
              🐉 Watch the Demo
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#fff', borderTop: '1px solid rgba(124,58,237,0.08)', padding: '24px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: '0.9rem', color: '#0f0720' }}>
          Macbase<span style={{ background: 'linear-gradient(135deg, #7c3aed, #d946ef)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Dragon</span>Slayer Learner
        </span>
        <span style={{ fontSize: '0.65rem', letterSpacing: '0.08em', color: '#c4b8e0', textTransform: 'uppercase' }}>
          Developed by Daniel Mamphekgo @ MERTCITA HACKATHON
        </span>
      </footer>

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounce { 0%,80%,100% { transform: scale(0); } 40% { transform: scale(1); } }
      `}</style>
    </div>
  );
}