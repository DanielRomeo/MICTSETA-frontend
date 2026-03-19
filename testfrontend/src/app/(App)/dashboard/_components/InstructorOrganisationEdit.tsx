'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Row, Col, Card, Form, Button, Alert, Spinner, ListGroup, InputGroup, Badge } from 'react-bootstrap';
import { FaSave, FaUpload, FaTrash, FaSearch, FaPlus, FaUserPlus, FaCrown, FaUserShield, FaChalkboardTeacher, FaGraduationCap } from 'react-icons/fa';
import styles from '../_styles/InstructorOrganisationEdit.module.scss';

const InstructorOrganisationEdit = () => {
    const { id } = useParams();
    const router = useRouter();
    const [organization, setOrganization] = useState<any>(null);
    const [members, setMembers] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [searchUser, setSearchUser] = useState('');
    const [selectedRole, setSelectedRole] = useState<'owner' | 'admin' | 'instructor' | 'student'>('instructor');

    // Cloudinary config - replace with your actual values
    const CLOUDINARY_CLOUD_NAME = 'your_cloud_name';
    const CLOUDINARY_UPLOAD_PRESET = 'your_unsigned_preset';

    useEffect(() => {
        fetchOrganizationData();
        fetchAllUsers();
    }, [id]);

    const fetchOrganizationData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('access_token');

            // Fetch organization details
            const orgRes = await fetch(`/api/organisations/${id}`, {
                headers: { 
                    'Authorization': `Bearer ${token || ''}`,
                },
            });
            
            if (!orgRes.ok) throw new Error('Failed to fetch organization');
            const orgData = await orgRes.json();
            setOrganization(orgData.data);

            // Fetch organization members
            const membersRes = await fetch(`/api/organisations/${id}/members`, {
                headers: { 
                    'Authorization': `Bearer ${token || ''}`,
                },
            });
            
            if (membersRes.ok) {
                const membersData = await membersRes.json();
                setMembers(membersData.data || []);
            }
        } catch (err: any) {
            setError('Failed to load organization data: ' + err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllUsers = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const usersRes = await fetch('/api/users', {
                headers: { 
                    'Authorization': `Bearer ${token || ''}`,
                },
            });
            
            if (usersRes.ok) {
                const usersData = await usersRes.json();
                setAllUsers(usersData.data || []);
            }
        } catch (err: any) {
            console.error('Failed to fetch users:', err);
        }
    };

    const handleOrganizationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setOrganization({ ...organization, [e.target.name]: e.target.value });
    };

    const uploadToCloudinary = async (file: File, type: 'image') => {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        formData.append('resource_type', type);

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${type}/upload`, {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (data.secure_url) {
                return data.secure_url;
            } else {
                throw new Error('Upload failed');
            }
        } catch (err) {
            console.error('Upload error:', err);
            alert('Failed to upload file');
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const url = await uploadToCloudinary(e.target.files[0], 'image');
            if (url) {
                setOrganization({ ...organization, logoUrl: url });
            }
        }
    };

    // ================ Member Management =================
    const addMember = async (userId: number) => {
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`/api/organisations/${id}/members`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token || ''}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId, role: selectedRole })
            });
            
            if (!res.ok) {
                if (res.status === 403) {
                    alert('You do not have permission to add members. Only organization owners/admins can manage members.');
                } else if (res.status === 409) {
                    alert('This user is already a member of the organization.');
                } else {
                    alert('Failed to add member');
                }
                return;
            }
            
            fetchOrganizationData(); // Refresh members
            setSearchUser(''); // Clear search
        } catch (err: any) {
            console.error('Error adding member:', err);
            alert('Failed to add member');
        }
    };

    const removeMember = async (userId: number) => {
        if (confirm('Are you sure you want to remove this member?')) {
            try {
                const token = localStorage.getItem('access_token');
                const res = await fetch(`/api/organisations/${id}/members/${userId}`, {
                    method: 'DELETE',
                    headers: { 
                        'Authorization': `Bearer ${token || ''}`,
                    },
                });
                
                if (!res.ok) {
                    if (res.status === 403) {
                        alert('You do not have permission to remove members. Only organization owners/admins can manage members.');
                    } else {
                        alert('Failed to remove member');
                    }
                    return;
                }
                
                fetchOrganizationData();
            } catch (err: any) {
                console.error('Error removing member:', err);
                alert('Failed to remove member');
            }
        }
    };

    const updateMemberRole = async (userId: number, role: 'owner' | 'admin' | 'instructor' | 'student') => {
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`/api/organisations/${id}/members/${userId}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token || ''}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ role })
            });
            
            if (!res.ok) {
                if (res.status === 403) {
                    alert('You do not have permission to update member roles. Only organization owners/admins can manage members.');
                } else {
                    alert('Failed to update role');
                }
                return;
            }
            
            fetchOrganizationData();
        } catch (err: any) {
            console.error('Error updating role:', err);
            alert('Failed to update role');
        }
    };

    const saveChanges = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const orgRes = await fetch(`/api/organisations/${id}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token || ''}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(organization)
            });
            
            if (!orgRes.ok) {
                if (orgRes.status === 403) {
                    setError('You do not have permission to update this organization. Only organization owners/admins can update organisations.');
                } else {
                    setError('Failed to save organization changes');
                }
                return;
            }
            
            alert('Organization updated successfully');
            router.push('/dashboard/instructor/organisations');
        } catch (err: any) {
            console.error('Error saving changes:', err);
            setError('Failed to save changes');
        }
    };

    const filteredUsers = allUsers.filter(u => 
        !members.some(m => m.userId === u.id) && 
        `${u.firstName || ''} ${u.lastName || ''} ${u.email || ''}`.toLowerCase().includes(searchUser.toLowerCase())
    );

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'owner': return <FaCrown className={styles.roleIcon} />;
            case 'admin': return <FaUserShield className={styles.roleIcon} />;
            case 'instructor': return <FaChalkboardTeacher className={styles.roleIcon} />;
            case 'student': return <FaGraduationCap className={styles.roleIcon} />;
            default: return null;
        }
    };

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'owner': return 'danger';
            case 'admin': return 'warning';
            case 'instructor': return 'primary';
            case 'student': return 'success';
            default: return 'secondary';
        }
    };

    if (loading) return (
        <div className={styles.loadingContainer}>
            <Spinner animation="border" variant="primary" />
        </div>
    );
    
    if (error) return <Alert variant="danger">{error}</Alert>;

    return (
        <div className={styles.editOrganizationPage}>
            <div className={styles.header}>
                <h1>Edit Organization: {organization?.name}</h1>
                <Button onClick={saveChanges} disabled={uploading} className={styles.saveBtn}>
                    <FaSave /> Save Changes
                </Button>
            </div>

            <Row className="g-4">
                <Col lg={8}>
                    <Card className={styles.formCard}>
                        <Card.Body>
                            <h2 className={styles.sectionTitle}>Organization Details</h2>
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>Name</Form.Label>
                                    <Form.Control 
                                        name="name" 
                                        value={organization?.name || ''} 
                                        onChange={handleOrganizationChange} 
                                        className={styles.input}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Slug</Form.Label>
                                    <Form.Control 
                                        name="slug" 
                                        value={organization?.slug || ''} 
                                        onChange={handleOrganizationChange} 
                                        className={styles.input}
                                    />
                                    <Form.Text className="text-muted">
                                        URL-friendly identifier (e.g., 'my-organization')
                                    </Form.Text>
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control 
                                        as="textarea" 
                                        rows={4}
                                        name="description" 
                                        value={organization?.description || ''} 
                                        onChange={handleOrganizationChange}
                                        className={styles.textarea}
                                    />
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Logo</Form.Label>
                                    <Form.Control 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleLogoUpload}
                                        className={styles.fileInput}
                                    />
                                    {organization?.logoUrl && (
                                        <div className={styles.logoPreview}>
                                            <img src={organization.logoUrl} alt="Logo" />
                                        </div>
                                    )}
                                </Form.Group>
                                
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Website</Form.Label>
                                            <Form.Control 
                                                type="url"
                                                name="website" 
                                                value={organization?.website || ''} 
                                                onChange={handleOrganizationChange}
                                                className={styles.input}
                                                placeholder="https://example.com"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Contact Email</Form.Label>
                                            <Form.Control 
                                                type="email"
                                                name="contactEmail" 
                                                value={organization?.contactEmail || ''} 
                                                onChange={handleOrganizationChange}
                                                className={styles.input}
                                                placeholder="contact@example.com"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>Address</Form.Label>
                                    <Form.Control 
                                        as="textarea" 
                                        rows={2}
                                        name="address" 
                                        value={organization?.address || ''} 
                                        onChange={handleOrganizationChange}
                                        className={styles.textarea}
                                    />
                                </Form.Group>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Founded Year</Form.Label>
                                            <Form.Control 
                                                type="number"
                                                name="foundedYear" 
                                                value={organization?.foundedYear || ''} 
                                                onChange={handleOrganizationChange}
                                                className={styles.input}
                                                placeholder="2024"
                                                min="1900"
                                                max={new Date().getFullYear()}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Check 
                                                type="switch"
                                                label="Public Organization"
                                                name="isPublic"
                                                checked={organization?.isPublic || false}
                                                onChange={(e) => setOrganization({ ...organization, isPublic: e.target.checked })}
                                                className={styles.switch}
                                            />
                                            <Form.Text className="text-muted">
                                                Public organisations are visible to everyone
                                            </Form.Text>
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className={styles.formCard}>
                        <Card.Body>
                            
                            <p> Note: You dont have to save changes to manage members, they are saved immediately when you add/remove/ change roles. </p>
                            <h2 className={styles.sectionTitle}>
                                Members ({members.length})
                            </h2>
                            
                            <ListGroup className={styles.membersList}>
                                {members.map((member: any) => (
                                    <ListGroup.Item key={member.userId} className={styles.memberItem}>
                                        <div className={styles.memberInfo}>
                                            <div className={styles.memberName}>
                                                {member.firstName} {member.lastName}
                                                {getRoleIcon(member.role)}
                                            </div>
                                            <div className={styles.memberEmail}>
                                                {member.email}
                                            </div>
                                            <Badge 
                                                bg={getRoleBadgeVariant(member.role)} 
                                                className={styles.roleBadge}
                                            >
                                                {member.role}
                                            </Badge>
                                        </div>
                                        <div className={styles.memberActions}>
                                            <Form.Select 
                                                value={member.role} 
                                                onChange={(e) => updateMemberRole(member.userId, e.target.value as 'owner' | 'admin' | 'instructor' | 'student')}
                                                className={styles.roleSelect}
                                                size="sm"
                                            >
                                                <option value="owner">Owner</option>
                                                <option value="admin">Admin</option>
                                                <option value="instructor">Instructor</option>
                                                <option value="student">Student</option>
                                            </Form.Select>
                                            <Button 
                                                variant="danger" 
                                                size="sm" 
                                                onClick={() => removeMember(member.userId)}
                                                className={styles.removeBtn}
                                            >
                                                <FaTrash />
                                            </Button>
                                        </div>
                                    </ListGroup.Item>
                                ))}
                                {members.length === 0 && (
                                    <ListGroup.Item className={styles.emptyState}>
                                        No members yet
                                    </ListGroup.Item>
                                )}
                            </ListGroup>

                            <div className={styles.addMemberSection}>
                                <h3 className={styles.subTitle}>
                                    <FaUserPlus /> Add Member
                                </h3>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Member Role</Form.Label>
                                    <Form.Select 
                                        value={selectedRole}
                                        onChange={(e) => setSelectedRole(e.target.value as 'owner' | 'admin' | 'instructor' | 'student')}
                                        className={styles.roleSelectLarge}
                                    >
                                        <option value="instructor">Instructor</option>
                                        <option value="student">Student</option>
                                        <option value="admin">Admin</option>
                                        <option value="owner">Owner</option>
                                    </Form.Select>
                                </Form.Group>

                                <InputGroup className="mb-3">
                                    <InputGroup.Text>
                                        <FaSearch />
                                    </InputGroup.Text>
                                    <Form.Control 
                                        placeholder="Search users by name or email..." 
                                        value={searchUser}
                                        onChange={(e) => setSearchUser(e.target.value)}
                                        className={styles.searchInput}
                                    />
                                </InputGroup>
                                
                                <ListGroup className={styles.usersList}>
                                    {filteredUsers.slice(0, 5).map((user: any) => (
                                        <ListGroup.Item 
                                            key={user.id} 
                                            className={styles.userItem}
                                        >
                                            <div className={styles.userInfo}>
                                                <div className={styles.userName}>
                                                    {user.firstName} {user.lastName}
                                                </div>
                                                <div className={styles.userEmail}>
                                                    {user.email}
                                                </div>
                                                <Badge 
                                                    bg="info" 
                                                    className={styles.userRoleBadge}
                                                >
                                                    {user.role}
                                                </Badge>
                                            </div>
                                            <Button 
                                                size="sm" 
                                                onClick={() => addMember(user.id)}
                                                className={styles.addUserBtn}
                                            >
                                                <FaPlus />
                                            </Button>
                                        </ListGroup.Item>
                                    ))}
                                    {filteredUsers.length === 0 && searchUser && (
                                        <ListGroup.Item className={styles.emptyState}>
                                            No users found matching "{searchUser}"
                                        </ListGroup.Item>
                                    )}
                                    {filteredUsers.length === 0 && !searchUser && (
                                        <ListGroup.Item className={styles.emptyState}>
                                            All users are already members
                                        </ListGroup.Item>
                                    )}
                                    {filteredUsers.length > 5 && (
                                        <ListGroup.Item className={styles.moreResults}>
                                            +{filteredUsers.length - 5} more results - refine your search
                                        </ListGroup.Item>
                                    )}
                                </ListGroup>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {uploading && (
                <div className={styles.uploadingOverlay}>
                    <Spinner animation="border" variant="light" />
                    <p>Uploading...</p>
                </div>
            )}
        </div>
    );
};

export default InstructorOrganisationEdit;