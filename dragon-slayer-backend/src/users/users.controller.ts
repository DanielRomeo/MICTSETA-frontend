import {
    Controller,
    Get,
    Post,
    Param,
    Body,
    UseGuards,
    Request,
    NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('api/users')
export class UsersController {
    constructor(private usersService: UsersService) {}

    // GET /api/users/profile
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProfile(@Request() req) {
        const user = await this.usersService.findById(req.user.id);
        if (!user) throw new NotFoundException('User not found');
        const { passwordHash, ...result } = user;
        return result;
    }

    // GET /api/users/:id
    @UseGuards(JwtAuthGuard)
    @Get(':id')
    async getUserById(@Param('id') id: string) {
        const user = await this.usersService.findById(Number(id));
        if (!user) throw new NotFoundException('User not found');
        const { passwordHash, ...result } = user;
        return result;
    }

    // GET /api/users/:id/xp
    @UseGuards(JwtAuthGuard)
    @Get(':id/xp')
    async getUserXp(@Param('id') id: string) {
        const user = await this.usersService.findById(Number(id));
        if (!user) throw new NotFoundException('User not found');
        return { xp: user.xp || 0, level: user.level || 1 };
    }

    // POST /api/users/xp — award xp to logged in user
    @UseGuards(JwtAuthGuard)
    @Post('xp')
    async addXp(@Request() req, @Body() body: { amount: number }) {
        return this.usersService.addXp(req.user.id, body.amount);
    }
}