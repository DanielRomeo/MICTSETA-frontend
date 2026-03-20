'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Row, Col, Card, Form, Button, Accordion, Alert, Spinner, ListGroup, InputGroup } from 'react-bootstrap';
import { FaSave, FaUpload, FaTrash, FaSearch, FaPlus } from 'react-icons/fa';
import styles from '../_styles/InstructorCoursesEdit.module.scss';

const EditCourse = () => {
    const { id } = useParams();
    const router = useRouter();
    const [course, setCourse] = useState<any>(null);
    const [lessons, setLessons] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [instructors, setInstructors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newLesson, setNewLesson] = useState({ 
        title: '', 
        content_url: '', 
        order: 1, 
        duration_minutes: 0, 
        is_free_preview: false 
    });
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState('');
    const [searchMember, setSearchMember] = useState('');

    // Cloudinary config from environment variables
    const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    useEffect(() => {
        fetchCourseData();
    }, [id]);

    const fetchCourseData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('access_token');

            // Fetch course details
            const courseRes = await fetch(`/api/courses/${id}`, {
                headers: { 
                    'Authorization': `Bearer ${token || ''}`,
                    'Content-Type': 'application/json'
                },
            });
            
            if (!courseRes.ok) {
                const errorData = await courseRes.json();
                throw new Error(errorData.error || 'Failed to fetch course');
            }
            
            const courseData = await courseRes.json();
            setCourse(courseData.data || courseData);

            // Fetch lessons for this course
            const lessonsRes = await fetch(`/api/lessons/course/${id}`, {
                headers: { 
                    'Authorization': `Bearer ${token || ''}`,
                    'Content-Type': 'application/json'
                },
            });
            
            if (lessonsRes.ok) {
                const lessonsData = await lessonsRes.json();
                const lessonsList = lessonsData.data || lessonsData;
                setLessons(Array.isArray(lessonsList) ? lessonsList : []);
                setNewLesson({ ...newLesson, order: lessonsList.length + 1 });
            }

            // Fetch organisation members if course belongs to an organisation
            if (courseData.data?.organisationId || courseData.organisationId) {
                const orgId = courseData.data?.organisationId || courseData.organisationId;
                const membersRes = await fetch(`/api/organisations/${orgId}/members`, {
                    headers: { 
                        'Authorization': `Bearer ${token || ''}`,
                        'Content-Type': 'application/json'
                    },
                });
                
                if (membersRes.ok) {
                    const membersData = await membersRes.json();
                    setMembers(membersData.data || membersData || []);
                }
            }

            // Fetch course instructors
            const instructorsRes = await fetch(`/api/courses/${id}/instructors`, {
                headers: { 
                    'Authorization': `Bearer ${token || ''}`,
                    'Content-Type': 'application/json'
                },
            });
            
            if (instructorsRes.ok) {
                const instructorsData = await instructorsRes.json();
                setInstructors(instructorsData.data || instructorsData || []);
            }
        } catch (err: any) {
            setError('Failed to load course data: ' + err.message);
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCourseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setCourse({ ...course, [e.target.name]: e.target.value });
    };

    const handlePublishToggle = async (checked: boolean) => {
        if (checked && lessons.length < 5) {
            alert('Cannot publish course with fewer than 5 lessons.');
            return;
        }
        setCourse({ ...course, status: checked ? 'published' : 'draft' });
    };

    const uploadToCloudinary = async (file: File, type: 'image' | 'video') => {
        if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
            alert('Cloudinary configuration is missing. Please check your environment variables.');
            return null;
        }

        setUploading(true);
        setUploadProgress(`Uploading ${type}...`);
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        try {
            const resourceType = type === 'video' ? 'video' : 'image';
            const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`;
            
            console.log('Uploading to Cloudinary:', url);
            
            const res = await fetch(url, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error('Cloudinary error:', errorData);
                throw new Error(errorData.error?.message || 'Upload failed');
            }

            const data = await res.json();
            console.log('Upload successful:', data.secure_url);
            
            if (data.secure_url) {
                setUploadProgress(`${type} uploaded successfully!`);
                setTimeout(() => setUploadProgress(''), 3000);
                return data.secure_url;
            } else {
                throw new Error('No URL returned from Cloudinary');
            }
        } catch (err: any) {
            console.error('Upload error:', err);
            alert(`Failed to upload ${type}: ` + err.message);
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const url = await uploadToCloudinary(e.target.files[0], 'image');
            if (url) {
                setCourse({ ...course, thumbnail_url: url,
                     thumbnailUrl: url     // For backend update -- because we have different field names in frontend and backend, we set both to ensure it works regardless of which one the backend expects
                 });
            }
        }
    };

    const handleLessonChange = (index: number, field: string, value: any) => {
        const updatedLessons = [...lessons];
        updatedLessons[index] = { ...updatedLessons[index], [field]: value };
        setLessons(updatedLessons);
    };

    const handleNewLessonChange = (field: string, value: any) => {
        setNewLesson({ ...newLesson, [field]: value });
    };

    const handleNewLessonVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const url = await uploadToCloudinary(e.target.files[0], 'video');
            if (url) {
                setNewLesson({ ...newLesson, content_url: url });
            }
        }
    };

    const addNewLesson = async () => {
        try {
            const token = localStorage.getItem('access_token');
            
            // Backend expects camelCase field names to match the schema
            const lessonData = {
                title: newLesson.title,
                courseId: parseInt(id as string),      // camelCase
                videoUrl: newLesson.content_url,       // camelCase
                orderIndex: newLesson.order,           // camelCase
                durationMinutes: newLesson.duration_minutes,  // camelCase
                isFreePreview: newLesson.is_free_preview,     // camelCase
                contentType: 'video'  // Required field in schema
            };

            console.log('Adding new lesson with data:', lessonData);

            const res = await fetch('/api/lessons', {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token || ''}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(lessonData)
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                if (res.status === 403) {
                    alert('You do not have permission to create lessons. Only organisation owners/admins can create lessons.');
                } else {
                    alert('Failed to add lesson: ' + (errorData.error || errorData.message || 'Unknown error'));
                }
                return;
            }
            
            const data = await res.json();
            const newLessonData = data.data || data;
            setLessons([...lessons, newLessonData]);
            setNewLesson({ 
                title: '', 
                content_url: '', 
                order: lessons.length + 2, 
                duration_minutes: 0, 
                is_free_preview: false 
            });
            alert('Lesson added successfully!');
        } catch (err: any) {
            console.error('Error adding lesson:', err);
            alert('Failed to add lesson: ' + err.message);
        }
    };

    const deleteLesson = async (lessonId: number) => {
        if (confirm('Are you sure you want to delete this lesson?')) {
            try {
                const token = localStorage.getItem('access_token');
                const res = await fetch(`/api/lessons/${lessonId}`, {
                    method: 'DELETE',
                    headers: { 
                        'Authorization': `Bearer ${token || ''}`,
                        'Content-Type': 'application/json'
                    },
                });
                
                if (!res.ok) {
                    if (res.status === 403) {
                        alert('You do not have permission to delete lessons. Only organisation owners/admins can delete lessons.');
                    } else {
                        alert('Failed to delete lesson');
                    }
                    return;
                }
                
                setLessons(lessons.filter((l) => l.id !== lessonId));
                alert('Lesson deleted successfully!');
            } catch (err: any) {
                console.error('Error deleting lesson:', err);
                alert('Failed to delete lesson: ' + err.message);
            }
        }
    };

    // ================ Instructor Management =================
    const addInstructor = async (userId: number) => {
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`/api/courses/${id}/instructors`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token || ''}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId, role: 'assistant' })
            });
            
            if (!res.ok) {
                const errorData = await res.json();
                if (res.status === 403) {
                    alert('You do not have permission to add instructors. Only organisation owners/admins can manage instructors.');
                } else if (res.status === 409) {
                    alert('This instructor is already assigned to the course.');
                } else {
                    alert('Failed to add instructor: ' + (errorData.error || errorData.message));
                }
                return;
            }
            
            fetchCourseData(); // Refresh instructors and members
            alert('Instructor added successfully!');
        } catch (err: any) {
            console.error('Error adding instructor:', err);
            alert('Failed to add instructor: ' + err.message);
        }
    };

    const removeInstructor = async (userId: number) => {
        if (confirm('Are you sure you want to remove this instructor?')) {
            try {
                const token = localStorage.getItem('access_token');
                const res = await fetch(`/api/courses/${id}/instructors/${userId}`, {
                    method: 'DELETE',
                    headers: { 
                        'Authorization': `Bearer ${token || ''}`,
                        'Content-Type': 'application/json'
                    },
                });
                
                if (!res.ok) {
                    if (res.status === 403) {
                        alert('You do not have permission to remove instructors. Only organisation owners/admins can manage instructors.');
                    } else {
                        alert('Failed to remove instructor');
                    }
                    return;
                }
                
                fetchCourseData();
                alert('Instructor removed successfully!');
            } catch (err: any) {
                console.error('Error removing instructor:', err);
                alert('Failed to remove instructor: ' + err.message);
            }
        }
    };

    const updateInstructorRole = async (userId: number, role: 'lead' | 'assistant') => {
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`/api/courses/${id}/instructors/${userId}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token || ''}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ role })
            });
            
            if (!res.ok) {
                if (res.status === 403) {
                    alert('You do not have permission to update instructor roles. Only organisation owners/admins can manage instructors.');
                } else {
                    alert('Failed to update role');
                }
                return;
            }
            
            fetchCourseData();
            alert('Instructor role updated successfully!');
        } catch (err: any) {
            console.error('Error updating role:', err);
            alert('Failed to update role: ' + err.message);
        }
    };

    const saveChanges = async () => {
        try {
            const token = localStorage.getItem('access_token');
            
            // Only send fields that can be updated (exclude read-only fields)
            const updateData = {
                title: course?.title,
                description: course?.description,
                shortDescription: course?.shortDescription,
                price: course?.price,
                thumbnailUrl: course?.thumbnailUrl || course?.thumbnail_url,
                durationWeeks: course?.durationWeeks,
                isPublished: course?.isPublished || course?.status === 'published',
            };

            console.log('Updating course with data:', updateData);
            
            // Update course
            const courseRes = await fetch(`/api/courses/${id}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token || ''}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updateData)
            });
            
            if (!courseRes.ok) {
                const errorData = await courseRes.json();
                if (courseRes.status === 403) {
                    setError('You do not have permission to update this course. Only organisation owners/admins can update courses.');
                } else {
                    setError('Failed to save course changes: ' + (errorData.error || errorData.message));
                }
                return;
            }
            
            // Update all lessons
            for (const lesson of lessons) {
                // Transform lesson data to match backend DTO (camelCase)
                const lessonUpdateData = {
                    title: lesson.title,
                    videoUrl: lesson.videoUrl || lesson.content_url,
                    orderIndex: lesson.orderIndex || lesson.order,
                    durationMinutes: lesson.durationMinutes || lesson.duration_minutes,
                    isFreePreview: lesson.isFreePreview !== undefined ? lesson.isFreePreview : lesson.is_free_preview,
                    contentType: lesson.contentType || 'video'
                };

                const lessonRes = await fetch(`/api/lessons/${lesson.id}`, {
                    method: 'PUT',
                    headers: { 
                        'Authorization': `Bearer ${token || ''}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(lessonUpdateData)
                });
                
                if (!lessonRes.ok) {
                    console.error(`Failed to update lesson ${lesson.id}`);
                }
            }
            
            alert('Course updated successfully!');
            router.push('/dashboard/instructor/courses');
        } catch (err: any) {
            console.error('Error saving changes:', err);
            setError('Failed to save changes: ' + err.message);
        }
    };

    const filteredMembers = members.filter(m => 
        !instructors.some(i => i.userId === m.userId) && 
        `${m.firstName || ''} ${m.lastName || ''} ${m.email || ''}`.toLowerCase().includes(searchMember.toLowerCase())
    );

    if (loading) return (
        <div className={styles.loadingContainer}>
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading course data...</p>
        </div>
    );
    
    if (error) return (
        <div className="container mt-5">
            <Alert variant="danger">
                <Alert.Heading>Error Loading Course</Alert.Heading>
                <p>{error}</p>
                <Button variant="outline-danger" onClick={() => router.push('/dashboard/instructor/courses')}>
                    Back to Courses
                </Button>
            </Alert>
        </div>
    );

    return (
        <div className={styles.editCoursePage}>
            <div className={styles.header}>
                <h1>Edit Course: {course?.title}</h1>
                <Button onClick={saveChanges} disabled={uploading} className={styles.saveBtn}>
                    <FaSave /> Save All Changes
                </Button>
            </div>

            {uploadProgress && (
                <Alert variant="info" className="mb-3">
                    {uploadProgress}
                </Alert>
            )}

            <Row className="g-4">
                <Col lg={8}>
                    <Card className={styles.formCard}>
                        <Card.Body>
                            <h2 className={styles.sectionTitle}>Course Details</h2>
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>Title</Form.Label>
                                    <Form.Control 
                                        name="title" 
                                        value={course?.title || ''} 
                                        onChange={handleCourseChange} 
                                        className={styles.input}
                                    />
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control 
                                        as="textarea" 
                                        rows={4}
                                        name="description" 
                                        value={course?.description || ''} 
                                        onChange={handleCourseChange}
                                        className={styles.textarea}
                                    />
                                </Form.Group>
                                
                                <Form.Group className="mb-3">
                                    <Form.Label>Thumbnail</Form.Label>
                                    <Form.Control 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={handleThumbnailUpload}
                                        className={styles.fileInput}
                                        disabled={uploading}
                                    />
                                    {course?.thumbnail_url && (
                                        <div className={styles.thumbnailPreview}>
                                            <img src={course.thumbnailUrl || course.thumbnail_url} alt="Thumbnail" />
                                        </div>
                                    )}
                                </Form.Group>
                                
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Price</Form.Label>
                                            <Form.Control 
                                                type="number" 
                                                name="price" 
                                                value={course?.price || ''} 
                                                onChange={handleCourseChange}
                                                className={styles.input}
                                                step="0.01"
                                                min="0"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Category</Form.Label>
                                            <Form.Control 
                                                name="category" 
                                                value={course?.category || ''} 
                                                onChange={handleCourseChange}
                                                className={styles.input}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                
                                <Form.Group className="mb-3">
                                    <Form.Check 
                                        type="switch"
                                        label="Publish Course"
                                        checked={course?.status === 'published'}
                                        onChange={(e) => handlePublishToggle(e.target.checked)}
                                        className={styles.switch}
                                    />
                                    <Form.Text className="text-muted">
                                        Courses must have at least 5 lessons to be published
                                    </Form.Text>
                                </Form.Group>
                            </Form>
                        </Card.Body>
                    </Card>

                    <Card className={styles.formCard}>
                        <Card.Body>
                            <h2 className={styles.sectionTitle}>Lessons ({lessons.length})</h2>
                            
                            <Accordion className={styles.lessonsAccordion}>
                                {lessons.map((lesson, index) => (
                                    <Accordion.Item eventKey={index.toString()} key={lesson.id}>
                                        <Accordion.Header>
                                            <span className={styles.lessonNumber}>Lesson {index + 1}</span>
                                            <span className={styles.lessonTitle}>{lesson.title}</span>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            <Form.Group className="mb-3">
                                                <Form.Label>Title</Form.Label>
                                                <Form.Control 
                                                    value={lesson.title} 
                                                    onChange={(e) => handleLessonChange(index, 'title', e.target.value)}
                                                    className={styles.input}
                                                />
                                            </Form.Group>
                                            
                                            <Form.Group className="mb-3">
                                                <Form.Label>Video URL</Form.Label>
                                                <Form.Control 
                                                    value={lesson.content_url} 
                                                    onChange={(e) => handleLessonChange(index, 'content_url', e.target.value)}
                                                    className={styles.input}
                                                />
                                            </Form.Group>
                                            
                                            <Row>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Order</Form.Label>
                                                        <Form.Control 
                                                            type="number" 
                                                            value={lesson.order} 
                                                            onChange={(e) => handleLessonChange(index, 'order', parseInt(e.target.value))}
                                                            className={styles.input}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                                <Col md={6}>
                                                    <Form.Group className="mb-3">
                                                        <Form.Label>Duration (minutes)</Form.Label>
                                                        <Form.Control 
                                                            type="number" 
                                                            value={lesson.duration_minutes} 
                                                            onChange={(e) => handleLessonChange(index, 'duration_minutes', parseInt(e.target.value))}
                                                            className={styles.input}
                                                        />
                                                    </Form.Group>
                                                </Col>
                                            </Row>
                                            
                                            <Form.Check 
                                                type="switch"
                                                label="Free Preview"
                                                checked={lesson.is_free_preview}
                                                onChange={(e) => handleLessonChange(index, 'is_free_preview', e.target.checked)}
                                                className={`${styles.switch} mb-3`}
                                            />
                                            
                                            <Button 
                                                variant="danger" 
                                                onClick={() => deleteLesson(lesson.id)}
                                                className={styles.deleteBtn}
                                            >
                                                <FaTrash /> Delete Lesson
                                            </Button>
                                        </Accordion.Body>
                                    </Accordion.Item>
                                ))}
                                
                                <Accordion.Item eventKey="new" className={styles.newLessonItem}>
                                    <Accordion.Header>
                                        <span className={styles.addNew}><FaPlus /> Add New Lesson</span>
                                    </Accordion.Header>
                                    <Accordion.Body>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Title</Form.Label>
                                            <Form.Control 
                                                value={newLesson.title} 
                                                onChange={(e) => handleNewLessonChange('title', e.target.value)}
                                                className={styles.input}
                                            />
                                        </Form.Group>
                                        
                                        <Form.Group className="mb-3">
                                            <Form.Label>Upload Video</Form.Label>
                                            <Form.Control 
                                                type="file" 
                                                accept="video/*" 
                                                onChange={handleNewLessonVideoUpload}
                                                className={styles.fileInput}
                                                disabled={uploading}
                                            />
                                            {newLesson.content_url && (
                                                <Alert variant="success" className="mt-2">
                                                    Video uploaded successfully!
                                                </Alert>
                                            )}
                                        </Form.Group>
                                        
                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Order</Form.Label>
                                                    <Form.Control 
                                                        type="number" 
                                                        value={newLesson.order} 
                                                        onChange={(e) => handleNewLessonChange('order', parseInt(e.target.value))}
                                                        className={styles.input}
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Duration (minutes)</Form.Label>
                                                    <Form.Control 
                                                        type="number" 
                                                        value={newLesson.duration_minutes} 
                                                        onChange={(e) => handleNewLessonChange('duration_minutes', parseInt(e.target.value))}
                                                        className={styles.input}
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                        
                                        <Form.Check 
                                            type="switch"
                                            label="Free Preview"
                                            checked={newLesson.is_free_preview}
                                            onChange={(e) => handleNewLessonChange('is_free_preview', e.target.checked)}
                                            className={`${styles.switch} mb-3`}
                                        />
                                        
                                        <Button 
                                            onClick={addNewLesson} 
                                            disabled={uploading || !newLesson.title || !newLesson.content_url}
                                            className={styles.addBtn}
                                        >
                                            <FaPlus /> Add Lesson
                                        </Button>
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className={styles.formCard}>
                        <Card.Body>
                            <h2 className={styles.sectionTitle}>Instructors ({instructors.length})</h2>
                            
                            <ListGroup className={styles.instructorsList}>
                                {instructors.map((inst: any) => (
                                    <ListGroup.Item key={inst.userId} className={styles.instructorItem}>
                                        <div className={styles.instructorInfo}>
                                            <div className={styles.instructorName}>
                                                {inst.firstName} {inst.lastName}
                                            </div>
                                            <div className={styles.instructorEmail}>
                                                {inst.email}
                                            </div>
                                        </div>
                                        <div className={styles.instructorActions}>
                                            <Form.Select 
                                                value={inst.role} 
                                                onChange={(e) => updateInstructorRole(inst.userId, e.target.value as 'lead' | 'assistant')}
                                                className={styles.roleSelect}
                                            >
                                                <option value="lead">Lead</option>
                                                <option value="assistant">Assistant</option>
                                            </Form.Select>
                                            <Button 
                                                variant="danger" 
                                                size="sm" 
                                                onClick={() => removeInstructor(inst.userId)}
                                                className={styles.removeBtn}
                                            >
                                                <FaTrash />
                                            </Button>
                                        </div>
                                    </ListGroup.Item>
                                ))}
                                {instructors.length === 0 && (
                                    <ListGroup.Item className={styles.emptyState}>
                                        No instructors assigned yet
                                    </ListGroup.Item>
                                )}
                            </ListGroup>

                            <div className={styles.addInstructorSection}>
                                <h3 className={styles.subTitle}>Add Instructor</h3>
                                <InputGroup className="mb-3">
                                    <InputGroup.Text>
                                        <FaSearch />
                                    </InputGroup.Text>
                                    <Form.Control 
                                        placeholder="Search members..." 
                                        value={searchMember}
                                        onChange={(e) => setSearchMember(e.target.value)}
                                        className={styles.searchInput}
                                    />
                                </InputGroup>
                                
                                <ListGroup className={styles.membersList}>
                                    {filteredMembers.slice(0, 5).map((member: any) => (
                                        <ListGroup.Item 
                                            key={member.userId} 
                                            className={styles.memberItem}
                                        >
                                            <div className={styles.memberInfo}>
                                                <div className={styles.memberName}>
                                                    {member.firstName} {member.lastName}
                                                </div>
                                                <div className={styles.memberEmail}>
                                                    {member.email}
                                                </div>
                                            </div>
                                            <Button 
                                                size="sm" 
                                                onClick={() => addInstructor(member.userId)}
                                                className={styles.addMemberBtn}
                                            >
                                                <FaPlus />
                                            </Button>
                                        </ListGroup.Item>
                                    ))}
                                    {filteredMembers.length === 0 && (
                                        <ListGroup.Item className={styles.emptyState}>
                                            No available members found
                                        </ListGroup.Item>
                                    )}
                                    {filteredMembers.length > 5 && (
                                        <ListGroup.Item className={styles.moreResults}>
                                            +{filteredMembers.length - 5} more results
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
                    <p>{uploadProgress || 'Uploading...'}</p>
                </div>
            )}
        </div>
    );
};

export default EditCourse;