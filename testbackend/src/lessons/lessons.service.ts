import {
    Injectable,
    HttpException,
    HttpStatus,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common';
import { eq, and, count } from 'drizzle-orm';
import { DatabaseProvider } from '../database/database.provider';
import { lessons, courses, Lesson, NewLesson } from '../database/schema';

@Injectable()
export class LessonsService {
    constructor(private readonly databaseProvider: DatabaseProvider) {}

    async findByCourse(courseId: number): Promise<Lesson[]> {
        const db = this.databaseProvider.getDb();
        return db
            .select()
            .from(lessons)
            .where(eq(lessons.courseId, courseId))
            .orderBy(lessons.orderIndex);
    }

    async findById(id: number): Promise<Lesson> {
        const db = this.databaseProvider.getDb();
        const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id));
        if (!lesson) throw new HttpException('Lesson not found', HttpStatus.NOT_FOUND);
        return lesson;
    }

    async create(
        lecturerId: number,
        data: { courseId: number; title: string; content?: string },
    ): Promise<Lesson> {
        const db = this.databaseProvider.getDb();

        // Ownership check
        const [course] = await db
            .select()
            .from(courses)
            .where(eq(courses.id, data.courseId));

        if (!course) throw new HttpException('Course not found', HttpStatus.NOT_FOUND);
        if (course.lecturerId !== lecturerId) throw new ForbiddenException('Not your course');

        // Max 3 lessons per course
        const existing = await db
            .select()
            .from(lessons)
            .where(eq(lessons.courseId, data.courseId));

        if (existing.length >= 3) {
            throw new BadRequestException('A course can have at most 3 lessons');
        }

        const orderIndex = existing.length + 1;           // 1, 2, or 3
        const isFinalBoss = orderIndex === 3;

        const [newLesson] = await db
            .insert(lessons)
            .values({
                courseId: data.courseId,
                title: data.title,
                content: data.content ?? null,
                orderIndex,
                isFinalBoss,
            })
            .returning();

        return newLesson;
    }

    async update(
        id: number,
        lecturerId: number,
        data: { title?: string; content?: string },
    ): Promise<Lesson> {
        const db = this.databaseProvider.getDb();
        const lesson = await this.findById(id);

        const [course] = await db
            .select()
            .from(courses)
            .where(eq(courses.id, lesson.courseId));

        if (course.lecturerId !== lecturerId) throw new ForbiddenException('Not your course');

        const [updated] = await db
            .update(lessons)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(lessons.id, id))
            .returning();

        return updated;
    }

    async remove(id: number, lecturerId: number): Promise<void> {
        const db = this.databaseProvider.getDb();
        const lesson = await this.findById(id);

        const [course] = await db
            .select()
            .from(courses)
            .where(eq(courses.id, lesson.courseId));

        if (course.lecturerId !== lecturerId) throw new ForbiddenException('Not your course');

        await db.delete(lessons).where(eq(lessons.id, id));
    }
}