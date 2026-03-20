'use client';
import React from 'react';
import Link from 'next/link';
import { Clock, Award, BookOpen, Users } from 'lucide-react';
import { FaUser } from 'react-icons/fa';
import styles from '../_styles/courses/courseCardComponent.module.scss';

interface Instructor {
	firstName: string;
	lastName: string;
	profilePictureUrl?: string | null;
	// legacy field name support
	profilePicture?: string | null;
}

interface CourseCardProps {
	id?: number;
	title: string;
	shortDescription?: string;
	duration?: string;
	// Can be a single instructor object, an array of instructors, or a name string
	instructor?: Instructor | Instructor[] | string;
	price?: number;
	level?: string;
	tags?: string[];
	certificateAvailable?: boolean;
	language?: string;
	enrollmentCount?: number;
	thumbnailUrl?: string;
	slug?: string;
}

const CourseCard: React.FC<CourseCardProps> = ({
	id,
	title,
	shortDescription,
	duration,
	instructor,
	price = 0,
	level = 'beginner',
	tags = [],
	certificateAvailable = false,
	language = 'English',
	enrollmentCount = 0,
	thumbnailUrl,
	slug,
}) => {
	const isFree = price === 0 || !price;
	const courseLink = slug ? `/course/${slug}` : id ? `/course/${id}` : '#';
	const formattedPrice = isFree ? 'Free' : `R${price}`;

	// Normalise instructor(s) into an array
	const instructorList: Instructor[] = (() => {
		if (!instructor) return [];
		if (typeof instructor === 'string') return [{ firstName: instructor, lastName: '' }];
		if (Array.isArray(instructor)) return instructor;
		return [instructor];
	})();

	// Pick picture from first instructor (support both field names)
	const primaryInstructor = instructorList[0];
	const primaryPic = primaryInstructor
		? (primaryInstructor.profilePictureUrl || primaryInstructor.profilePicture || null)
		: null;
	const primaryName = primaryInstructor
		? `${primaryInstructor.firstName} ${primaryInstructor.lastName}`.trim()
		: 'Expert Instructor';

	// If multiple instructors, show stacked avatars
	const extraCount = instructorList.length - 1;

	return (
		<Link href={courseLink} className={styles.courseCardLink}>
			<div className={styles.courseCard}>
				{/* Thumbnail */}
				<div className={styles.imageContainer}>
					{thumbnailUrl ? (
						<img src={thumbnailUrl} alt={title} className={styles.courseImage} />
					) : (
						<div className={styles.placeholder}>
							<BookOpen size={48} />
						</div>
					)}
					<div className={styles.badge}>
						<span className={isFree ? styles.freeBadge : styles.paidBadge}>
							{formattedPrice}
						</span>
					</div>
				</div>

				{/* Content */}
				<div className={styles.content}>
					<div className={styles.header}>
						<span className={`${styles.levelBadge} ${styles[level.toLowerCase()] || ''}`}>
							{level.charAt(0).toUpperCase() + level.slice(1)}
						</span>
						{language && <span className={styles.language}>🌐 {language}</span>}
					</div>

					<h3 className={styles.title}>{title}</h3>

					{shortDescription && (
						<p className={styles.description}>
							{shortDescription.length > 100
								? `${shortDescription.substring(0, 100)}…`
								: shortDescription}
						</p>
					)}

					{/* Instructor row */}
					{instructorList.length > 0 && (
						<div className={styles.instructorInfo}>
							{/* Avatar stack */}
							<div className={styles.avatarStack}>
								{/* Primary */}
								<div className={styles.avatarCircle}>
									{primaryPic ? (
										<img src={primaryPic} alt={primaryName} />
									) : (
										<FaUser />
									)}
								</div>
								{/* Extra count bubble */}
								{extraCount > 0 && (
									<div className={`${styles.avatarCircle} ${styles.extraCount}`}>
										+{extraCount}
									</div>
								)}
							</div>
							<span className={styles.instructorName}>
								{primaryName}
								{extraCount > 0 && ` +${extraCount} more`}
							</span>
						</div>
					)}

					{/* Meta */}
					<div className={styles.meta}>
						{duration && (
							<div className={styles.metaItem}>
								<Clock size={14} />
								<span>{duration}</span>
							</div>
						)}
						{certificateAvailable && (
							<div className={styles.metaItem}>
								<Award size={14} />
								<span>Certificate</span>
							</div>
						)}
					</div>

					{/* Tags */}
					{tags && tags.length > 0 && (
						<div className={styles.tags}>
							{tags.slice(0, 3).map((tag, i) => (
								<span key={i} className={styles.tag}>{tag}</span>
							))}
						</div>
					)}

					{/* Footer - enrollment count only, no rating */}
					<div className={styles.footer}>
						<div className={styles.enrolled}>
							<Users size={14} />
							<span>{enrollmentCount.toLocaleString()} students</span>
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
};

export default CourseCard;