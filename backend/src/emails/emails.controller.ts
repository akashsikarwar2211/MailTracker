import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  ValidationPipe,
} from '@nestjs/common';
import { EmailsService } from './emails.service';
import { CreateEmailDto } from './dto/create-email.dto';
import { EmailResponseDto } from './dto/email-response.dto';

@Controller('emails')
export class EmailsController {
  constructor(private readonly emailsService: EmailsService) {}

  /**
   * POST /emails/receive
   * Process new incoming email
   */
  @Post('receive')
  @HttpCode(HttpStatus.CREATED)
  async receiveEmail(
    @Body(ValidationPipe) createEmailDto: CreateEmailDto,
  ): Promise<{ success: boolean; data: EmailResponseDto }> {
    const email = await this.emailsService.create(createEmailDto);
    
    return {
      success: true,
      data: email,
    };
  }

  /**
   * GET /emails/latest
   * Get most recent processed email
   */
  @Get('latest')
  async getLatest(): Promise<{ success: boolean; data: EmailResponseDto }> {
    const email = await this.emailsService.getLatest();
    
    return {
      success: true,
      data: email,
    };
  }

  /**
   * GET /emails/history
   * Get email processing history with pagination
   */
  @Get('history')
  async getHistory(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '10',
  ): Promise<{
    success: boolean;
    data: {
      emails: EmailResponseDto[];
      total: number;
      page: number;
      totalPages: number;
    };
  }> {
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
    const history = await this.emailsService.getHistory(pageNum, limitNum);
    
    return {
      success: true,
      data: history,
    };
  }

  /**
   * GET /emails/:id
   * Get email by ID
   */
  @Get(':id')
  async getById(
    @Param('id') id: string,
  ): Promise<{ success: boolean; data: EmailResponseDto }> {
    const email = await this.emailsService.findById(id);
    
    return {
      success: true,
      data: email,
    };
  }

  /**
   * GET /emails/esp/:type
   * Get emails by ESP type
   */
  @Get('esp/:type')
  async getByEspType(
    @Param('type') type: string,
  ): Promise<{ success: boolean; data: EmailResponseDto[] }> {
    const emails = await this.emailsService.findByEspType(type);
    
    return {
      success: true,
      data: emails,
    };
  }

  /**
   * GET /emails/stats/dashboard
   * Get dashboard statistics
   */
  @Get('stats/dashboard')
  async getDashboardStats(): Promise<{
    success: boolean;
    data: {
      totalEmails: number;
      espTypes: { [key: string]: number };
      recentActivity: { date: string; count: number }[];
    };
  }> {
    const stats = await this.emailsService.getStats();
    
    return {
      success: true,
      data: stats,
    };
  }

  /**
   * POST /emails/refresh
   * Force refresh by fetching new emails from IMAP
   */
  @Post('refresh')
  async refreshEmails(): Promise<{
    success: boolean;
    data: {
      message: string;
      newEmailsCount: number;
    };
  }> {
    const result = await this.emailsService.refreshEmails();
    
    return {
      success: true,
      data: result,
    };
  }

  /**
   * GET /emails/debug/latest-headers
   * Get raw headers of latest email for debugging
   */
  @Get('debug/latest-headers')
  async getLatestHeaders(): Promise<{
    success: boolean;
    data: {
      rawHeaders: string;
      senderIp?: string;
      receivingChain: string[];
    };
  }> {
    const email = await this.emailsService.getLatest();
    
    return {
      success: true,
      data: {
        rawHeaders: email.rawHeaders,
        senderIp: email.senderIp,
        receivingChain: email.receivingChain,
      },
    };
  }
}
