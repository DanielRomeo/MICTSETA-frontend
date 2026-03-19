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
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('lessons')
export class LessonsController {
    constructor(private readonly lessonsService: LessonsService) {}

    // GET /lessons/course/:courseId  — public
    @Get('course/:courseId')
    async findByCourse(@Param('courseId', ParseIntPipe) courseId: number) {
        const data = await this.lessonsService.findByCourse(courseId);
        return { data };
    }

    // GET /lessons/:id  — public
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const data = await this.lessonsService.findById(id);
        return { data };
    }

    // POST /lessons  — lecturer only
    @Post()
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Request() req,
        @Body() body: { courseId: number; title: string; content?: string },
    ) {
        const data = await this.lessonsService.create(req.user.id, body);
        return { statusCode: 201, data };
    }

    // PUT /lessons/:id
    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Request() req,
        @Body() body: { title?: string; content?: string },
    ) {
        const data = await this.lessonsService.update(id, req.user.id, body);
        return { data };
    }

    // DELETE /lessons/:id
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
        await this.lessonsService.remove(id, req.user.id);
    }
}