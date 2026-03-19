import {
    integer,
    sqliteTable,
    text,
    real,
    uniqueIndex,
} from 'drizzle-orm/sqlite-core';

// ============================================================================
// USERS
// ============================================================================
export const users = sqliteTable('users', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    firstName: text('first_name'),
    lastName: text('last_name'),
    // 'lecturer' maps to what was 'instructor' in old schema
    role: text('role', { enum: ['student', 'lecturer'] }).notNull().default('student'),
    xp: integer('xp', { mode: 'number' }).notNull().default(0),
    level: integer('level', { mode: 'number' }).notNull().default(1),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ============================================================================
// COURSES  (no organizationId — lecturers own courses directly)
// ============================================================================
export const courses = sqliteTable('courses', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    slug: text('slug').unique(),
    description: text('description'),
    thumbnailUrl: text('thumbnail_url'),
    lecturerId: integer('lecturer_id', { mode: 'number' })
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    isPublished: integer('is_published', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ============================================================================
// LESSONS  (max 3 per course; orderIndex = 1 | 2 | 3; lesson 3 = final boss)
// ============================================================================
export const lessons = sqliteTable('lessons', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    courseId: integer('course_id', { mode: 'number' })
        .notNull()
        .references(() => courses.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    content: text('content'),                                // markdown / rich text
    orderIndex: integer('order_index', { mode: 'number' }).notNull(), // 1, 2, 3
    isFinalBoss: integer('is_final_boss', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ============================================================================
// QUIZZES  (1 per lesson, AI-generated)
// questions stored as JSON:
// [{ question, optionA, optionB, optionC, optionD, correctAnswer }]
// ============================================================================
export const quizzes = sqliteTable('quizzes', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    lessonId: integer('lesson_id', { mode: 'number' })
        .notNull()
        .unique()                                           // 1 quiz per lesson
        .references(() => lessons.id, { onDelete: 'cascade' }),
    questions: text('questions', { mode: 'json' })
        .$type<Array<{
            question: string;
            optionA: string;
            optionB: string;
            optionC: string;
            optionD: string;
            correctAnswer: 'A' | 'B' | 'C' | 'D';
        }>>()
        .notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ============================================================================
// ENROLLMENTS
// ============================================================================
export const enrollments = sqliteTable('enrollments', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    studentId: integer('student_id', { mode: 'number' })
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    courseId: integer('course_id', { mode: 'number' })
        .notNull()
        .references(() => courses.id, { onDelete: 'cascade' }),
    enrolledAt: integer('enrolled_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    completedAt: integer('completed_at', { mode: 'timestamp' }),     // null until dragon slain
    isCompleted: integer('is_completed', { mode: 'boolean' }).notNull().default(false),
});

// ============================================================================
// LESSON PROGRESS  (the roadmap rows — one per lesson per enrollment)
// ============================================================================
export const lessonProgress = sqliteTable('lesson_progress', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    enrollmentId: integer('enrollment_id', { mode: 'number' })
        .notNull()
        .references(() => enrollments.id, { onDelete: 'cascade' }),
    lessonId: integer('lesson_id', { mode: 'number' })
        .notNull()
        .references(() => lessons.id, { onDelete: 'cascade' }),
    isPassed: integer('is_passed', { mode: 'boolean' }).notNull().default(false),
    passedAt: integer('passed_at', { mode: 'timestamp' }),
    score: real('score').default(0),                        // 0-100 % correct
});

// ============================================================================
// TYPESCRIPT TYPES
// ============================================================================
export type User           = typeof users.$inferSelect;
export type NewUser        = typeof users.$inferInsert;

export type Course         = typeof courses.$inferSelect;
export type NewCourse      = typeof courses.$inferInsert;

export type Lesson         = typeof lessons.$inferSelect;
export type NewLesson      = typeof lessons.$inferInsert;

export type Quiz           = typeof quizzes.$inferSelect;
export type NewQuiz        = typeof quizzes.$inferInsert;

export type Enrollment     = typeof enrollments.$inferSelect;
export type NewEnrollment  = typeof enrollments.$inferInsert;

export type LessonProgress    = typeof lessonProgress.$inferSelect;
export type NewLessonProgress = typeof lessonProgress.$inferInsert;