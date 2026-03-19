import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Request,
    UseGuards,
    HttpCode,
    HttpStatus,
    ParseIntPipe,
    HttpException,
    Inject,
    forwardRef,
} from '@nestjs/common';
import { UsersService, CreateUserInput } from './users.service';
import { AuthService } from '../auth/auth.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { LocalAuthGuard } from '../auth/local-auth.guard';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        @Inject(forwardRef(() => AuthService))
        private readonly authService: AuthService,
    ) {}

    // POST /users/register
    @Post('create')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() body: CreateUserInput) {
        console.log('hit')
        try {
            const user = await this.usersService.create(body);
            const { passwordHash, ...safe } = user;
            return { statusCode: 201, data: safe };
        } catch (err: any) {
            if (err?.message?.includes('UNIQUE')) {
                throw new HttpException('Email already in use', HttpStatus.CONFLICT);
            }
            throw new HttpException('Registration failed', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // POST /users/login
    @Post('login')
    @UseGuards(LocalAuthGuard)
    @HttpCode(HttpStatus.OK)
    async login(@Request() req) {
        return this.authService.login(req.user);
    }

    // GET /users/me
    @Get('me')
    @UseGuards(JwtAuthGuard)
    async me(@Request() req) {
        const user = await this.usersService.findById(req.user.id);
        return { statusCode: 200, data: user };
    }

    // PUT /users/me
    @Put('me')
    @UseGuards(JwtAuthGuard)
    async updateMe(
        @Request() req,
        @Body() body: { firstName?: string; lastName?: string },
    ) {
        const user = await this.usersService.update(req.user.id, body);
        return { statusCode: 200, data: user };
    }

    // GET /users  (admin convenience — no role guard for MVP)
    @Get()
    @UseGuards(JwtAuthGuard)
    async findAll() {
        const data = await this.usersService.findAll();
        return { statusCode: 200, data };
    }

    // GET /users/:id
    @Get(':id')
    @UseGuards(JwtAuthGuard)
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const data = await this.usersService.findById(id);
        return { statusCode: 200, data };
    }

    // DELETE /users/:id
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number) {
        await this.usersService.remove(id);
    }
}