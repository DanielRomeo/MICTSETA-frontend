import { Injectable, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { users } from '../database/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class UsersService {
    constructor(private db: DatabaseService) {}

    async findByEmail(email: string) {
        const result = await this.db.db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);
        return result[0] || null;
    }

    async findById(id: number) {
        const result = await this.db.db
            .select()
            .from(users)
            .where(eq(users.id, id))
            .limit(1);
        return result[0] || null;
    }

    async create(dto: {
        email: string;
        passwordHash: string;
        firstName: string;
        lastName: string;
        role: 'student' | 'lecturer';
    }) {
        const existing = await this.findByEmail(dto.email);
        if (existing) throw new ConflictException('Email already in use');

        const result = await this.db.db
            .insert(users)
            .values({
                email: dto.email,
                passwordHash: dto.passwordHash,
                firstName: dto.firstName,
                lastName: dto.lastName,
                role: dto.role,
            })
            .returning();
        return result[0];
    }

    async addXp(userId: number, xpAmount: number) {
        const user = await this.findById(userId);
        if (!user) return;

        const newXp = (user.xp || 0) + xpAmount;
        const newLevel = Math.floor(newXp / 100) + 1; // every 100 xp = 1 level

        await this.db.db
            .update(users)
            .set({ xp: newXp, level: newLevel })
            .where(eq(users.id, userId));

        return { xp: newXp, level: newLevel };
    }
}