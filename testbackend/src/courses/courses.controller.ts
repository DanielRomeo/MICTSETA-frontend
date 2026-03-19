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
    NotFoundException,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('courses')
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) {}

    // ── Public ────────────────────────────────────────────────────────────────

    @Get('public/stats')
    getPublicStats() {
        return this.coursesService.getPublicStats();
    }

    @Get('public/featured')
    getFeaturedCourses() {
        return this.coursesService.getFeaturedCourses();
    }

    // GET /courses — all published
    @Get()
    async findAll() {
        const data = await this.coursesService.findAllPublished();
        return { data };
    }

    // GET /courses/slug/:slug
    @Get('slug/:slug')
    async findBySlug(@Param('slug') slug: string) {
        const course = await this.coursesService.findBySlug(slug);
        if (!course) throw new NotFoundException('Course not found');
        return { data: course };
    }

    // GET /courses/:id
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const data = await this.coursesService.findById(id);
        return { data };
    }

    // ── Protected ─────────────────────────────────────────────────────────────

    // GET /courses/my — lecturer's own courses
    @Get('my')
    @UseGuards(JwtAuthGuard)
    async myCourses(@Request() req) {
        const data = await this.coursesService.findByLecturer(req.user.id);
        return { data };
    }

    // POST /courses — lecturer creates a course
    @Post()
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Request() req,
        @Body() body: { title: string; description?: string; thumbnailUrl?: string },
    ) {
        const data = await this.coursesService.create({
            ...body,
            lecturerId: req.user.id,
        });
        return { statusCode: 201, data };
    }

    // PUT /courses/:id
    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Request() req,
        @Body() body: {
            title?: string;
            description?: string;
            thumbnailUrl?: string;
            isPublished?: boolean;
        },
    ) {
        const data = await this.coursesService.update(id, req.user.id, body);
        return { data };
    }

    // DELETE /courses/:id
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
        await this.coursesService.remove(id, req.user.id);
    }
}