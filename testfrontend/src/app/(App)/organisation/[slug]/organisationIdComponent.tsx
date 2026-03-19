'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Spinner, Alert } from 'react-bootstrap';
import styles from '../../_styles/organisationComponent.module.scss';
import CourseCard from '../../courses/courseCardComponent';
import {
	FaGlobe,
	FaEnvelope,
	FaPhone,
	FaMapMarkerAlt,
	FaCheckCircle,
	FaFacebook,
	FaTwitter,
	FaLinkedin,
	FaInstagram,
} from 'react-icons/fa';

interface SocialMedia {
	facebook?: string;
	twitter?: string;
	linkedin?: string;
	instagram?: string;
}

const getSocialIcon = (platform: string) => {
	switch (platform) {
		case 'facebook':
			return <FaFacebook />;
		case 'twitter':
			return <FaTwitter />;
		case 'linkedin':
			return <FaLinkedin />;
		case 'instagram':
			return <FaInstagram />;
		default:
			return null;
	}
};

const OrganisationComponent = () => {
	const { slug } = useParams(); // ✅ slug instead of id
	const router = useRouter();

	const [organization, setOrganization] = useState<any>(null);
	const [courses, setCourses] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (slug) {
			fetchOrganizationData();
		}
	}, [slug]);

	const fetchOrganizationData = async () => {
		try {
			setLoading(true);
			const token = localStorage.getItem('access_token');

			// 1️⃣ Fetch organization by slug
			const orgRes = await fetch(`/api/organisations/slug/${slug}`, {
				headers: token ? { Authorization: `Bearer ${token}` } : {},
			});

			if (!orgRes.ok) {
				throw new Error('Failed to fetch organization');
			}

			const orgData = await orgRes.json();
			const orgObj = orgData.data || orgData;

			setOrganization(orgObj);

			const organizationId = orgObj.id; // ✅ extract ID for internal use

			// 2️⃣ Fetch courses by organization ID
			try {
				const coursesRes = await fetch(
					`/api/courses?organizationId=${organizationId}`,
					{
						headers: token ? { Authorization: `Bearer ${token}` } : {},
					}
				);

				if (coursesRes.ok) {
					const coursesData = await coursesRes.json();
					const coursesList = coursesData.data || coursesData || [];
					setCourses(Array.isArray(coursesList) ? coursesList : []);
				}
			} catch (err) {
				console.error('Error fetching courses:', err);
			}
		} catch (err: any) {
			console.error('Error fetching organization:', err);
			setError('Failed to load organization: ' + err.message);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className={styles.loadingContainer}>
				<Spinner animation="border" variant="success" />
				<p>Loading organization...</p>
			</div>
		);
	}

	if (error || !organization) {
		return (
			<div className={styles.errorContainer}>
				<Alert variant="danger">
					<Alert.Heading>Organization Not Found</Alert.Heading>
					<p>{error || 'The organization you are looking for does not exist.'}</p>
					<button onClick={() => router.push('/')} className={styles.backBtn}>
						Back to Home
					</button>
				</Alert>
			</div>
		);
	}

	const socialMediaLinks: SocialMedia = organization.socialMedia
		? typeof organization.socialMedia === 'string'
			? JSON.parse(organization.socialMedia)
			: organization.socialMedia
		: {};

	return (
		<div className={styles.organisationPage}>
			<div
				className={styles.banner}
				style={{
					backgroundImage: organization.bannerUrl
						? `url(${organization.bannerUrl})`
						: 'linear-gradient(135deg, #00bf63 0%, #24570f 100%)',
				}}
			>
				<div className={styles.overlay}>
					<div className={styles.orgInfo}>
						{organization.logoUrl ? (
							<img
								src={organization.logoUrl}
								alt={organization.name}
								className={styles.logo}
							/>
						) : (
							<div className={styles.logoPlaceholder}>
								{organization.name?.charAt(0) || 'O'}
							</div>
						)}

						<div className={styles.titleSection}>
							<h1>
								{organization.name}
								{organization.isPublic && (
									<FaCheckCircle className={styles.verifiedBadge} />
								)}
							</h1>

							<p className={styles.description}>
								{organization.shortDescription || organization.description}
							</p>

							{organization.foundedYear && (
								<p className={styles.foundedYear}>
									Est. {organization.foundedYear}
								</p>
							)}
						</div>
					</div>
				</div>
			</div>

			<div className={styles.mainContent}>
				<div className={styles.contentGrid}>
					<div className={styles.leftColumn}>
						<section className={styles.aboutSection}>
							<h2>About Us</h2>
							<p>{organization.description || 'No description available.'}</p>
						</section>

						{(organization.website ||
							organization.contactEmail ||
							organization.phone ||
							organization.address) && (
							<section className={styles.contactSection}>
								<h2>Get in Touch</h2>
								<div className={styles.contactGrid}>
									{organization.website && (
										<a
											href={
												organization.website.startsWith('http')
													? organization.website
													: `https://${organization.website}`
											}
											className={styles.contactItem}
											target="_blank"
											rel="noopener noreferrer"
										>
											<FaGlobe className={styles.icon} />
											<span>{organization.website}</span>
										</a>
									)}

									{organization.contactEmail && (
										<a
											href={`mailto:${organization.contactEmail}`}
											className={styles.contactItem}
										>
											<FaEnvelope className={styles.icon} />
											<span>{organization.contactEmail}</span>
										</a>
									)}

									{organization.phone && (
										<div className={styles.contactItem}>
											<FaPhone className={styles.icon} />
											<span>{organization.phone}</span>
										</div>
									)}

									{organization.address && (
										<div className={styles.contactItem}>
											<FaMapMarkerAlt className={styles.icon} />
											<span>{organization.address}</span>
										</div>
									)}
								</div>
							</section>
						)}

						{socialMediaLinks &&
							Object.keys(socialMediaLinks).length > 0 && (
								<section className={styles.socialSection}>
									<h2>Connect With Us</h2>
									<div className={styles.socialLinks}>
										{Object.entries(socialMediaLinks).map(
											([platform, handle]) => {
												if (!handle) return null;

												return (
													<a
														key={platform}
														href={`https://${platform}.com/${handle}`}
														target="_blank"
														rel="noopener noreferrer"
														className={styles.socialLink}
													>
														{getSocialIcon(platform)}
														<span>{platform}</span>
													</a>
												);
											}
										)}
									</div>
								</section>
							)}
					</div>

					<div className={styles.rightColumn}>
						<div className={styles.sectionHeader}>
							<h2>Our Courses</h2>
							<p>
								Discover our comprehensive range of learning opportunities
							</p>
						</div>

						<div className={styles.coursesGrid}>
							{courses.length > 0 ? (
								courses.map((course) => (
									<CourseCard
										key={course.id}
										id={course.id}
										title={course.title}
										shortDescription={
											course.shortDescription ||
											course.description
										}
										duration={
											course.durationWeeks
												? `${course.durationWeeks} weeks`
												: undefined
										}
										price={course.price || 0}
										level={course.level || 'beginner'}
										certificateAvailable={
											course.certificateAvailable || false
										}
										language={course.language || 'English'}
										enrollmentCount={
											course.enrollmentCount || 0
										}
										// rating={course.rating || 4.5}
										thumbnailUrl={course.thumbnailUrl}
										slug={course.slug}
									/>
								))
							) : (
								<div className={styles.noCoursesMessage}>
									<p>No courses available yet.</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OrganisationComponent;