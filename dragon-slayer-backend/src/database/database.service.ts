import { Injectable, OnModuleInit } from '@nestjs/common';
import Database from 'better-sqlite3';
import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import * as schema from './schema';

@Injectable()
export class DatabaseService implements OnModuleInit {
    private sqlite: Database.Database;
    public db: BetterSQLite3Database<typeof schema>;

    onModuleInit() {
        this.sqlite = new Database('./dragon-slayer.db');
        this.db = drizzle(this.sqlite, { schema });
        this.runMigrations();
        console.log('🐉 Database connected!');
    }

    private runMigrations() {
        this.sqlite.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                email TEXT NOT NULL,
                password_hash TEXT NOT NULL,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'student',
                xp INTEGER NOT NULL DEFAULT 0,
                level INTEGER NOT NULL DEFAULT 1,
                created_at INTEGER DEFAULT (strftime('%s', 'now'))
            );

            CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique ON users(email);

            CREATE TABLE IF NOT EXISTS courses (
                id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                thumbnail_url TEXT,
                lecturer_id INTEGER NOT NULL REFERENCES users(id),
                is_published INTEGER NOT NULL DEFAULT 0,
                created_at INTEGER DEFAULT (strftime('%s', 'now'))
            );

            CREATE TABLE IF NOT EXISTS lessons (
                id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                course_id INTEGER NOT NULL REFERENCES courses(id),
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                order_index INTEGER NOT NULL,
                is_final_boss INTEGER NOT NULL DEFAULT 0,
                created_at INTEGER DEFAULT (strftime('%s', 'now'))
            );

            CREATE TABLE IF NOT EXISTS quizzes (
                id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                lesson_id INTEGER NOT NULL REFERENCES lessons(id),
                questions TEXT NOT NULL,
                created_at INTEGER DEFAULT (strftime('%s', 'now'))
            );

            CREATE TABLE IF NOT EXISTS enrollments (
                id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                student_id INTEGER NOT NULL REFERENCES users(id),
                course_id INTEGER NOT NULL REFERENCES courses(id),
                is_completed INTEGER NOT NULL DEFAULT 0,
                enrolled_at INTEGER DEFAULT (strftime('%s', 'now')),
                completed_at INTEGER
            );

            CREATE TABLE IF NOT EXISTS lesson_progress (
                id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
                enrollment_id INTEGER NOT NULL REFERENCES enrollments(id),
                lesson_id INTEGER NOT NULL REFERENCES lessons(id),
                is_passed INTEGER NOT NULL DEFAULT 0,
                score INTEGER DEFAULT 0,
                passed_at INTEGER
            );
        `);
    }
}