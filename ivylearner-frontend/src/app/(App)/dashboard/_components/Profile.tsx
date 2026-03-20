'use client';

import { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Form, Button, Badge } from 'react-bootstrap';
import {
	FaUser,
	FaEnvelope,
	FaGlobe,
	FaCamera,
	FaSave,
	FaEdit,
	FaPlus,
	FaBook,
	FaSpinner,
	FaClock,
	FaGraduationCap,
} from 'react-icons/fa';
import Image from 'next/image';
import styles from '../_styles/Profile.module.scss';
import { useAuth } from '@/app/contexts/auth-context';

interface StudentProfileProps {
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
		student?: {
			interests: string[];
			learningGoals?: string;
			preferredStyles?: string[];
		};
	} | null;
}

const PREFERRED_STYLES = [
	'Visual (videos, diagrams)',
	'Reading & writing',
	'Hands-on projects',
	'Group discussions',
	'Self-paced',
];

const StudentProfile = ({ sidebarOpen, isMobile }: StudentProfileProps) => {
	const { user, getToken } = useAuth();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [profile, setProfile] = useState<ProfileData | null>(null);
	const [loading, setLoading] = useState(true);
	const [editing, setEditing] = useState(false);
	const [saving, setSaving] = useState(false);
	const [uploadingPicture, setUploadingPicture] = useState(false);
	const [successMsg, setSuccessMsg] = useState('');
	const [errorMsg, setErrorMsg] = useState('');

	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
		timezone: 'Africa/Johannesburg',
		country: 'ZA',
		bio: '',
		interests: [] as string[],
		learningGoals: '',
		preferredStyles: [] as string[],
	});

	const [newInterest, setNewInterest] = useState('');

	// ─── Fetch ─────────────────────────────────────────────────────────
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
				interests: data.customData?.student?.interests || [],
				learningGoals: data.customData?.student?.learningGoals || '',
				preferredStyles: data.customData?.student?.preferredStyles || [],
			});
		} catch {
			setErrorMsg('Could not load profile. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	// ─── Save ──────────────────────────────────────────────────────────
	const handleSubmit = async () => {
		try {
			setSaving(true);
			setErrorMsg('');
			const token = await getToken();

			const res = await fetch('/api/profile', {
				method: 'PATCH',
				headers: {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					timezone: formData.timezone,
					country: formData.country,
					bio: formData.bio,
					customData: {
						student: {
							interests: formData.interests,
							learningGoals: formData.learningGoals,
							preferredStyles: formData.preferredStyles,
						},
					},
				}),
			});

			if (!res.ok) throw new Error('Save failed');

			setSuccessMsg('Profile saved!');
			setEditing(false);
			await fetchProfile();
			setTimeout(() => setSuccessMsg(''), 3000);
		} catch {
			setErrorMsg('Failed to save. Please try again.');
		} finally {
			setSaving(false);
		}
	};

	// ─── Picture upload ────────────────────────────────────────────────
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
		} catch {
			setErrorMsg('Failed to upload picture.');
		} finally {
			setUploadingPicture(false);
		}
	};

	// ─── Interests helpers ─────────────────────────────────────────────
	const handleAddInterest = () => {
		if (newInterest.trim()) {
			setFormData({ ...formData, interests: [...formData.interests, newInterest.trim()] });
			setNewInterest('');
		}
	};

	const handleRemoveInterest = (index: number) => {
		setFormData({ ...formData, interests: formData.interests.filter((_, i) => i !== index) });
	};

	const toggleStyle = (style: string) => {
		const current = formData.preferredStyles;
		setFormData({
			...formData,
			preferredStyles: current.includes(style)
				? current.filter((s) => s !== style)
				: [...current, style],
		});
	};

	// ─── Render ────────────────────────────────────────────────────────
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
				<h1>Student Profile</h1>
				<p>Manage your learning profile and preferences</p>
			</div>

			{successMsg && <div className="alert alert-success">{successMsg}</div>}
			{errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

			<Row className="g-4">
				{/* Left Column */}
				<Col lg={4}>
					<Card className={styles.avatarCard}>
						<Card.Body className="text-center">
							<div className={styles.avatarContainer}>
								<input
									type="file"
									accept="image/*"
									ref={fileInputRef}
									style={{ display: 'none' }}
									onChange={handlePictureChange}
								/>
								<div className={styles.avatar}>
									{profile?.profilePictureUrl ? (
										<Image
											src={profile.profilePictureUrl}
											alt="Profile"
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
							<p className={styles.userRole}>Student</p>

							<div className={styles.stats}>
								<div className={styles.statItem}>
									<h4>{formData.interests.length}</h4>
									<p>Interests</p>
								</div>
								<div className={styles.statItem}>
									<h4>{formData.preferredStyles.length}</h4>
									<p>Styles</p>
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
						</Card.Body>
					</Card>
				</Col>

				{/* Right Column */}
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
										<Button variant="outline-secondary" onClick={() => setEditing(false)}>
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
											<Form.Control type="text" value={formData.firstName} disabled className={styles.input} />
										</Form.Group>
									</Col>
									<Col md={6}>
										<Form.Group className="mb-4">
											<Form.Label className={styles.label}><FaUser /> Last Name</Form.Label>
											<Form.Control type="text" value={formData.lastName} disabled className={styles.input} />
										</Form.Group>
									</Col>
								</Row>

								<Form.Group className="mb-4">
									<Form.Label className={styles.label}><FaEnvelope /> Email</Form.Label>
									<Form.Control type="email" value={formData.email} disabled className={styles.input} />
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
									<Form.Label className={styles.label}><FaUser /> Bio</Form.Label>
									<Form.Control
										as="textarea"
										rows={3}
										value={formData.bio}
										onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
										disabled={!editing}
										className={styles.input}
									/>
								</Form.Group>

								<Form.Group className="mb-4">
									<Form.Label className={styles.label}><FaGraduationCap /> Learning Goals</Form.Label>
									<Form.Control
										as="textarea"
										rows={3}
										value={formData.learningGoals}
										onChange={(e) => setFormData({ ...formData, learningGoals: e.target.value })}
										disabled={!editing}
										placeholder="What do you want to achieve?"
										className={styles.input}
									/>
								</Form.Group>
							</Form>
						</Card.Body>
					</Card>

					{/* Interests */}
					<Card className={styles.formCard}>
						<Card.Body>
							<div className={styles.cardHeader}><h4>Interests</h4></div>
							<div className={styles.expertiseList}>
								{formData.interests.length === 0 && <p className="text-muted">No interests added yet.</p>}
								{formData.interests.map((interest, i) => (
									<Badge key={i} className={styles.expertiseBadge}>
										{interest}
										{editing && (
											<button onClick={() => handleRemoveInterest(i)} className={styles.removeBadge}>×</button>
										)}
									</Badge>
								))}
							</div>
							{editing && (
								<div className={styles.addExpertise}>
									<Form.Control
										type="text"
										placeholder="Add interest..."
										value={newInterest}
										onChange={(e) => setNewInterest(e.target.value)}
										onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInterest())}
										className={styles.input}
									/>
									<Button className={styles.addBtn} onClick={handleAddInterest}>
										<FaPlus /> Add
									</Button>
								</div>
							)}
						</Card.Body>
					</Card>

					{/* Learning Style */}
					<Card className={styles.formCard}>
						<Card.Body>
							<div className={styles.cardHeader}><h4>Preferred Learning Styles</h4></div>
							<div className={styles.expertiseList}>
								{PREFERRED_STYLES.map((style) => (
									<Badge
										key={style}
										className={`${styles.expertiseBadge} ${formData.preferredStyles.includes(style) ? styles.selected : styles.unselected}`}
										onClick={editing ? () => toggleStyle(style) : undefined}
										style={editing ? { cursor: 'pointer' } : {}}
									>
										{style}
										{formData.preferredStyles.includes(style) && ' ✓'}
									</Badge>
								))}
							</div>
							{editing && (
								<Form.Text className="text-muted">Click styles above to toggle them.</Form.Text>
							)}
						</Card.Body>
					</Card>
				</Col>
			</Row>
		</div>
	);
};

export default StudentProfile;