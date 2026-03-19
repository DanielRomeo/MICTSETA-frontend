// app/dashboard/instructor/organisations/page.tsx
// Refactored to use react-bootstrap and SCSS modules
// Created a new MyOrganisations.module.scss based on the style from other pages

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Row, Col, Card, Button, Spinner, Alert, Badge } from 'react-bootstrap';
import { FaPlus, FaBuilding, FaUsers, FaEye, FaEdit } from 'react-icons/fa'; // Using react-icons for consistency
// import styles from '../../../_styles/MyOrganisations.module.scss'; // New SCSS module
// import styles from '../_styles/InstructorOrganisations.module.scss'; // New SCSS module
import styles from '../_styles/InstructorOrganisations.module.scss'; // New SCSS module
import { useAuth } from '@/app/contexts/auth-context';

interface Organization {
	id: number;
	name: string;
	slug: string;
	description: string;
	logo_url: string;
	website: string;
	contact_email: string;
	address: string;
	isPublic: boolean;
	foundedYear: number;
	created_at: string;
	updated_at: string;
	memberRole?: string; // Added memberRole to distinguish between owned and member orgs
}

interface OrganizationMembership {
	id: number;
	name: string;
	slug: string;
	description: string;
	logo_url: string;
	website: string;
	contact_email: string;
	address: string;
	isPublic: boolean;
	foundedYear: number;
	created_at: string;
	updated_at: string;
	memberRole: string; // Role of the user in this organization (e.g., "Member", "Admin")
}
// app/dashboard/instructor/organisations/page.tsx
// Update fetch to use access_token consistently and handle errors better

