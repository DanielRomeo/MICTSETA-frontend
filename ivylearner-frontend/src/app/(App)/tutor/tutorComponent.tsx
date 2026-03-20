'use client';

import { Metadata } from 'next';
import ModernNavbar from '../_components/MainNavbar';
import MainFooter from '../_components/MainFooter';
import React, { useState } from 'react';
import styles from '../_styles/tutorComponent.module.scss'

const TutorComponent = () => {
	const [email, setEmail] = useState('');
	const [submitted, setSubmitted] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email || !email.includes('@')) {
			setError('Please enter a valid email address.');
			return;
		}
		setLoading(true);
		setError('');

		// TODO: wire up to your backend / mailing list
		await new Promise((res) => setTimeout(res, 1200));

		setLoading(false);
		setSubmitted(true);
	};

	const perks = [
		{
			icon: '✦',
			title: 'Set Your Own Schedule',
			desc: 'Teach when you want. Full flexibility — mornings, evenings, weekends.',
		},
		{
			icon: '◈',
			title: 'Earn Competitively',
			desc: 'Keep the majority of what you charge. Transparent, fair payouts.',
		},
		{
			icon: '❋',
			title: 'Reach More Students',
			desc: 'Tap into Ivy Brilliances growing network of ambitious learners.',
		},
		{
			icon: '⬡',
			title: 'Grow Your Brand',
			desc: 'Build a reputation, earn reviews, and become a top-tier tutor.',
		},
	];

	return (
		<div className={styles.wrapper}>
			{/* Decorative blobs */}
			<div className={styles.blob1} />
			<div className={styles.blob2} />
			<div className={styles.blob3} />

			{/* Nav */}
			<nav className={styles.nav}>
				<span className={styles.logo}>
					ivy<span>brilliance</span>
				</span>
				<span className={styles.navBadge}>Tutor Portal</span>
			</nav>

			{/* Hero */}
			<section className={styles.hero}>
				<div className={styles.heroInner}>
					<p className={styles.eyebrow}>— IvyBrilliance · Tutor Program</p>
					<h1 className={styles.headline}>
						EARN MONEY SHARING YOUR KNOWLEDGE!
						<br />
						<span className={styles.gradientText}>IVYBRILLIANCE TUTORING.</span>
					</h1>
					<p className={styles.subheadline}>
						We're building a world-class tutor marketplace at{' '}
						<strong>academy.ivybrilliance.com</strong> — and we want exceptional
						educators like you on board from day one.
					</p>

					{!submitted ? (
						<form className={styles.form} onSubmit={handleSubmit}>
							<div className={styles.inputRow}>
								<input
									type="email"
									placeholder="your@email.com"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className={styles.emailInput}
									disabled={loading}
								/>
								<button
									type="submit"
									className={styles.submitBtn}
									disabled={loading}
								>
									{loading ? (
										<span className={styles.spinner} />
									) : (
										'Join the Waitlist →'
									)}
								</button>
							</div>
							{error && <p className={styles.errorMsg}>{error}</p>}
							<p className={styles.formNote}>
								No spam. We'll reach out when the platform is ready.
							</p>
						</form>
					) : (
						<div className={styles.successCard}>
							<div className={styles.successIcon}>✓</div>
							<h3>You're on the list!</h3>
							<p>
								We'll be in touch at <strong>{email}</strong> with everything you
								need to get started.
							</p>
						</div>
					)}
				</div>

				{/* Floating stat chips */}
				{/* <div className={styles.statsRow}>
					{[
						{ num: '10K+', label: 'Students incoming' },
						{ num: '100%', label: 'Schedule freedom' },
						{ num: '★ 4.9', label: 'Avg tutor rating' },
					].map((s, i) => (
						<div key={i} className={styles.statChip}>
							<span className={styles.statNum}>{s.num}</span>
							<span className={styles.statLabel}>{s.label}</span>
						</div>
					))}
				</div> */}
			</section>

			{/* Perks grid */}
			<section className={styles.perksSection}>
				<div className={styles.sectionLabel}>Why teach with us</div>
				<h2 className={styles.sectionTitle}>Everything you need to thrive</h2>
				<div className={styles.perksGrid}>
					{perks.map((p, i) => (
						<div key={i} className={styles.perkCard}>
							<div className={styles.perkIcon}>{p.icon}</div>
							<h3 className={styles.perkTitle}>{p.title}</h3>
							<p className={styles.perkDesc}>{p.desc}</p>
						</div>
					))}
				</div>
			</section>

			{/* CTA band */}
			<section className={styles.ctaBand}>
				<div className={styles.ctaInner}>
					<h2>Ready to inspire?</h2>
					<p>Drop your email above and be among the first tutors on the platform.</p>
				</div>
				<div className={styles.ctaDeco}>✦</div>
			</section>

			{/* Footer */}
			<footer className={styles.footer}>
				<span>© {new Date().getFullYear()}Academy - Ivy Brilliance</span>
				<span>academy.ivybrilliance.com</span>
			</footer>
		</div>
	);
};

export default TutorComponent;