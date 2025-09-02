import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailsModule } from './emails/emails.module';
import { ImapModule } from './imap/imap.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    // Configuration module for environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    
    // Database connection
    DatabaseModule,
    
    // Database connection handled by DatabaseModule
    
    // Schedule module for periodic tasks
    ScheduleModule.forRoot(),
    
    // Feature modules
    EmailsModule,
    ImapModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
