'use client';
import Head from 'next/head';
import React, { useState, useEffect } from 'react';
import { Container, Nav, Navbar, Button, Row, Col } from 'react-bootstrap';
import styles from './_styles/mainNavbar.module.scss';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Form, Offcanvas } from 'react-bootstrap';
import { Search, User, Menu, X } from 'lucide-react';
import { useAuth } from '../../contexts/auth-context';

export default function ModernNavbar() {
	const [scrolled, setScrolled] = useState(false);
	const [showMobileMenu, setShowMobileMenu] = useState(false);
	const { user, isAuthenticated, logout } = useAuth();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		const handleScroll = () => {
			setScrolled(window.scrollY > 50);
		};

		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	const isActive = (path: string) => pathname === path;

	const handleLogout = () => {
		logout();
		router.push('/home');
	};

	return (
		<Navbar
			expand="lg"
			className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}
			fixed="top"
		>
			<Container>
				<Navbar.Brand href="/home" className={styles.logoText}>
					IvyBrilliance
				</Navbar.Brand>

				<div className={styles.mobileToggle}>
					<Button
						variant="link"
						onClick={() => setShowMobileMenu(true)}
						className={styles.menuButton}
					>
						<Menu size={24} />
					</Button>
				</div>

				<Navbar.Collapse id="main-navbar" className={styles.desktopNav}>
					<Nav className="ms-auto align-items-center">
						<Nav.Link
							href="/courses"
							className={isActive('/courses') ? styles.active : ''}
						>
							Courses
						</Nav.Link>
						<Nav.Link href="/about" className={isActive('/about') ? styles.active : ''}>
							About
						</Nav.Link>
						<Nav.Link
							href="/contact"
							className={isActive('/contact') ? styles.active : ''}
						>
							Contact
						</Nav.Link>

						<div className={styles.navButtons}>
							{isAuthenticated ? (
								<>
									<Button
										variant="outline-light"
										className={styles.loginBtn}
										onClick={() => router.push('/dashboard')}
									>
										<User size={18} className="me-2" />
										Dashboard
									</Button>
									<Button
										variant="outline-light"
										className={styles.logoutBtn}
										onClick={handleLogout}
									>
										Logout
									</Button>
								</>
							) : (
								<>
									<Button
										variant="outline-light"
										className={styles.loginBtn}
										onClick={() => router.push('/signin')}
									>
										Log In
									</Button>
									<Button
										variant="success"
										className={styles.signupBtn}
										onClick={() => router.push('/signup')}
									>
										Sign Up Free
									</Button>
								</>
							)}
						</div>
					</Nav>
				</Navbar.Collapse>

				{/* Mobile Offcanvas Menu */}
				<Offcanvas
					show={showMobileMenu}
					onHide={() => setShowMobileMenu(false)}
					placement="end"
					className={styles.mobileOffcanvas}
				>
					<Offcanvas.Header>
						<Offcanvas.Title className={styles.logoText}>IvyBrilliance</Offcanvas.Title>
						<Button
							variant="link"
							onClick={() => setShowMobileMenu(false)}
							className={styles.closeButton}
						>
							<X size={24} />
						</Button>
					</Offcanvas.Header>
					<Offcanvas.Body>
						<Nav className="flex-column">
							<Nav.Link
								href="/courses"
								className={isActive('/courses') ? styles.active : ''}
								onClick={() => setShowMobileMenu(false)}
							>
								Courses
							</Nav.Link>
							<Nav.Link
								href="/about"
								className={isActive('/about') ? styles.active : ''}
								onClick={() => setShowMobileMenu(false)}
							>
								About
							</Nav.Link>
							<Nav.Link
								href="/contact"
								className={isActive('/contact') ? styles.active : ''}
								onClick={() => setShowMobileMenu(false)}
							>
								Contact
							</Nav.Link>

							<div className={styles.mobileButtons}>
								{isAuthenticated ? (
									<>
										<Button
											variant="outline-success"
											className={styles.dashboardBtn}
											onClick={() => {
												router.push('/dashboard');
												setShowMobileMenu(false);
											}}
										>
											<User size={18} className="me-2" />
											Dashboard
										</Button>
										<Button
											variant="outline-danger"
											className={styles.logoutBtn}
											onClick={() => {
												handleLogout();
												setShowMobileMenu(false);
											}}
										>
											Logout
										</Button>
									</>
								) : (
									<>
										<Button
											variant="outline-success"
											className={styles.loginBtn}
											onClick={() => {
												router.push('/signin');
												setShowMobileMenu(false);
											}}
										>
											Log In
										</Button>
										<Button
											variant="success"
											className={styles.signupBtn}
											onClick={() => {
												router.push('/signup');
												setShowMobileMenu(false);
											}}
										>
											Sign Up Free
										</Button>
									</>
								)}
							</div>
						</Nav>
					</Offcanvas.Body>
				</Offcanvas>
			</Container>
		</Navbar>
	);
}
