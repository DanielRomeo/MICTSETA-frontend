'use client';

import React from 'react';
import { Container } from 'react-bootstrap';
import styles from './terms.module.scss';

const sections = [
	{
		num: '01',
		title: 'Acceptance of Terms',
		content: (
			<p>By creating an account or using the IvyBrilliance platform, you confirm that you are at least 13 years old (or have parental consent), have read and understood these Terms & Conditions, and agree to be legally bound by them. If you are accessing IvyBrilliance on behalf of an organization, you represent that you have the authority to bind that organization to these terms.</p>
		),
	},
	{
		num: '02',
		title: 'User Accounts & Registration',
		content: (
			<>
				<p>When creating an account, you agree to:</p>
				<ul>
					<li>Provide accurate, current, and complete information</li>
					<li>Maintain the security of your password and account</li>
					<li>Notify us immediately of any unauthorized account access</li>
					<li>Not share your account credentials with any third party</li>
					<li>Accept responsibility for all activities under your account</li>
				</ul>
				<p>IvyBrilliance reserves the right to suspend or terminate accounts that violate these terms or engage in fraudulent, abusive, or harmful behavior.</p>
			</>
		),
	},
	{
		num: '03',
		title: 'Course Enrollment & Access',
		content: (
			<>
				<p>When you enroll in a course:</p>
				<ul>
					<li>You receive a limited, personal, non-transferable license to access and view the course content</li>
					<li>Access is subject to payment where applicable</li>
					<li>Course availability may vary; IvyBrilliance reserves the right to update, revise, or remove course content</li>
					<li>Lifetime access means access for as long as IvyBrilliance operates and the course remains available</li>
					<li>You may not reproduce, distribute, or sublicense any course content</li>
				</ul>
			</>
		),
	},
	{
		num: '04',
		title: 'Payments, Refunds & Pricing',
		content: (
			<>
				<p>All prices are listed in the currency displayed at checkout. Payment is processed securely through our third-party providers. IvyBrilliance offers a <strong>30-day refund policy</strong> for most courses, provided:</p>
				<ul>
					<li>The request is made within 30 days of purchase</li>
					<li>Less than 30% of the course content has been consumed</li>
					<li>The course has not been completed or a certificate issued</li>
				</ul>
				<p>Promotional pricing, bundle discounts, and subscription plans may have separate refund terms disclosed at time of purchase. We reserve the right to change prices at any time.</p>
			</>
		),
	},
	{
		num: '05',
		title: 'Instructor Terms',
		content: (
			<>
				<p>If you create and publish courses on IvyBrilliance, you additionally agree to:</p>
				<ul>
					<li>Own or have rights to all content you upload</li>
					<li>Not upload misleading, plagiarized, or infringing content</li>
					<li>Accept our revenue sharing terms as outlined in the Instructor Agreement</li>
					<li>Respond reasonably to student questions and feedback</li>
					<li>Allow IvyBrilliance to use your course materials for promotional purposes</li>
				</ul>
			</>
		),
	},
	{
		num: '06',
		title: 'Prohibited Conduct',
		content: (
			<>
				<p>You agree not to engage in any of the following:</p>
				<ul>
					<li>Downloading, reproducing, or distributing course materials without authorization</li>
					<li>Using automated tools, bots, or scrapers on our platform</li>
					<li>Harassing, threatening, or abusing other users or instructors</li>
					<li>Submitting false reviews, ratings, or testimonials</li>
					<li>Attempting to gain unauthorized access to IvyBrilliance systems</li>
					<li>Uploading malware, spam, or harmful content</li>
				</ul>
			</>
		),
	},
	{
		num: '07',
		title: 'Intellectual Property',
		content: (
			<p>All content on IvyBrilliance — including platform design, logos, trademarks, and course materials — is the property of IvyBrilliance or its content creators. You may not reproduce, transmit, distribute, or create derivative works without explicit written permission. Instructor content remains the property of the instructor, subject to the licenses granted to IvyBrilliance under the Instructor Agreement.</p>
		),
	},
	{
		num: '08',
		title: 'Limitation of Liability',
		content: (
			<p>IvyBrilliance provides the platform &ldquo;as is&rdquo; without warranties of any kind. To the maximum extent permitted by law, IvyBrilliance shall not be liable for indirect, incidental, special, or consequential damages, including loss of profits, data, or goodwill. Our total liability shall not exceed the amount you paid to IvyBrilliance in the 12 months preceding the claim.</p>
		),
	},
	{
		num: '09',
		title: 'Governing Law & Disputes',
		content: (
			<p>These Terms are governed by the laws of the Republic of South Africa. Any disputes shall be subject to the exclusive jurisdiction of the courts in Pretoria, South Africa. We encourage resolving disputes informally — please contact us at <a href="mailto:legal@IvyBrilliance.co.za">legal@IvyBrilliance.co.za</a> before initiating legal proceedings.</p>
		),
	},
	{
		num: '10',
		title: 'Changes to These Terms',
		content: (
			<p>We may update these Terms from time to time. When we make material changes, we will notify you via email or a prominent notice on the platform at least 14 days before the changes take effect. Continued use of IvyBrilliance after the effective date constitutes acceptance of the revised Terms.</p>
		),
	},
];

const TermsComponent = () => {
	return (
		<div className={styles.wrapper}>
			<section className={styles.hero}>
				<Container>
					<span className={styles.badge}>📜 Legal</span>
					<h1>Terms &amp; <span>Conditions</span></h1>
					<p>Please read these terms carefully before using IvyBrilliance&apos;s platform, services, or content. By accessing IvyBrilliance, you agree to be bound by these terms.</p>
					<div className={styles.metaLine}>
						Last Updated: <span>February 15, 2026</span> &nbsp;·&nbsp; Effective: <span>March 1, 2026</span>
					</div>
				</Container>
			</section>

			<section className={styles.section}>
				<Container className={styles.narrowContainer}>
					{sections.map((s) => (
						<div key={s.num} className={styles.legalCard}>
							<div className={styles.cardNumber}>{s.num}</div>
							<h3>{s.title}</h3>
							<div className={styles.cardContent}>{s.content}</div>
						</div>
					))}

					<div className={styles.contactNote}>
						<p>Questions about these terms? Email us at <a href="mailto:legal@IvyBrilliance.co.za">legal@IvyBrilliance.co.za</a></p>
					</div>
				</Container>
			</section>
		</div>
	);
};

export default TermsComponent;
