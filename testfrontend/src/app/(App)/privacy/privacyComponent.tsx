'use client';

import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import styles from './privacy.module.scss';

// ── Version history data ─────────────────────────────
interface Change { tag: 'Added' | 'Updated' | 'Removed'; text: string }
interface Version {
	version: string;
	label: 'Current' | 'Archived';
	title: string;
	date: string;
	summary: string;
	changes: Change[];
	retention?: string;
}

const versions: Version[] = [
	{
		version: 'v3.0',
		label: 'Current',
		title: 'Major Revision — POPIA Full Compliance',
		date: 'Effective February 15, 2026',
		summary: 'This is the current active version of the Privacy Policy. Refer to the sections above for the full policy text.',
		changes: [
			{ tag: 'Added', text: 'Full POPIA compliance section and data subject rights' },
			{ tag: 'Added', text: 'Detailed cookie classification and granular management options' },
			{ tag: 'Updated', text: 'Data retention periods clarified (account: 3 yrs post-deletion, payments: 7 yrs)' },
			{ tag: 'Updated', text: 'Third-party data processors list refreshed' },
			{ tag: 'Removed', text: 'Legacy Flash-cookie references (no longer applicable)' },
		],
	},
	{
		version: 'v2.1',
		label: 'Archived',
		title: 'Analytics & Instructor Data Sharing Update',
		date: 'Effective August 1, 2025',
		summary: 'Version 2.1 updated how we share learner enrollment data with instructors and introduced clearer opt-out controls for analytics tracking.',
		changes: [
			{ tag: 'Added', text: 'Instructor data access limited to aggregated enrollment metrics by default' },
			{ tag: 'Updated', text: 'Analytics opt-out mechanism moved to Account Settings' },
			{ tag: 'Updated', text: 'Payment method details clarified as tokenized and inaccessible to instructors' },
		],
		retention: 'Account data retained 2 years post-deletion. Payment records retained 5 years per financial regulations.',
	},
	{
		version: 'v2.0',
		label: 'Archived',
		title: 'GDPR Alignment & Cookie Consent Overhaul',
		date: 'Effective January 10, 2024',
		summary: 'A comprehensive rewrite to align with GDPR and prepare for POPIA compliance. Introduced the cookie consent banner and expanded user rights sections.',
		changes: [
			{ tag: 'Added', text: 'Cookie consent banner with granular controls' },
			{ tag: 'Added', text: 'Right to data portability and erasure ("right to be forgotten")' },
			{ tag: 'Updated', text: 'Legal basis for each processing category now documented' },
			{ tag: 'Updated', text: 'Privacy contact changed to a dedicated DPO email' },
			{ tag: 'Removed', text: 'Blanket consent clause — replaced with purpose-specific consents' },
		],
		retention: 'Account data retained for 2 years post-deletion. Payment records retained 5 years.',
	},
	{
		version: 'v1.0',
		label: 'Archived',
		title: 'Initial Privacy Policy — Platform Launch',
		date: 'Effective March 12, 2022',
		summary: 'The original IvyLearner Privacy Policy published at launch. Covered basic data collection practices for a beta-stage product.',
		changes: [
			{ tag: 'Added', text: 'Name, email, password (hashed), course progress collection' },
			{ tag: 'Added', text: 'Third-party sharing: PayFast (payments) and Mailchimp (email)' },
			{ tag: 'Added', text: 'Session authentication cookies only — no analytics cookies' },
		],
		retention: 'Data retained indefinitely during active account period, deleted within 90 days of account deletion request.',
	},
];

// ── Current policy sections ──────────────────────────
const policySections = [
	{
		num: '01',
		title: 'Information We Collect',
		items: [
			{ label: 'Account Data', detail: 'Name, email address, password (hashed), profile photo' },
			{ label: 'Learning Data', detail: 'Course progress, quiz scores, certificates, bookmarks' },
			{ label: 'Payment Data', detail: 'Billing address, last 4 digits of card — full card data handled by payment processors only' },
			{ label: 'Usage Data', detail: 'Pages visited, time spent, device type, browser, IP address' },
			{ label: 'Communications', detail: 'Support messages, course reviews, forum posts' },
		],
	},
	{
		num: '02',
		title: 'How We Use Your Data',
		bullets: [
			'Providing, maintaining, and improving the IvyLearner platform',
			'Personalizing your learning experience and recommendations',
			'Processing payments and sending receipts',
			'Sending course updates, certificates, and product announcements (opt-out available)',
			'Analytics to understand usage patterns and improve services',
			'Fraud prevention and platform security',
		],
	},
	{
		num: '03',
		title: 'Data Sharing',
		note: 'We do not sell your personal data.',
		bullets: [
			'Instructors: Limited enrollment data to facilitate teaching (no payment info)',
			'Service Providers: Cloud hosting, payment processors, email delivery, analytics — all bound by data processing agreements',
			'Legal Compliance: When required by law, court order, or to protect our rights',
		],
	},
	{
		num: '04',
		title: 'Your Rights (POPIA & GDPR)',
		items: [
			{ label: 'Access', detail: 'Request a copy of the personal data we hold about you' },
			{ label: 'Correction', detail: 'Update or correct inaccurate data' },
			{ label: 'Deletion', detail: 'Request deletion of your account and associated data' },
			{ label: 'Portability', detail: 'Export your learning data in a machine-readable format' },
			{ label: 'Objection', detail: 'Opt out of marketing communications at any time' },
			{ label: 'Complaint', detail: 'Lodge a complaint with your local data protection authority' },
		],
		footer: 'To exercise any of these rights, email privacy@ivylearner.com',
	},
	{
		num: '05',
		title: 'Cookies & Tracking',
		note: 'We use cookies for authentication, preferences, and analytics. Manage your preferences via our cookie banner or browser settings.',
		items: [
			{ label: 'Essential Cookies', detail: 'Required for the platform to function — cannot be disabled' },
			{ label: 'Analytics Cookies', detail: 'Help us understand usage patterns (can be disabled in settings)' },
			{ label: 'Marketing Cookies', detail: 'Used for targeted ads on third-party platforms (opt-out available)' },
		],
	},
];

