// app/dashboard/instructor/organisations/create/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Row, Col, Card, Form, Button } from 'react-bootstrap';
import { Building2, Globe, Mail, MapPin, Calendar } from 'lucide-react';
// import styles from '../../../../_styles/CreateOrganisation.module.scss';
import styles from '../_styles/CreateOrganisation.module.scss';
import Alert from '@/app/(App)/_components/Alert'; // Assuming path to new Alert component

const schema = yup.object().shape({
	slug: yup
		.string()
		.required('Slug is required')
		.matches(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, or hyphens'),
	name: yup.string().required('Name is required'),
	description: yup.string(),
	logoUrl: yup.string().url('Invalid URL'),
	website: yup.string().url('Invalid URL'),
	contactEmail: yup.string().email('Invalid email'),
	address: yup.string(),
	foundedYear: yup.number().integer('Must be a year').min(1900).max(new Date().getFullYear()),
	isPublic: yup.boolean().default(true),
});

const CreateOrganisation = ({
	sidebarOpen,
	isMobile,
}: {
	sidebarOpen?: boolean;
	isMobile?: boolean;
}) => {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(schema),
	});

	const onSubmit = async (data: any) => {
		setLoading(true);
		setError(null);
		setSuccess(null);

		try {
			const response = await fetch('/api/organisations/create', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${localStorage.getItem('access_token')}`,
				},
				body: JSON.stringify(data),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || 'Failed to create organisation');
			}

			setSuccess('Organisation created successfully!');
			setTimeout(() => router.push('/dashboard/instructor/organisations'), 2000);
		} catch (err) {
			setError((err as Error).message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div
			className={`${styles.createPage} ${sidebarOpen && !isMobile ? styles.sidebarOpen : styles.sidebarClosed}`}
		>
			<div className={styles.header}>
				<h1>Create Organisation</h1>
				<p>Set up your new organisation</p>
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
											<Form.Label>
												<Building2 size={18} className="me-2" /> Name
											</Form.Label>
											<Form.Control
												type="text"
												{...register('name')}
												isInvalid={!!errors.name}
											/>
											<Form.Control.Feedback type="invalid">
												{errors.name?.message}
											</Form.Control.Feedback>
										</Form.Group>
									</Col>
									<Col md={6}>
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
									</Col>
								</Row>

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

								<Row>
									<Col md={6}>
										<Form.Group className="mb-4">
											<Form.Label>Logo URL</Form.Label>
											<Form.Control
												type="url"
												{...register('logoUrl')}
												isInvalid={!!errors.logoUrl}
											/>
											<Form.Control.Feedback type="invalid">
												{errors.logoUrl?.message}
											</Form.Control.Feedback>
										</Form.Group>
									</Col>
									<Col md={6}>
										<Form.Group className="mb-4">
											<Form.Label>
												<Globe size={18} className="me-2" /> Website
											</Form.Label>
											<Form.Control
												type="url"
												{...register('website')}
												isInvalid={!!errors.website}
											/>
											<Form.Control.Feedback type="invalid">
												{errors.website?.message}
											</Form.Control.Feedback>
										</Form.Group>
									</Col>
								</Row>

								<Row>
									<Col md={6}>
										<Form.Group className="mb-4">
											<Form.Label>
												<Mail size={18} className="me-2" /> Contact Email
											</Form.Label>
											<Form.Control
												type="email"
												{...register('contactEmail')}
												isInvalid={!!errors.contactEmail}
											/>
											<Form.Control.Feedback type="invalid">
												{errors.contactEmail?.message}
											</Form.Control.Feedback>
										</Form.Group>
									</Col>
									<Col md={6}>
										<Form.Group className="mb-4">
											<Form.Label>
												<MapPin size={18} className="me-2" /> Address
											</Form.Label>
											<Form.Control
												type="text"
												{...register('address')}
												isInvalid={!!errors.address}
											/>
											<Form.Control.Feedback type="invalid">
												{errors.address?.message}
											</Form.Control.Feedback>
										</Form.Group>
									</Col>
								</Row>

								<Row>
									<Col md={6}>
										<Form.Group className="mb-4">
											<Form.Label>
												<Calendar size={18} className="me-2" /> Founded Year
											</Form.Label>
											<Form.Control
												type="number"
												{...register('foundedYear')}
												isInvalid={!!errors.foundedYear}
											/>
											<Form.Control.Feedback type="invalid">
												{errors.foundedYear?.message}
											</Form.Control.Feedback>
										</Form.Group>
									</Col>
									<Col md={6}>
										<Form.Group className="mb-4">
											<Form.Check
												type="checkbox"
												label="Public Organisation"
												{...register('isPublic')}
											/>
										</Form.Group>
									</Col>
								</Row>

								<Button
									type="submit"
									disabled={loading}
									className={styles.submitBtn}
								>
									{loading ? 'Creating...' : 'Create Organisation'}
								</Button>
							</Form>
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</div>
	);
};

export default CreateOrganisation;