const MyOrganisations = ({
	sidebarOpen,
	isMobile,
}: {
	sidebarOpen?: boolean;
	isMobile?: boolean;
}) => {
	const router = useRouter();
	const { user } = useAuth(); // Assuming useAuth provides user
	const [ownedOrgs, setOwnedOrgs] = useState<Organization[]>([]);

	const [memberOrgs, setMemberOrgs] = useState<OrganizationMembership[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (user) {
			// Only fetch if user is defined
			fetchOrganisations();
		} else {
			setLoading(false);
			setError('User not authenticated');
		}
	}, [user]);

	const fetchOrganisations = async () => {
		try {
			setLoading(true);
			const token = localStorage.getItem('access_token');

			const response = await fetch('/api/organisations/my-organisations', {
				headers: {
					Authorization: `Bearer ${token || ''}`,
				},
			});
			if (response.ok) {
				const data = await response.json();
				
				setOwnedOrgs(data || []);
				setMemberOrgs(data.data);
			} else {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to fetch organisations');
			}

			setLoading(false);
		} catch (err) {
			console.error('Fetch organisations error:', err);
			setError((err as Error).message);
			setLoading(false);
		}
	};

	const handleCreateNew = () => {
		router.push('/dashboard/instructor/create-organisation');
	};

	const handleOrgClick = (orgId: number) => {
		router.push(`/organisation/${orgId}`);
	};

	const getPlaceholderImage = (index: number = 0) => {
		const colors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

		const safeIndex = Number.isFinite(index) ? index : 0;

		return `https://ui-avatars.com/api/?name=${encodeURIComponent('Org')}&background=${colors[
			safeIndex % colors.length
		].slice(1)}&color=fff&size=200`;
	};

	if (loading) {
		return (
			<div
				className={`${styles.myOrganisationsPage} ${sidebarOpen && !isMobile ? styles.sidebarOpen : styles.sidebarClosed}`}
			>
				<div className={styles.header}>
					<h1>My Organisations</h1>
					<Button
						variant="primary"
						onClick={handleCreateNew}
						className={styles.createBtn}
					>
						<FaPlus /> Create New
					</Button>
				</div>
				<div className={styles.loading}>
					<Spinner animation="border" />
					<p>Loading organisations...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div
				className={`${styles.myOrganisationsPage} ${sidebarOpen && !isMobile ? styles.sidebarOpen : styles.sidebarClosed}`}
			>
				<div className={styles.header}>
					<h1>My Organisations</h1>
				</div>
				<Alert variant="danger">{error}</Alert>
			</div>
		);
	}

	return (
		<div
			className={`${styles.myOrganisationsPage} ${sidebarOpen && !isMobile ? styles.sidebarOpen : styles.sidebarClosed}`}
		>
			<div className={styles.header}>
				<h1>My Organisations</h1>
				<Button variant="primary" onClick={handleCreateNew} className={styles.createBtn}>
					<FaPlus /> Create New
				</Button>
			</div>

			{ownedOrgs.length > 0 && (
				<div className={styles.section}>
					<h2 className={styles.sectionTitle}>
						<FaBuilding /> Your Owned Organisations
					</h2>
					<Row className="g-4">
						{ownedOrgs.map((org, index) => (
							<Col key={org.id} md={6} lg={4}>
								<Card
									className={styles.orgCard}
									onClick={() => handleOrgClick(org.id)}
								>
									<div className={styles.orgBanner}></div>
									<Card.Body className={styles.orgBody}>
										<div className={styles.orgLogoContainer}>
											<img
												src={org.logo_url || getPlaceholderImage(index)}
												alt={org.name}
												className={styles.orgLogo}
											/>
										</div>
										<Card.Title className={styles.orgName}>
											{org.name}
										</Card.Title>
										<Badge bg="primary" className={styles.orgRole}>
											Owner
										</Badge>
										<Card.Text className={styles.orgDescription}>
											{org.description || 'No description available'}
										</Card.Text>
										<div className={styles.orgFooter}>
											<span>{org.isPublic ? 'Public' : 'Private'}</span>
											{org.foundedYear && <span>Est. {org.foundedYear}</span>}
										</div>
									</Card.Body>
								</Card>
							</Col>
						))}
					</Row>
				</div>
			)}

			{memberOrgs.length > 0 && (
				<div className={styles.section}>
					<h2 className={styles.sectionTitle}>
						<FaUsers /> Organisations You're In
					</h2>
					<Row className="g-4">
						{memberOrgs.map((org, index) => {
							//   const org = membership.organization;
							return (
								<Col key={org.id} md={6} lg={4}>
									<Card
										className={styles.orgCard}
										// onClick={() => handleOrgClick(org.id)}
									>
										<div
											className={styles.orgBanner}
											style={{
												background:
													'linear-gradient(to-br, from-purple-500 to-pink-600)',
											}}
										></div>
										<Card.Body className={styles.orgBody}>
											<div className={styles.orgLogoContainer}>
												<img
													src={getPlaceholderImage(
														index + ownedOrgs.length
													)}
													alt={org.name}
													className={styles.orgLogo}
												/>
											</div>
											<Card.Title className={styles.orgName}>
												{org.name}
											</Card.Title>
											<Badge bg="secondary" className={styles.orgRole}>
												{org.memberRole}
											</Badge>
											<Card.Text className={styles.orgDescription}>
												{org.description || 'No description available'}
											</Card.Text>
											<div className={styles.orgFooter}>
												<span>{org.isPublic ? 'Public' : 'Private'}</span>
												{org.foundedYear && (
													<span>Est. {org.foundedYear}</span>
												)}
											</div>
										</Card.Body>

										<Card.Footer className={styles.orgFooter}>
											<div className={styles.actions}>
												{org.id}
												<Button
													className={styles.editBtn}
													onClick={() =>
														router.push(
															`/dashboard/instructor/organisations/${org.id}/edit`
														)
													}
												>
													<FaEdit /> Edit
												</Button>
												{/* <Button
													className={styles.viewBtn}
													onClick={() => router.push(`/organisations/${org.id}`)}
												>
													<FaEye /> View
												</Button> */}
												
											</div>
										</Card.Footer>
									</Card>
								</Col>
							);
						})}
					</Row>
				</div>
			)}
{/* 
			{ownedOrgs.length === 0 && memberOrgs.length === 0 && (
				<div className={styles.emptyState}>
					<p>No organisations found. Create one to get started!</p>
				</div>
			)} */}
			{
				memberOrgs.length === 0 && (
					<div className={styles.emptyState}>
						<p>You are not a member of any organisations. Join one to see it here!</p>
					</div>
				)
			}
		</div>
	);
};

export default MyOrganisations;
