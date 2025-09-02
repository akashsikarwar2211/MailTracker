import { Module } from '@nestjs/common';
import { ImapService } from './imap.service';
import { EmailsModule } from '../emails/emails.module';

@Module({
  imports: [EmailsModule],
  providers: [ImapService],
  exports: [ImapService],
})
export class ImapModule {}
