import { drizzle } from 'drizzle-orm/libsql';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

export const DRIZZLE_DB = 'DRIZZLE_DB';

@Injectable()
export class DatabaseProvider {
    private db: any;

    constructor(private readonly configService: ConfigService) {
        const dbFile = this.configService.get<string>('DATABASE_URL');
        this.db = drizzle(dbFile!);
    }

    getDb() {
        return this.db;
    }
}