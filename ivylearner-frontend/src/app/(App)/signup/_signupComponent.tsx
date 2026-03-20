'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Container, Row, Form, Button } from 'react-bootstrap';
import { Mail, Lock, User, ShieldCheck } from 'lucide-react';
import axios from 'axios';

import styles from '../_styles/signupComponent.module.scss';
import ModernNavbar from '../_components/MainNavbar';

// Validation schema
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
		.required('Confirm password is required.')
		.oneOf([yup.ref('password')], 'Passwords must match.'),
});

interface SignupFormData {
	firstname: string;
	lastname: string;
	email: string;
	password: string;
	confirmPassword: string;
}

const SignupComponent = () => {
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [role, setRole] = useState<'student' | 'instructor'>('student');

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<SignupFormData>({ resolver: yupResolver(schema) });

	const onSubmit = async (data: SignupFormData) => {
		try {
			setIsLoading(true);
			setError('');

			const response = await axios.post('/api/auth/signup', {
				email: data.email,
				password: data.password,
				firstName: data.firstname,
				lastName: data.lastname,
				role: role,
			});

			if (response.status === 201) {
				// Redirect to signin after successful signup
				window.location.href = '/signin';
			}
		} catch (err) {
			if (axios.isAxiosError(err)) {
				if (err.response?.status === 409) {
					setError('An account with this email already exists.');
				} else if (err.response?.data?.message) {
					setError(err.response.data.message);
				} else {
					setError('Failed to create account. Please try again.');
				}
			} else {
				setError('An unexpected error occurred.');
			}
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className={styles.main}>
			<ModernNavbar></ModernNavbar>
			<Container className={styles.mainContainer}>
				<div className={styles.box}>
					{/* Header */}
					<Row>
						<h2 className={styles.primaryLabel}>Create Account</h2>
						<label className={styles.secondaryLabel}>
							Join us and start your learning journey
						</label>
					</Row>

					{/* Error alert */}
					{error && (
						<div className={styles.errorAlert}>
							<ShieldCheck size={20} />
							<span>{error}</span>
						</div>
					)}

					{/* Badge */}
					<div className={styles.secureSignupBadge}>
						<ShieldCheck size={16} />
						<span>Secure Sign Up</span>
					</div>

					{/* Form */}
					<Row>
						<form onSubmit={handleSubmit(onSubmit)} className={styles.mainForm}>
							{/* First name & Last name side by side */}
							<div className={styles.formRow}>
								<Form.Group className={styles.formGroup}>
									{errors.firstname && (
										<span className={styles.errorMessage}>
											{errors.firstname.message}
										</span>
									)}
									<div className={styles.inputWrapper}>
										<User className={styles.inputIcon} size={18} />
										<input
											className={`form-control shadow-none ${styles.input} ${errors.firstname ? styles.inputError : ''}`}
											type="text"
											placeholder="First name"
											{...register('firstname')}
										/>
									</div>
								</Form.Group>

								<Form.Group className={styles.formGroup}>
									{errors.lastname && (
										<span className={styles.errorMessage}>
											{errors.lastname.message}
										</span>
									)}
									<div className={styles.inputWrapper}>
										<User className={styles.inputIcon} size={18} />
										<input
											className={`form-control shadow-none ${styles.input} ${errors.lastname ? styles.inputError : ''}`}
											type="text"
											placeholder="Last name"
											{...register('lastname')}
										/>
									</div>
								</Form.Group>
							</div>

							{/* Email */}
							<Form.Group className={styles.formGroup}>
								{errors.email && (
									<span className={styles.errorMessage}>
										{errors.email.message}
									</span>
								)}
								<div className={styles.inputWrapper}>
									<Mail className={styles.inputIcon} size={18} />
									<input
										className={`form-control shadow-none ${styles.input} ${errors.email ? styles.inputError : ''}`}
										type="email"
										placeholder="Email address"
										{...register('email')}
									/>
								</div>
							</Form.Group>

							{/* Password */}
							<Form.Group className={styles.formGroup}>
								{errors.password && (
									<span className={styles.errorMessage}>
										{errors.password.message}
									</span>
								)}
								<div className={styles.inputWrapper}>
									<Lock className={styles.inputIcon} size={18} />
									<input
										className={`form-control shadow-none ${styles.input} ${errors.password ? styles.inputError : ''}`}
										type="password"
										placeholder="Password"
										{...register('password')}
									/>
								</div>
							</Form.Group>

							{/* Confirm Password */}
							<Form.Group className={styles.formGroup}>
								{errors.confirmPassword && (
									<span className={styles.errorMessage}>
										{errors.confirmPassword.message}
									</span>
								)}
								<div className={styles.inputWrapper}>
									<Lock className={styles.inputIcon} size={18} />
									<input
										className={`form-control shadow-none ${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
										type="password"
										placeholder="Confirm password"
										{...register('confirmPassword')}
									/>
								</div>
							</Form.Group>

							{/* Role Selection */}
							<div className={styles.roleSection}>
								<span className={styles.roleSectionLabel}>I want to join as</span>
								<div className={styles.roleOptions}>
									<label
										className={`${styles.roleCard} ${role === 'student' ? styles.roleCardActive : ''}`}
									>
										<input
											type="radio"
											name="role"
											value="student"
											checked={role === 'student'}
											onChange={() => setRole('student')}
										/>
										<span className={styles.roleIcon}>🎓</span>
										<span className={styles.roleTitle}>Student</span>
										<span className={styles.roleDesc}>Learn & grow</span>
									</label>

									<label
										className={`${styles.roleCard} ${role === 'instructor' ? styles.roleCardActive : ''}`}
									>
										<input
											type="radio"
											name="role"
											value="instructor"
											checked={role === 'instructor'}
											onChange={() => setRole('instructor')}
										/>
										<span className={styles.roleIcon}>🏫</span>
										<span className={styles.roleTitle}>Instructor</span>
										<span className={styles.roleDesc}>Teach & earn</span>
									</label>
								</div>
							</div>

							{/* Submit */}
							<Button
								type="submit"
								className={styles.signupButton}
								disabled={isLoading}
							>
								{isLoading ? 'CREATING ACCOUNT...' : 'SIGN UP'}
							</Button>

							{/* Divider */}
							<div className={styles.divider}>
								<span>or</span>
							</div>

							{/* Back to signin link */}
							<Link href="/signin">
								<p className={styles.signinLink}>
									Already have an account? <span>Sign In</span>
								</p>
							</Link>
						</form>
					</Row>
				</div>
			</Container>
		</div>
	);
};

export default SignupComponent;
