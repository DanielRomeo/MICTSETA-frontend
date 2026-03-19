'use client';

import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Link from 'next/link';
import styles from './about.module.scss';

const stats = [
	{ number: '50K+', label: 'Active Learners' },
	{ number: '1,200+', label: 'Expert Courses' },
	{ number: '340+', label: 'Instructors' },
	{ number: '98%', label: 'Satisfaction Rate' },
];

const values = [
	{
		icon: '⚡',
		title: 'Outcome-Focused',
		desc: 'We design every feature around one thing: your success. From adaptive quizzes to project-based assessments, we build tools that help knowledge stick.',
	},
	{
		icon: '🛡️',
		title: 'Quality Verified',
		desc: 'Every instructor goes through a rigorous onboarding process. Only the best, most impactful content makes it to our learners.',
	},
	{
		icon: '🌍',
		title: 'Globally Inclusive',
		desc: 'Affordable pricing, regional payment support, and multilingual content ensure IvyBrilliance serves every learner fairly.',
	},
];

const team = [
	{ emoji: '🧠', name: 'Tetelo Hamese', role: 'Co-Founder & CEO', bio: 'Former educator turned EdTech entrepreneur. Passionate about democratizing high-quality learning.' },
	{ emoji: '⚙️', name: 'Daniel Mamphekgo', role: 'Co-Founder & CTO', bio: 'Full-stack engineer with a love for scalable systems. Leads our engineering guild with precision.' },
	// { emoji: '🎨', name: 'Noah Osei', role: 'Head of Design', bio: 'Crafts experiences that feel effortless. Believes great design is invisible but deeply felt.' },
	// { emoji: '📊', name: 'Sara Kim', role: 'Head of Curriculum', bio: '10+ years in instructional design. Ensures every course on IvyBrilliance delivers real value.' },
];

const AboutComponent = () => {
	return (
		<div className={styles.wrapper}>
			{/* Hero */}
			<section className={styles.hero}>
				<Container>
					<span className={styles.badge}>🌿 Our Story</span>
					<h1>Empowering Learners<br /><span>Across the Globe</span></h1>
					<p>IvyBrilliance was built with one belief: world-class education should be accessible to everyone, everywhere — not just the privileged few.</p>
				</Container>
			</section>

			{/* Stats */}
			<section className={`${styles.section} ${styles.altBg}`}>
				<Container>
					<Row className="g-4">
						{stats.map((s) => (
							<Col key={s.label} xs={6} md={3}>
								<div className={styles.statCard}>
									<div className={styles.statNumber}>{s.number}</div>
									<div className={styles.statLabel}>{s.label}</div>
								</div>
							</Col>
						))}
					</Row>
				</Container>
			</section>

			{/* Mission */}
			<section className={styles.section}>
				<Container>
					<Row className="g-5 align-items-center">
						<Col lg={6}>
							<span className={styles.sectionLabel}>Our Mission</span>
							<div className={styles.divider} />
							<h2 className={styles.sectionTitle}>Learning Without Limits</h2>
							<p className={styles.body}>IvyBrilliance started in 2022 when a group of educators and technologists came together, frustrated by the gap between quality education and accessibility. We set out to build a platform where instructors could share their expertise and learners could grow — regardless of geography or budget.</p>
							<p className={styles.body}>Today, we serve learners across 60+ countries with courses spanning technology, business, design, health, and more. Every course on IvyBrilliance is created by vetted, passionate experts who care about genuine learning outcomes.</p>
						</Col>
						<Col lg={6}>
							{values.map((v) => (
								<div key={v.title} className={styles.valuePill}>
									<div className={styles.valueIcon}>{v.icon}</div>
									<div>
										<h5>{v.title}</h5>
										<p>{v.desc}</p>
									</div>
								</div>
							))}
						</Col>
					</Row>
				</Container>
			</section>

			{/* Team */}
			<section className={`${styles.section} ${styles.altBg}`}>
				<Container>
					<div className={styles.centeredHeader}>
						<span className={styles.sectionLabel}>The People</span>
						<div className={`${styles.divider} ${styles.centered}`} />
						<h2 className={styles.sectionTitle}>Meet Our Core Team</h2>
					</div>
					<Row className="g-4">
						{team.map((t) => (
							<Col key={t.name} sm={12} lg={6}>
								<div className={styles.teamCard}>
									<div className={styles.teamAvatar}>{t.emoji}</div>
									<div className={styles.teamBody}>
										<h4>{t.name}</h4>
										<div className={styles.teamRole}>{t.role}</div>
										<p>{t.bio}</p>
									</div>
								</div>
							</Col>
						))}
					</Row>
				</Container>
			</section>

			{/* CTA */}
			<section className={styles.section}>
				<Container>
					<div className={styles.ctaBanner}>
						<h2>Ready to Start Learning?</h2>
						<p>Join 50,000+ learners already growing with IvyBrilliance.</p>
						<Link href="/courses" className={styles.ctaBtn}>Explore Courses →</Link>
					</div>
				</Container>
			</section>
		</div>
	);
};

export default AboutComponent;
