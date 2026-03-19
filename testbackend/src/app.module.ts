import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { CoursesModule } from './courses/courses.module';
import { LessonsModule } from './lessons/lessons.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { UserProfilesModule } from './user-profiles/user-profiles.module';



@Module({
    imports: [
        // StudentsModule,
        EnrollmentsModule,
        LessonsModule,
        DatabaseModule,
        UsersModule,
        AuthModule,
        OrganizationsModule,
        CoursesModule,
        UserProfilesModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
    ],
})
export class AppModule {}
