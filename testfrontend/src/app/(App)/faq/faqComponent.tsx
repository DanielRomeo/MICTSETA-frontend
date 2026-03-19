'use client';

import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import Link from 'next/link';
import styles from './faq.module.scss';

interface FaqItem {
	q: string;
	a: string;
}

interface FaqCategory {
	icon: string;
	title: string;
	items: FaqItem[];
}

const faqData: FaqCategory[] = [
	{
		icon: '🚀',
		title: 'Getting Started',
		items: [
			{
				q: 'How do I create an IvyLearner account?',
				a: 'Click the "Get Started" button in the top navigation. You can sign up using your email address or sign in with Google. Once registered, you\'ll receive a verification email — click the link to activate your account and start learning immediately.',
			},
			{
				q: 'Is IvyLearner free to use?',
				a: 'IvyLearner offers both free and paid courses. You can browse all courses without an account. Many courses have free preview lessons. Paid courses require enrollment, and pricing is displayed on each course page. We regularly run promotions — follow us on social media to stay updated.',
			},
			{
				q: 'Can I access IvyLearner on mobile?',
				a: 'Yes! IvyLearner is fully responsive and works on all modern browsers on mobile and tablet. We\'re also working on a dedicated mobile app — stay tuned for announcements.',
			},
		],
	},
	{
		icon: '📖',
		title: 'Courses & Learning',
		items: [
			{
				q: 'Do I get lifetime access to courses I purchase?',
				a: 'Yes. Once you purchase a course, you have access to it for as long as IvyLearner operates and the course remains available on the platform. This includes all future updates the instructor makes to the course content.',
			},
			{
				q: 'Will I receive a certificate upon completion?',
				a: 'Yes! Upon completing all required lessons and assessments, you\'ll be issued a digital certificate of completion. Certificates include your name, course title, completion date, and a verification code. You can share certificates directly to LinkedIn or download them as PDF.',
			},
			{
				q: 'Can I download course videos for offline viewing?',
				a: 'Offline downloads are available on select courses as marked. Most content is streamed through the platform. We\'re expanding offline capabilities in our upcoming mobile app.',
			},
			{
				q: 'How do I contact my instructor?',
				a: 'Each course has a Q&A section where you can post questions directly to the instructor and community. Instructors typically respond within 48 hours. For urgent matters, use the platform\'s direct message feature available to enrolled students.',
			},
		],
	},
	{
		icon: '💳',
		title: 'Billing & Payments',
		items: [
			{
				q: 'What payment methods do you accept?',
				a: 'We accept Visa, Mastercard, American Express, PayPal, and EFT/bank transfer for South African users. We also support popular African mobile money platforms. All transactions are secured with 256-bit SSL encryption.',
			},
			{
				q: 'How do I request a refund?',
				a: 'We offer a 30-day refund guarantee on most courses, provided you\'ve consumed less than 30% of the content and haven\'t received a certificate. To request a refund, go to My Purchases in your account dashboard and click "Request Refund." Refunds are typically processed within 5–10 business days.',
			},
			{
				q: 'Do prices include VAT?',
				a: 'Prices displayed in South African Rand (ZAR) include 15% VAT. For international purchases, local taxes may apply and will be shown at checkout before payment is confirmed.',
			},
		],
	},
	{
		icon: '🎓',
		title: 'Becoming an Instructor',
		items: [
			{
				q: 'How do I become an instructor on IvyLearner?',
				a: 'Apply through the "Teach on IvyLearner" page. Our team reviews your application within 5 business days. We look for domain expertise, teaching ability, and commitment to quality. Once approved, you\'ll get access to our Instructor Studio to create and upload courses.',
			},
			{
				q: 'How does instructor revenue sharing work?',
				a: 'Instructors earn a percentage of each sale from their courses. The exact revenue share depends on whether the purchase was organic (student found you via search) or via an IvyLearner promotion. Full details are in the Instructor Agreement shared during onboarding.',
			},
		],
	},
];

const FaqComponent = () => {
	// Track open question per category: { categoryIndex: questionIndex | -1 }
	const [openMap, setOpenMap] = useState<Record<number, number>>({});

	const toggle = (catIdx: number, qIdx: number) => {
		setOpenMap((prev) => ({
			...prev,
			[catIdx]: prev[catIdx] === qIdx ? -1 : qIdx,
		}));
	};

	return (
		<div className={styles.wrapper}>
			{/* Hero */}
			<section className={styles.hero}>
				<Container>
					<span className={styles.badge}>❓ Help Center</span>
					<h1>How Can We <span>Help You?</span></h1>
					<p>Find quick answers to common questions about courses, payments, accounts, and more.</p>
				</Container>
			</section>

			<section className={styles.section}>
				<Container className={styles.narrowContainer}>

					{faqData.map((cat, catIdx) => (
						<div key={cat.title} className={styles.category}>
							<div className={styles.categoryTitle}>
								<div className={styles.catIcon}>{cat.icon}</div>
								{cat.title}
							</div>

							{cat.items.map((item, qIdx) => {
								const isOpen = openMap[catIdx] === qIdx;
								return (
									<div key={item.q} className={styles.faqItem}>
										<button
											className={`${styles.question} ${isOpen ? styles.open : ''}`}
											onClick={() => toggle(catIdx, qIdx)}
										>
											<span>{item.q}</span>
											<span className={`${styles.icon} ${isOpen ? styles.iconOpen : ''}`}>▾</span>
										</button>
										{isOpen && (
											<div className={styles.answer}>{item.a}</div>
										)}
									</div>
								);
							})}
						</div>
					))}

					{/* CTA */}
					<div className={styles.ctaBox}>
						<h4>Still have questions?</h4>
						<p>Our support team is happy to help with anything not covered here.</p>
						<Link href="/contact" className={styles.ctaBtn}>🎧 Contact Support</Link>
					</div>

				</Container>
			</section>
		</div>
	);
};

export default FaqComponent;