const tagColor: Record<string, string> = {
	Added: '#d1fae5',
	Updated: '#dbeafe',
	Removed: '#fef9c3',
};
const tagTextColor: Record<string, string> = {
	Added: '#065f46',
	Updated: '#1e40af',
	Removed: '#713f12',
};

const PrivacyComponent = () => {
	const [openIndex, setOpenIndex] = useState<number>(0);

	const toggle = (i: number) => setOpenIndex(openIndex === i ? -1 : i);

	return (
		<div className={styles.wrapper}>
			{/* Hero */}
			<section className={styles.hero}>
				<Container>
					<span className={styles.badge}>🔒 Privacy</span>
					<h1>Privacy <span>Policy</span></h1>
					<p>Your privacy matters deeply to us. This policy explains what data we collect, how we use it, and the rights you have over your personal information.</p>
					<div className={styles.metaLine}>
						Current Version: <span>v3.0</span> &nbsp;·&nbsp; Effective: <span>February 15, 2026</span>
					</div>
				</Container>
			</section>

			<section className={styles.section}>
				<Container className={styles.narrowContainer}>

					{/* Current policy */}
					<span className={styles.sectionLabel}>Current Policy (v3.0)</span>
					<div className={styles.divider} />
					<h2 className={styles.sectionTitle}>What We Collect &amp; Why</h2>
					<p className={styles.subDesc}>IvyLearner is committed to protecting your personal data in accordance with POPIA and applicable international privacy standards.</p>

					{policySections.map((s) => (
						<div key={s.num} className={styles.legalCard}>
							<div className={styles.cardNumber}>{s.num}</div>
							<h3>{s.title}</h3>
							{s.note && <p className={styles.noteText}><strong>{s.note}</strong></p>}
							{s.items && (
								<ul className={styles.labeledList}>
									{s.items.map((item) => (
										<li key={item.label}><strong>{item.label}:</strong> {item.detail}</li>
									))}
								</ul>
							)}
							{s.bullets && (
								<ul>
									{s.bullets.map((b) => <li key={b}>{b}</li>)}
								</ul>
							)}
							{s.footer && (
								<p className={styles.footerNote}>{s.footer}</p>
							)}
						</div>
					))}

					{/* Version History Accordion */}
					<div className={styles.versionSection}>
						<span className={styles.sectionLabel}>Policy History</span>
						<div className={styles.divider} />
						<h2 className={styles.sectionTitle}>Previous Policy Versions</h2>
						<p className={styles.subDesc}>Expand any version below to read the policy as it existed at that time.</p>

						<div className={styles.accordion}>
							{versions.map((v, i) => (
								<div key={v.version} className={styles.accordionItem}>
									<button
										className={`${styles.accordionHeader} ${openIndex === i ? styles.open : ''}`}
										onClick={() => toggle(i)}
									>
										<div className={styles.headerMeta}>
											<span className={`${styles.versionBadge} ${v.label === 'Current' ? styles.current : styles.archived}`}>
												{v.version} — {v.label}
											</span>
											<div>
												<div className={styles.versionTitle}>{v.title}</div>
												<div className={styles.versionDate}>{v.date}</div>
											</div>
										</div>
										<span className={`${styles.chevron} ${openIndex === i ? styles.chevronOpen : ''}`}>▾</span>
									</button>

									{openIndex === i && (
										<div className={styles.accordionBody}>
											<p className={styles.versionSummary}>{v.summary}</p>
											<h5>Key Changes</h5>
											<ul className={styles.changeList}>
												{v.changes.map((c, ci) => (
													<li key={ci}>
														<span
															className={styles.changeTag}
															style={{ background: tagColor[c.tag], color: tagTextColor[c.tag] }}
														>
															{c.tag}
														</span>
														{c.text}
													</li>
												))}
											</ul>
											{v.retention && (
												<>
													<h5>Data Retention</h5>
													<p>{v.retention}</p>
												</>
											)}
											{v.label === 'Archived' && (
												<p className={styles.archivedNote}>This version is archived for transparency purposes only and is no longer in effect.</p>
											)}
										</div>
									)}
								</div>
							))}
						</div>
					</div>

				</Container>
			</section>
		</div>
	);
};

export default PrivacyComponent;
