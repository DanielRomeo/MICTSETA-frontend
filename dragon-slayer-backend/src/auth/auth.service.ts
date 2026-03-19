import { Injectable, Inject, forwardRef, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        @Inject(forwardRef(() => UsersService))
        private usersService: UsersService,
        private jwtService: JwtService,
    ) {}

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        if (!user) return null;

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return null;

        const { passwordHash, ...result } = user;
        return result;
    }

    async login(user: any) {
        const payload = { sub: user.id, email: user.email, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                xp: user.xp,
                level: user.level,
            },
        };
    }

    async register(dto: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role: 'student' | 'lecturer';
    }) {
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const user = await this.usersService.create({
            ...dto,
            passwordHash,
        });

        return this.login(user);
    }
}