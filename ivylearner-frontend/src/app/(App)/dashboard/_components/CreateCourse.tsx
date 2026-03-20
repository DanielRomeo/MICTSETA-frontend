// app/dashboard/instructor/courses/create/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Row, Col, Card, Form, Button } from 'react-bootstrap';
import { Book, DollarSign, Clock, Globe, Image as ImageIcon } from 'lucide-react';
import styles from '../_styles/CreateCourse.module.scss';
import Alert from '@/app/(App)/_components/Alert'; // Assuming path to new Alert component

const schema = yup.object().shape({
	organizationId: yup.number().required('Organisation is required'),
	title: yup.string().required('Title is required'),
	slug: yup
		.string()
		.required('Slug is required')
		.matches(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, or hyphens'),
	description: yup.string(),
	shortDescription: yup.string(),
	price: yup.number().min(0).default(0),
	thumbnailUrl: yup.string().url('Invalid URL'),
	durationWeeks: yup.number().integer('Must be weeks').min(0),
	language: yup.string().default('English'),
	isPublished: yup.boolean().default(false),
});

interface Organization {
	id: number;
	name: string;
	memberRole: string; // Assuming this field indicates the user's role in the organization
	// other fields
}

const CreateCourse = ({ sidebarOpen, isMobile }: { sidebarOpen?: boolean; isMobile?: boolean }) => {
	const router = useRouter();
	const [ownedOrgs, setOwnedOrgs] = useState<Organization[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [orgLoading, setOrgLoading] = useState(true);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(schema),
	});

	useEffect(() => {
		const fetchOwnedOrgs = async () => {
			try {
				const token = localStorage.getItem('access_token');
				const response = await fetch('/api/organisations/my-organisations', {
					headers: { Authorization: `Bearer ${token}` },
				});
				if (response.ok) {
					const data = await response.json();
					console.log('Fetched organisations:', data.data); // Debug log

					let newdata = data.data.filter((org: Organization) => {
						// Assuming the API returns a field to indicate ownership
						return org.memberRole === 'owner';
					});

					setOwnedOrgs(newdata);
				} else {
					throw new Error('Failed to fetch organisations');
				}
			} catch (err) {
				setError((err as Error).message);
			} finally {
				setOrgLoading(false);
			}
		};
		fetchOwnedOrgs();
	}, []);

	const onSubmit = async (data: any) => {
		console.log('Submitting course data:', data); // Debug log
		setLoading(true);
		setError(null);
		setSuccess(null);

		try {
			const response = await fetch('/api/courses/create', {
				// Assuming /api/courses for create
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('access_token')}`,
				},

				body: JSON.stringify(data),
			});

			console.log(response);

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to create course');
			}

			//   setSuccess('Course created successfully!');
			setTimeout(() => router.push('/dashboard/instructor/courses'), 2000);
		} catch (err) {
			setError((err as Error).message);
		} finally {
			setLoading(false);
		}
	};

	if (orgLoading) return <div>Loading organisations...</div>;

	return (
		<div
			className={`${styles.createPage} ${sidebarOpen && !isMobile ? styles.sidebarOpen : styles.sidebarClosed}`}
		>
			<div className={styles.header}>
				<h1>Create Course</h1>
				<p>Set up your new course</p>
			</div>

			{success && (
				<Alert variant="success" message={success} onClose={() => setSuccess(null)} />
			)}
			{error && <Alert variant="danger" message={error} onClose={() => setError(null)} />}

			<Row className="g-4">
				<Col lg={12}>
					<Card className={styles.formCard}>
						<Card.Body>
							<Form onSubmit={handleSubmit(onSubmit)}>
								<Row>
									<Col md={6}>
										<Form.Group className="mb-4">
											<Form.Label>Organisation</Form.Label>
											<Form.Select
												{...register('organizationId')}
												isInvalid={!!errors.organizationId}
											>
												<option value="">Select Organisation</option>
												{ownedOrgs &&
													ownedOrgs.map((org) => (
														<option key={org.id} value={org.id}>
															{org.name}
														</option>
													))}
											</Form.Select>
											<Form.Control.Feedback type="invalid">
												{errors.organizationId?.message}
											</Form.Control.Feedback>
										</Form.Group>
									</Col>
									<Col md={6}>
										<Form.Group className="mb-4">
											<Form.Label>
												<Book size={18} className="me-2" /> Title
											</Form.Label>
											<Form.Control
												type="text"
												{...register('title')}
												isInvalid={!!errors.title}
											/>
											<Form.Control.Feedback type="invalid">
												{errors.title?.message}
											</Form.Control.Feedback>
										</Form.Group>
									</Col>
								</Row>

								<Form.Group className="mb-4">
									<Form.Label>Slug</Form.Label>
									<Form.Control
										type="text"
										{...register('slug')}
										isInvalid={!!errors.slug}
									/>
									<Form.Control.Feedback type="invalid">
										{errors.slug?.message}
									</Form.Control.Feedback>
								</Form.Group>

								<Form.Group className="mb-4">
									<Form.Label>Description</Form.Label>
									<Form.Control
										as="textarea"
										rows={3}
										{...register('description')}
										isInvalid={!!errors.description}
									/>
									<Form.Control.Feedback type="invalid">
										{errors.description?.message}
									</Form.Control.Feedback>
								</Form.Group>

								<Form.Group className="mb-4">
									<Form.Label>Short Description</Form.Label>
									<Form.Control
										as="textarea"
										rows={2}
										{...register('shortDescription')}
										isInvalid={!!errors.shortDescription}
									/>
									<Form.Control.Feedback type="invalid">
										{errors.shortDescription?.message}
									</Form.Control.Feedback>
								</Form.Group>

								<Row>
									<Col md={6}>
										<Form.Group className="mb-4">
											<Form.Label>
												<DollarSign size={18} className="me-2" /> Price
											</Form.Label>
											<Form.Control
												type="number"
												step="0.01"
												{...register('price')}
												isInvalid={!!errors.price}
											/>
											<Form.Control.Feedback type="invalid">
												{errors.price?.message}
											</Form.Control.Feedback>
										</Form.Group>
									</Col>
									<Col md={6}>
										<Form.Group className="mb-4">
											<Form.Label>
												<ImageIcon size={18} className="me-2" /> Thumbnail
												URL
											</Form.Label>
											<Form.Control
												type="url"
												{...register('thumbnailUrl')}
												isInvalid={!!errors.thumbnailUrl}
											/>
											<Form.Control.Feedback type="invalid">
												{errors.thumbnailUrl?.message}
											</Form.Control.Feedback>
										</Form.Group>
									</Col>
								</Row>

								<Row>
									<Col md={6}>
										<Form.Group className="mb-4">
											<Form.Label>
												<Clock size={18} className="me-2" /> Duration
												(Weeks)
											</Form.Label>
											<Form.Control
												type="number"
												{...register('durationWeeks')}
												isInvalid={!!errors.durationWeeks}
											/>
											<Form.Control.Feedback type="invalid">
												{errors.durationWeeks?.message}
											</Form.Control.Feedback>
										</Form.Group>
									</Col>
									<Col md={6}>
										<Form.Group className="mb-4">
											<Form.Label>
												<Globe size={18} className="me-2" /> Language
											</Form.Label>
											<Form.Control
												type="text"
												{...register('language')}
												isInvalid={!!errors.language}
											/>
											<Form.Control.Feedback type="invalid">
												{errors.language?.message}
											</Form.Control.Feedback>
										</Form.Group>
									</Col>
								</Row>

								<Form.Group className="mb-4">
									<Form.Check
										type="checkbox"
										label="Publish Course"
										{...register('isPublished')}
									/>
								</Form.Group>

								<Button
									type="submit"
									disabled={loading || ownedOrgs.length === 0}
									className={styles.submitBtn}
								>
									{loading ? 'Creating...' : 'Create Course'}
								</Button>
							</Form>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</div>
	);
};

export default CreateCourse;
