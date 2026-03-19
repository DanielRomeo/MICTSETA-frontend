import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcrypt';
import { DatabaseProvider } from '../database/database.provider';
import { users, User } from '../database/schema';

export type CreateUserInput = {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    role?: 'student' | 'lecturer';
};

@Injectable()
export class UsersService {
    constructor(private readonly databaseProvider: DatabaseProvider) {}

    async findOne(email: string): Promise<User | null> {
        const db = this.databaseProvider.getDb();
        const [user] = await db.select().from(users).where(eq(users.email, email));
        return user ?? null;
    }

    async findById(id: number): Promise<Omit<User, 'passwordHash'>> {
        const db = this.databaseProvider.getDb();
        const [user] = await db.select().from(users).where(eq(users.id, id));
        if (!user) throw new NotFoundException(`User ${id} not found`);
        const { passwordHash, ...safe } = user;
        return safe;
    }

    async findAll(): Promise<Omit<User, 'passwordHash'>[]> {
        const db = this.databaseProvider.getDb();
        const all = await db.select().from(users);
        return all.map(({ passwordHash, ...safe }) => safe);
    }

   async create(input: CreateUserInput): Promise<User> {
    const db = this.databaseProvider.getDb();
    const passwordHash = await bcrypt.hash(input.password, 10);

    const [newUser] = await db
        .insert(users)
        .values({
            email: input.email,
            passwordHash,
            firstName: input.firstName ?? null,
            lastName: input.lastName ?? null,
            xp: 0,
            level: 1,
            role: (input.role ?? 'student') as 'student' | 'lecturer',
        })
        .returning();

    return newUser;
}

    async update(
        id: number,
        data: { firstName?: string; lastName?: string; role?: 'student' | 'lecturer' },
    ): Promise<Omit<User, 'passwordHash'>> {
        const db = this.databaseProvider.getDb();
        await this.findById(id); // throws if not found

        const [updated] = await db
            .update(users)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(users.id, id))
            .returning();

        const { passwordHash, ...safe } = updated;
        return safe;
    }

    async addXp(id: number, xpAmount: number): Promise<void> {
        const db = this.databaseProvider.getDb();
        const user = await this.findById(id);
        const newXp = (user.xp ?? 0) + xpAmount;
        const newLevel = Math.floor(newXp / 100) + 1; // every 100 xp = 1 level

        await db
            .update(users)
            .set({ xp: newXp, level: newLevel, updatedAt: new Date() })
            .where(eq(users.id, id));
    }

    async remove(id: number): Promise<void> {
        const db = this.databaseProvider.getDb();
        await this.findById(id);
        await db.delete(users).where(eq(users.id, id));
    }
}