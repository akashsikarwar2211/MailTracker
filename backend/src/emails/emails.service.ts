import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Email, EmailDocument } from './schemas/email.schema';
import { CreateEmailDto } from './dto/create-email.dto';
import { EmailResponseDto } from './dto/email-response.dto';

@Injectable()
export class EmailsService {
  private readonly logger = new Logger(EmailsService.name);

  constructor(
    @InjectModel(Email.name) private emailModel: Model<EmailDocument>,
  ) {}

  /**
   * Create a new email record
   */
  async create(createEmailDto: CreateEmailDto): Promise<EmailResponseDto> {
    try {
      const email = new this.emailModel({
        ...createEmailDto,
        processed: true,
        timestamp: new Date(),
      });

      const savedEmail = await email.save();
      this.logger.log(`Email created with ID: ${savedEmail._id}`);

      return this.mapToResponseDto(savedEmail);
    } catch (error) {
      this.logger.error('Failed to create email:', error);
      throw error;
    }
  }

  /**
   * Get the most recent processed email
   */
  async getLatest(): Promise<EmailResponseDto> {
    try {
      const email = await this.emailModel
        .findOne({ processed: true })
        .sort({ timestamp: -1 })
        .exec();

      if (!email) {
        throw new NotFoundException('No processed emails found');
      }

      return this.mapToResponseDto(email);
    } catch (error) {
      this.logger.error('Failed to get latest email:', error);
      throw error;
    }
  }

  /**
   * Get email processing history with pagination
   */
  async getHistory(page: number = 1, limit: number = 10): Promise<{
    emails: EmailResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      
      const [emails, total] = await Promise.all([
        this.emailModel
          .find({ processed: true })
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.emailModel.countDocuments({ processed: true }).exec(),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        emails: emails.map(email => this.mapToResponseDto(email)),
        total,
        page,
        totalPages,
      };
    } catch (error) {
      this.logger.error('Failed to get email history:', error);
      throw error;
    }
  }

  /**
   * Get email by ID
   */
  async findById(id: string): Promise<EmailResponseDto> {
    try {
      const email = await this.emailModel.findById(id).exec();
      
      if (!email) {
        throw new NotFoundException(`Email with ID ${id} not found`);
      }

      return this.mapToResponseDto(email);
    } catch (error) {
      this.logger.error(`Failed to find email with ID ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get emails by ESP type
   */
  async findByEspType(espType: string): Promise<EmailResponseDto[]> {
    try {
      const emails = await this.emailModel
        .find({ 
          espType: { $regex: espType, $options: 'i' },
          processed: true 
        })
        .sort({ timestamp: -1 })
        .exec();

      return emails.map(email => this.mapToResponseDto(email));
    } catch (error) {
      this.logger.error(`Failed to find emails by ESP type ${espType}:`, error);
      throw error;
    }
  }

  /**
   * Get statistics for dashboard
   */
  async getStats(): Promise<{
    totalEmails: number;
    espTypes: { [key: string]: number };
    recentActivity: { date: string; count: number }[];
  }> {
    try {
      const [totalEmails, espTypeStats, recentActivity] = await Promise.all([
        this.emailModel.countDocuments({ processed: true }).exec(),
        this.emailModel.aggregate([
          { $match: { processed: true } },
          { $group: { _id: '$espType', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]).exec(),
        this.emailModel.aggregate([
          { $match: { processed: true } },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: -1 } },
          { $limit: 7 },
        ]).exec(),
      ]);

      const espTypes = espTypeStats.reduce((acc, stat) => {
        acc[stat._id] = stat.count;
        return acc;
      }, {});

      return {
        totalEmails,
        espTypes,
        recentActivity: recentActivity.map(item => ({
          date: item._id,
          count: item.count,
        })),
      };
    } catch (error) {
      this.logger.error('Failed to get email statistics:', error);
      throw error;
    }
  }

  /**
   * Force refresh by fetching new emails from IMAP
   */
  async refreshEmails(): Promise<{
    message: string;
    newEmailsCount: number;
  }> {
    try {
      this.logger.log('Starting manual email refresh from IMAP');
      
      // Import IMAP service dynamically to avoid circular dependency
      const { ImapService } = await import('../imap/imap.service');
      const imapService = new ImapService();
      
      // Fetch new emails from IMAP
      const newEmails = await imapService.fetchEmails();
      
      this.logger.log(`Refresh completed. Found ${newEmails.length} new emails`);
      
      return {
        message: 'Email refresh completed successfully',
        newEmailsCount: newEmails.length,
      };
    } catch (error) {
      this.logger.error('Failed to refresh emails from IMAP:', error);
      throw error;
    }
  }

  /**
   * Map email document to response DTO
   */
  private mapToResponseDto(email: EmailDocument): EmailResponseDto {
    return {
      id: email._id.toString(),
      rawHeaders: email.rawHeaders,
      receivingChain: email.receivingChain,
      espType: email.espType,
      timestamp: email.timestamp.toISOString(),
      subject: email.subject,
      from: email.from,
      to: email.to,
      receivedAt: email.receivedAt?.toISOString(),
      senderIp: (email as any).senderIp,
      errorMessage: email.errorMessage,
    };
  }
}
