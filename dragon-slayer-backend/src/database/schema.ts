import {
    integer,
    primaryKey,
    sqliteTable,
    text,
    uniqueIndex,
} from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// ─── USERS ───────────────────────────────────────────────────────────────────
export const users = sqliteTable(
    'users',
    {
        id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
        email: text('email').notNull(),
        passwordHash: text('password_hash').notNull(),
        firstName: text('first_name').notNull(),
        lastName: text('last_name').notNull(),
        role: text('role').notNull().default('student'), // 'student' | 'lecturer'
        xp: integer('xp').notNull().default(0),
        level: integer('level').notNull().default(1),
        createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
    },
    (table) => [uniqueIndex('users_email_unique').on(table.email)],
);

// ─── COURSES ──────────────────────────────────────────────────────────────────
export const courses = sqliteTable('courses', {
    id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
    title: text('title').notNull(),
    description: text('description'),
    thumbnailUrl: text('thumbnail_url'),
    lecturerId: integer('lecturer_id')
        .notNull()
        .references(() => users.id),
    isPublished: integer('is_published', { mode: 'boolean' })
        .notNull()
        .default(false),
    createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
});

// ─── LESSONS ──────────────────────────────────────────────────────────────────
export const lessons = sqliteTable('lessons', {
    id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
    courseId: integer('course_id')
        .notNull()
        .references(() => courses.id),
    title: text('title').notNull(),
    content: text('content').notNull(),
    orderIndex: integer('order_index').notNull(), // 1, 2, 3
    isFinalBoss: integer('is_final_boss', { mode: 'boolean' })
        .notNull()
        .default(false), // true for last lesson
    createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
});

// ─── QUIZZES ──────────────────────────────────────────────────────────────────
// questions stored as JSON string:
// [{question, optionA, optionB, optionC, optionD, correctAnswer}]
export const quizzes = sqliteTable('quizzes', {
    id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
    lessonId: integer('lesson_id')
        .notNull()
        .references(() => lessons.id),
    questions: text('questions').notNull(), // JSON array
    createdAt: integer('created_at').default(sql`(strftime('%s', 'now'))`),
});

// ─── ENROLLMENTS ──────────────────────────────────────────────────────────────
export const enrollments = sqliteTable(
    'enrollments',
    {
        id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
        studentId: integer('student_id')
            .notNull()
            .references(() => users.id),
        courseId: integer('course_id')
            .notNull()
            .references(() => courses.id),
        isCompleted: integer('is_completed', { mode: 'boolean' })
            .notNull()
            .default(false),
        enrolledAt: integer('enrolled_at').default(
            sql`(strftime('%s', 'now'))`,
        ),
        completedAt: integer('completed_at'),
    },
);

// ─── LESSON PROGRESS ──────────────────────────────────────────────────────────
export const lessonProgress = sqliteTable(
    'lesson_progress',
    {
        id: integer('id').primaryKey({ autoIncrement: true }).notNull(),
        enrollmentId: integer('enrollment_id')
            .notNull()
            .references(() => enrollments.id),
        lessonId: integer('lesson_id')
            .notNull()
            .references(() => lessons.id),
        isPassed: integer('is_passed', { mode: 'boolean' })
            .notNull()
            .default(false),
        score: integer('score').default(0), // percentage 0-100
        passedAt: integer('passed_at'),
    },
);