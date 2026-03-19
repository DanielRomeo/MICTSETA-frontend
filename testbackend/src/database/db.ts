import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';

// Initialize SQLite connection
const sqlite = new Database(process.env.DATABASE_URL!);
export const db = drizzle(sqlite);
