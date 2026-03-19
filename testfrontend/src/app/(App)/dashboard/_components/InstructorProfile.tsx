'use client';

import { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Form, Button, Badge } from 'react-bootstrap';
import {
	FaUser,
	FaEnvelope,
	FaGlobe,
	FaCamera,
	FaSave,
	FaBriefcase,
	FaAward,
	FaChalkboardTeacher,
	FaClock,
	FaEdit,
	FaPlus,
	FaSpinner,
} from 'react-icons/fa';
import Image from 'next/image';
import styles from '../_styles/InstructorProfile.module.scss';
import { useAuth } from '@/app/contexts/auth-context';

interface InstructorProfileProps {
	sidebarOpen?: boolean;
	isMobile?: boolean;
}

interface ProfileData {
	id: number;
	email: string;
	firstName: string;
	lastName: string;
	role: string;
	profilePictureUrl: string | null;
	timezone: string;
	country: string;
	bio: string | null;
	customData: {
		instructor?: {
			expertise: string[];
			certifications?: Array<{ name: string; issuer: string; date?: string }>;
			yearsExperience?: number;
			teachingStyle?: string;
		};
	} | null;
}

const InstructorProfile = ({ sidebarOpen, isMobile }: InstructorProfileProps) => {
	const { user, getToken } = useAuth();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [profile, setProfile] = useState<ProfileData | null>(null);
	const [loading, setLoading] = useState(true);
	const [editing, setEditing] = useState(false);
	const [saving, setSaving] = useState(false);
	const [uploadingPicture, setUploadingPicture] = useState(false);
	const [successMsg, setSuccessMsg] = useState('');
	const [errorMsg, setErrorMsg] = useState('');

	// Form state mirrors profile
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
		timezone: 'Africa/Johannesburg',
		country: 'ZA',
		bio: '',
		expertise: [] as string[],
		yearsExperience: 0,
		teachingStyle: '',
		certifications: [] as Array<{ name: string; issuer: string; date: string }>,
	});

	const [newExpertise, setNewExpertise] = useState('');
	const [newCertification, setNewCertification] = useState({ name: '', issuer: '', date: '' });

	// ─── Fetch profile ───────────────────────────────────────────────
	useEffect(() => {
		if (user) fetchProfile();
	}, [user]);

	const fetchProfile = async () => {
		try {
			setLoading(true);
			const token = await getToken();
			const res = await fetch('/api/profile', {
				headers: { Authorization: `Bearer ${token}` },
			});
			if (!res.ok) throw new Error('Failed to fetch profile');
			const data: ProfileData = await res.json();
			setProfile(data);
			setFormData({
				firstName: data.firstName || '',
				lastName: data.lastName || '',
				email: data.email || '',
				timezone: data.timezone || 'Africa/Johannesburg',
				country: data.country || 'ZA',
				bio: data.bio || '',
				expertise: data.customData?.instructor?.expertise || [],
				yearsExperience: data.customData?.instructor?.yearsExperience || 0,
				teachingStyle: data.customData?.instructor?.teachingStyle || '',
				certifications: (data.customData?.instructor?.certifications || []).map((c) => ({
					name: c.name,
					issuer: c.issuer,
					date: c.date || '',
				})),
			});
		} catch (e) {
			setErrorMsg('Could not load profile. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	// ─── Save profile ─────────────────────────────────────────────────
	const handleSubmit = async () => {
		try {
			setSaving(true);
			setErrorMsg('');
			const token = await getToken();

			const payload = {
				timezone: formData.timezone,
				country: formData.country,
				bio: formData.bio,
				customData: {
					instructor: {
						expertise: formData.expertise,
						yearsExperience: formData.yearsExperience,
						teachingStyle: formData.teachingStyle,
						certifications: formData.certifications,
					},
				},
			};

			const res = await fetch('/api/profile', {
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(payload),
			});

			if (!res.ok) throw new Error('Failed to save profile');

			setSuccessMsg('Profile saved successfully!');
			setEditing(false);
			await fetchProfile();
			setTimeout(() => setSuccessMsg(''), 3000);
		} catch (e) {
			setErrorMsg('Failed to save profile. Please try again.');
		} finally {
			setSaving(false);
		}
	};

	// ─── Profile picture upload ───────────────────────────────────────
	const handlePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		try {
			setUploadingPicture(true);
			setErrorMsg('');
			const token = await getToken();

			const fd = new FormData();
			fd.append('file', file);

			const res = await fetch('/api/profile/upload-picture', {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` },
				body: fd,
			});

			if (!res.ok) throw new Error('Upload failed');
			const { profilePictureUrl } = await res.json();

			setProfile((prev) => prev ? { ...prev, profilePictureUrl } : prev);
			setSuccessMsg('Profile picture updated!');
			setTimeout(() => setSuccessMsg(''), 3000);
		} catch (e) {
			setErrorMsg('Failed to upload picture. Please try again.');
		} finally {
			setUploadingPicture(false);
		}
	};

	// ─── Expertise helpers ────────────────────────────────────────────
	const handleAddExpertise = () => {
		if (newExpertise.trim()) {
			setFormData({ ...formData, expertise: [...formData.expertise, newExpertise.trim()] });
			setNewExpertise('');
		}
	};

	const handleRemoveExpertise = (index: number) => {
		setFormData({ ...formData, expertise: formData.expertise.filter((_, i) => i !== index) });
	};

	const handleAddCertification = () => {
		if (newCertification.name && newCertification.issuer) {
			setFormData({
				...formData,
				certifications: [...formData.certifications, newCertification],
			});
			setNewCertification({ name: '', issuer: '', date: '' });
		}
	};

	const handleRemoveCertification = (index: number) => {
		setFormData({
			...formData,
			certifications: formData.certifications.filter((_, i) => i !== index),
		});
	};

	// ─── Render ───────────────────────────────────────────────────────
	if (loading) {
		return (
			<div className={styles.profilePage}>
				<div className="d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
					<FaSpinner className="fa-spin" size={32} />
				</div>
			</div>
		);
	}

	return (
		<div
			className={`${styles.profilePage} ${sidebarOpen && !isMobile ? styles.sidebarOpen : styles.sidebarClosed}`}
		>
			<div className={styles.header}>
				<h1>Instructor Profile</h1>
				<p>Manage your teaching profile and credentials</p>
			</div>

			{successMsg && (
				<div className="alert alert-success" role="alert">{successMsg}</div>
			)}
			{errorMsg && (
				<div className="alert alert-danger" role="alert">{errorMsg}</div>
			)}

			<Row className="g-4">
				{/* Left Column - Avatar & Stats */}
				<Col lg={4}>
					<Card className={styles.avatarCard}>
						<Card.Body className="text-center">
							<div className={styles.avatarContainer}>
								{/* Hidden file input */}
								<input
									type="file"
									accept="image/*"
									ref={fileInputRef}
									style={{ display: 'none' }}
									onChange={handlePictureChange}
								/>

								{/* Profile picture or placeholder */}
								<div className={styles.avatar}>
									{profile?.profilePictureUrl ? (
										<Image
											src={profile.profilePictureUrl}
											alt="Profile picture"
											width={120}
											height={120}
											style={{ borderRadius: '50%', objectFit: 'cover', width: '100%', height: '100%' }}
											unoptimized
										/>
									) : (
										<FaUser size={80} />
									)}
								</div>

								<button
									className={styles.uploadBtn}
									onClick={() => fileInputRef.current?.click()}
									disabled={uploadingPicture}
									title="Change profile picture"
								>
									{uploadingPicture ? <FaSpinner className="fa-spin" /> : <FaCamera />}
								</button>
							</div>

							<h3 className={styles.userName}>
								{formData.firstName} {formData.lastName}
							</h3>
							<p className={styles.userRole}>Instructor</p>

							<div className={styles.stats}>
								<div className={styles.statItem}>
									<h4>{formData.yearsExperience || 0}</h4>
									<p>Yrs Exp.</p>
								</div>
								<div className={styles.statItem}>
									<h4>{formData.expertise.length}</h4>
									<p>Skills</p>
								</div>
								<div className={styles.statItem}>
									<h4>{formData.certifications.length}</h4>
									<p>Certs</p>
								</div>
							</div>
						</Card.Body>
					</Card>

					<Card className={styles.infoCard}>
						<Card.Body>
							<h5>Account Info</h5>
							<div className={styles.statusItem}>
								<span className={styles.statusLabel}>Role</span>
								<span className={styles.statusValue}>{profile?.role}</span>
							</div>
							<div className={styles.statusItem}>
								<span className={styles.statusLabel}>Country</span>
								<span className={styles.statusValue}>{formData.country}</span>
							</div>
							<div className={styles.statusItem}>
								<span className={styles.statusLabel}>Timezone</span>
								<span className={styles.statusValue}>{formData.timezone}</span>
							</div>
							<div className={styles.statusItem}>
								<span className={styles.statusLabel}>Experience</span>
								<span className={styles.statusValue}>{formData.yearsExperience} years</span>
							</div>
						</Card.Body>
					</Card>
				</Col>

				{/* Right Column - Edit Form */}
				<Col lg={8}>
					<Card className={styles.formCard}>
						<Card.Body>
							<div className={styles.cardHeader}>
								<h4>Personal Information</h4>
								{!editing ? (
									<Button className={styles.editBtn} onClick={() => setEditing(true)}>
										<FaEdit /> Edit Profile
									</Button>
								) : (
									<div className={styles.actionBtns}>
										<Button variant="outline-secondary" onClick={() => { setEditing(false); setErrorMsg(''); }}>
											Cancel
										</Button>
										<Button className={styles.saveBtn} onClick={handleSubmit} disabled={saving}>
											{saving ? <FaSpinner className="fa-spin" /> : <FaSave />} Save Changes
										</Button>
									</div>
								)}
							</div>

							<Form>
								<Row>
									<Col md={6}>
										<Form.Group className="mb-4">
											<Form.Label className={styles.label}><FaUser /> First Name</Form.Label>
											<Form.Control
												type="text"
												value={formData.firstName}
												disabled
												className={styles.input}
											/>
											<Form.Text className="text-muted">Name can be changed via account settings.</Form.Text>
										</Form.Group>
									</Col>
									<Col md={6}>
										<Form.Group className="mb-4">
											<Form.Label className={styles.label}><FaUser /> Last Name</Form.Label>
											<Form.Control
												type="text"
												value={formData.lastName}
												disabled
												className={styles.input}
											/>
										</Form.Group>
									</Col>
								</Row>

								<Form.Group className="mb-4">
									<Form.Label className={styles.label}><FaEnvelope /> Email Address</Form.Label>
									<Form.Control
										type="email"
										value={formData.email}
										disabled
										className={styles.input}
									/>
								</Form.Group>

								<Row>
									<Col md={6}>
										<Form.Group className="mb-4">
											<Form.Label className={styles.label}><FaClock /> Timezone</Form.Label>
											<Form.Select
												value={formData.timezone}
												onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
												disabled={!editing}
												className={styles.input}
											>
												<option value="Africa/Johannesburg">Africa/Johannesburg (SAST)</option>
												<option value="America/New_York">America/New_York (EST)</option>
												<option value="Europe/London">Europe/London (GMT)</option>
												<option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
											</Form.Select>
										</Form.Group>
									</Col>
									<Col md={6}>
										<Form.Group className="mb-4">
											<Form.Label className={styles.label}><FaGlobe /> Country</Form.Label>
											<Form.Control
												type="text"
												value={formData.country}
												onChange={(e) => setFormData({ ...formData, country: e.target.value })}
												disabled={!editing}
												className={styles.input}
											/>
										</Form.Group>
									</Col>
								</Row>

								<Form.Group className="mb-4">
									<Form.Label className={styles.label}><FaBriefcase /> Bio</Form.Label>
									<Form.Control
										as="textarea"
										rows={4}
										value={formData.bio}
										onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
										disabled={!editing}
										className={styles.input}
									/>
								</Form.Group>

								<Row>
									<Col md={6}>
										<Form.Group className="mb-4">
											<Form.Label className={styles.label}><FaBriefcase /> Years of Experience</Form.Label>
											<Form.Control
												type="number"
												min={0}
												value={formData.yearsExperience}
												onChange={(e) => setFormData({ ...formData, yearsExperience: parseInt(e.target.value) || 0 })}
												disabled={!editing}
												className={styles.input}
											/>
										</Form.Group>
									</Col>
								</Row>

								<Form.Group className="mb-4">
									<Form.Label className={styles.label}><FaChalkboardTeacher /> Teaching Style</Form.Label>
									<Form.Control
										as="textarea"
										rows={3}
										value={formData.teachingStyle}
										onChange={(e) => setFormData({ ...formData, teachingStyle: e.target.value })}
										disabled={!editing}
										className={styles.input}
									/>
								</Form.Group>
							</Form>
						</Card.Body>
					</Card>

					{/* Expertise */}
					<Card className={styles.formCard}>
						<Card.Body>
							<div className={styles.cardHeader}>
								<h4>Areas of Expertise</h4>
							</div>
							<div className={styles.expertiseList}>
								{formData.expertise.length === 0 && (
									<p className="text-muted">No expertise added yet.</p>
								)}
								{formData.expertise.map((skill, index) => (
									<Badge key={index} className={styles.expertiseBadge}>
										{skill}
										{editing && (
											<button onClick={() => handleRemoveExpertise(index)} className={styles.removeBadge}>
												×
											</button>
										)}
									</Badge>
								))}
							</div>
							{editing && (
								<div className={styles.addExpertise}>
									<Form.Control
										type="text"
										placeholder="Add new expertise..."
										value={newExpertise}
										onChange={(e) => setNewExpertise(e.target.value)}
										className={styles.input}
										onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExpertise())}
									/>
									<Button className={styles.addBtn} onClick={handleAddExpertise}>
										<FaPlus /> Add
									</Button>
								</div>
							)}
						</Card.Body>
					</Card>

					{/* Certifications */}
					<Card className={styles.formCard}>
						<Card.Body>
							<div className={styles.cardHeader}>
								<h4>Certifications</h4>
							</div>
							<div className={styles.certificationsList}>
								{formData.certifications.length === 0 && (
									<p className="text-muted">No certifications added yet.</p>
								)}
								{formData.certifications.map((cert, index) => (
									<div key={index} className={styles.certificationItem}>
										<div className={styles.certIcon}><FaAward /></div>
										<div className={styles.certDetails}>
											<h5>{cert.name}</h5>
											<p>{cert.issuer}{cert.date && ` • ${cert.date}`}</p>
										</div>
										{editing && (
											<button
												onClick={() => handleRemoveCertification(index)}
												style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}
											>
												×
											</button>
										)}
									</div>
								))}
							</div>
							{editing && (
								<div className={styles.addCertification}>
									<Row>
										<Col md={5}>
											<Form.Control
												type="text"
												placeholder="Certification name"
												value={newCertification.name}
												onChange={(e) => setNewCertification({ ...newCertification, name: e.target.value })}
												className={styles.input}
											/>
										</Col>
										<Col md={4}>
											<Form.Control
												type="text"
												placeholder="Issuer"
												value={newCertification.issuer}
												onChange={(e) => setNewCertification({ ...newCertification, issuer: e.target.value })}
												className={styles.input}
											/>
										</Col>
										<Col md={2}>
											<Form.Control
												type="text"
												placeholder="Year"
												value={newCertification.date}
												onChange={(e) => setNewCertification({ ...newCertification, date: e.target.value })}
												className={styles.input}
											/>
										</Col>
										<Col md={1}>
											<Button className={styles.addBtn} onClick={handleAddCertification}>
												<FaPlus />
											</Button>
										</Col>
									</Row>
								</div>
							)}
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</div>
	);
};

export default InstructorProfile;