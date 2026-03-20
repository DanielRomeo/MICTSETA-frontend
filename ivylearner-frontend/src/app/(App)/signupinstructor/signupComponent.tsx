'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Container, Row, Form, Button } from 'react-bootstrap';
import { Briefcase, GraduationCap, Award } from 'lucide-react';
import styles from '../_styles/signupInstructorComponent.module.scss';

// Enhanced schema for tutors
const schema = yup.object().shape({
	firstname: yup.string().required('First name is required.'),
	lastname: yup.string().required('Last name is required.'),
	email: yup.string().email('Invalid email').required('Email is required.'),
	password: yup
		.string()
		.required('Password is required.')
		.min(6, 'Password must be at least 6 characters.'),
	confirmPassword: yup
		.string()
		.required('Confirm Password is required.')
		.oneOf([yup.ref('password')], 'Passwords must match.'),
	specialization: yup.string().required('Field of expertise is required.'),
	experience: yup.string().required('Years of experience is required.'),
	qualification: yup.string().required('Highest qualification is required.'),
});

const SignupTutorComponent = () => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({ resolver: yupResolver(schema) });

	const onSubmit = (data: any) => {
		console.log(data);
		// Handle form submission here
	};

	return (
		<div className={styles.main}>
			<Container className={styles.mainContainer}>
				<div className={styles.box}>
					<Row>
						<h2 className={styles.primaryLabel}>Join as an Instructor</h2>
						<label className={styles.secondaryLabel}>
							Share your expertise with students worldwide
						</label>
					</Row>

					<div className={styles.benefitsSection}>
						<div className={styles.benefitItem}>
							<Briefcase className={styles.benefitIcon} />
							<span>Flexible teaching hours</span>
						</div>
						<div className={styles.benefitItem}>
							<GraduationCap className={styles.benefitIcon} />
							<span>Reach global students</span>
						</div>
						<div className={styles.benefitItem}>
							<Award className={styles.benefitIcon} />
							<span>Earn while teaching</span>
						</div>
					</div>

					<Row>
						<form onSubmit={handleSubmit(onSubmit)} className={styles.mainForm}>
							<div className={styles.formGrid}>
								<Form.Group>
									{errors.firstname && (
										<span className={styles.errorMessage}>
											{errors.firstname.message}
										</span>
									)}
									<input
										className={`form-control shadow-none ${styles.input}`}
										type="text"
										placeholder="First name"
										{...register('firstname')}
									/>
								</Form.Group>

								<Form.Group>
									{errors.lastname && (
										<span className={styles.errorMessage}>
											{errors.lastname.message}
										</span>
									)}
									<input
										className={`form-control shadow-none ${styles.input}`}
										type="text"
										{...register('lastname')}
										placeholder="Last name"
									/>
								</Form.Group>
							</div>

							<Form.Group>
								{errors.email && (
									<span className={styles.errorMessage}>
										{errors.email.message}
									</span>
								)}
								<input
									className={`form-control shadow-none ${styles.input}`}
									type="email"
									{...register('email')}
									placeholder="Email address"
								/>
							</Form.Group>

							<Form.Group>
								{errors.specialization && (
									<span className={styles.errorMessage}>
										{errors.specialization.message}
									</span>
								)}
								<input
									className={`form-control shadow-none ${styles.input}`}
									type="text"
									{...register('specialization')}
									placeholder="Field of expertise (e.g., Mathematics, Programming)"
								/>
							</Form.Group>

							<div className={styles.formGrid}>
								<Form.Group>
									{errors.experience && (
										<span className={styles.errorMessage}>
											{errors.experience.message}
										</span>
									)}
									<select
										className={`form-control shadow-none ${styles.input}`}
										{...register('experience')}
									>
										<option value="">Years of experience</option>
										<option value="0-2">0-2 years</option>
										<option value="3-5">3-5 years</option>
										<option value="5-10">5-10 years</option>
										<option value="10+">10+ years</option>
									</select>
								</Form.Group>

								<Form.Group>
									{errors.qualification && (
										<span className={styles.errorMessage}>
											{errors.qualification.message}
										</span>
									)}
									<select
										className={`form-control shadow-none ${styles.input}`}
										{...register('qualification')}
									>
										<option value="">Highest qualification</option>
										<option value="bachelors">Bachelor's Degree</option>
										<option value="masters">Master's Degree</option>
										<option value="phd">Ph.D.</option>
										<option value="other">Other</option>
									</select>
								</Form.Group>
							</div>

							<Form.Group>
								{errors.password && (
									<span className={styles.errorMessage}>
										{errors.password.message}
									</span>
								)}
								<input
									className={`form-control shadow-none ${styles.input}`}
									type="password"
									{...register('password')}
									placeholder="Password"
								/>
							</Form.Group>

							<Form.Group>
								{errors.confirmPassword && (
									<span className={styles.errorMessage}>
										{errors.confirmPassword.message}
									</span>
								)}
								<input
									className={`form-control shadow-none ${styles.input}`}
									type="password"
									{...register('confirmPassword')}
									placeholder="Confirm password"
								/>
							</Form.Group>

							<Button className={styles.loginButton}>
								{isLoading ? 'Creating Account...' : 'JOIN AS INSTRUCTOR'}
							</Button>

							<Link href="signin">
								<p className={styles.createAccountLink}>
									Already have an instructor account? <span>Sign In</span>
								</p>
							</Link>
						</form>
					</Row>
				</div>
			</Container>
		</div>
	);
};

export default SignupTutorComponent;
