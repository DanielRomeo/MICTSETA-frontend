'use client';

import React, { useState } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import styles from './contact.module.scss';

const contactMethods = [
	{ icon: '✉️', title: 'Email Support', detail: 'support@ivylearner.com', href: 'mailto:support@ivylearner.com' },
	{ icon: '💬', title: 'Live Chat', detail: 'Available Mon–Fri, 9am–6pm SAST', href: '#' },
	{ icon: '📱', title: 'WhatsApp', detail: '+27 (0) 12 345 6789', href: '#' },
	{ icon: '📍', title: 'Office', detail: 'Pretoria, South Africa 🇿🇦', href: '#' },
];

const topics = [
	'Course Question',
	'Technical Support',
	'Billing & Payments',
	'Become an Instructor',
	'Partnership Inquiry',
	'Other',
];

const ContactComponent = () => {
	const [submitted, setSubmitted] = useState(false);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setSubmitted(true);
	};

	return (
		<div className={styles.wrapper}>
			{/* Hero */}
			<section className={styles.hero}>
				<Container>
					<span className={styles.badge}>✉️ Get In Touch</span>
					<h1>We&apos;re Here to <span>Help You</span></h1>
					<p>Have a question, concern, or just want to say hi? Our team is ready to assist. Reach out through any of the channels below.</p>
				</Container>
			</section>

			<section className={styles.section}>
				<Container>
					<Row className="g-5">
						{/* Left: contact methods */}
						<Col lg={5}>
							<span className={styles.sectionLabel}>Contact Methods</span>
							<div className={styles.divider} />
							<h2 className={styles.sectionTitle}>Ways to Reach Us</h2>
							<p className={styles.subDesc}>We typically respond within 24 hours on business days.</p>

							{contactMethods.map((m) => (
								<a key={m.title} href={m.href} className={styles.contactMethod}>
									<div className={styles.methodIcon}>{m.icon}</div>
									<div>
										<h5>{m.title}</h5>
										<p>{m.detail}</p>
									</div>
								</a>
							))}

							<div className={styles.socialRow}>
								<p className={styles.socialLabel}>Follow us</p>
								<div className={styles.socials}>
									{['🐦', '💼', '📸', '▶️'].map((s, i) => (
										<a key={i} href="#" className={styles.socialIcon}>{s}</a>
									))}
								</div>
							</div>
						</Col>

						{/* Right: form */}
						<Col lg={7}>
							<div className={styles.formCard}>
								{submitted ? (
									<div className={styles.successState}>
										<div className={styles.successIcon}>✅</div>
										<h3>Message Sent!</h3>
										<p>Thanks for reaching out. We&apos;ll get back to you within 24 hours.</p>
									</div>
								) : (
									<>
										<h3>Send Us a Message</h3>
										<p className={styles.formDesc}>Fill out the form and we&apos;ll get back to you as soon as possible.</p>
										<Form onSubmit={handleSubmit}>
											<Row className="g-3">
												<Col sm={6}>
													<Form.Group>
														<Form.Label className={styles.label}>First Name</Form.Label>
														<Form.Control className={styles.input} type="text" placeholder="John" required />
													</Form.Group>
												</Col>
												<Col sm={6}>
													<Form.Group>
														<Form.Label className={styles.label}>Last Name</Form.Label>
														<Form.Control className={styles.input} type="text" placeholder="Doe" required />
													</Form.Group>
												</Col>
												<Col xs={12}>
													<Form.Group>
														<Form.Label className={styles.label}>Email Address</Form.Label>
														<Form.Control className={styles.input} type="email" placeholder="john@example.com" required />
													</Form.Group>
												</Col>
												<Col xs={12}>
													<Form.Group>
														<Form.Label className={styles.label}>Topic</Form.Label>
														<Form.Select className={styles.input} required>
															<option value="">Select a topic…</option>
															{topics.map((t) => <option key={t}>{t}</option>)}
														</Form.Select>
													</Form.Group>
												</Col>
												<Col xs={12}>
													<Form.Group>
														<Form.Label className={styles.label}>Message</Form.Label>
														<Form.Control
															as="textarea"
															className={`${styles.input} ${styles.textarea}`}
															placeholder="Describe your question or issue in detail…"
															required
														/>
													</Form.Group>
												</Col>
												<Col xs={12}>
													<button type="submit" className={styles.submitBtn}>
														📨 Send Message
													</button>
												</Col>
											</Row>
										</Form>
									</>
								)}
							</div>
						</Col>
					</Row>
				</Container>
			</section>
		</div>
	);
};

export default ContactComponent;
