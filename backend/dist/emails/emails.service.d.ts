import { Model } from 'mongoose';
import { EmailDocument } from './schemas/email.schema';
import { CreateEmailDto } from './dto/create-email.dto';
import { EmailResponseDto } from './dto/email-response.dto';
export declare class EmailsService {
    private emailModel;
    private readonly logger;
    constructor(emailModel: Model<EmailDocument>);
    create(createEmailDto: CreateEmailDto): Promise<EmailResponseDto>;
    getLatest(): Promise<EmailResponseDto>;
    getHistory(page?: number, limit?: number): Promise<{
        emails: EmailResponseDto[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    findById(id: string): Promise<EmailResponseDto>;
    findByEspType(espType: string): Promise<EmailResponseDto[]>;
    getStats(): Promise<{
        totalEmails: number;
        espTypes: {
            [key: string]: number;
        };
        recentActivity: {
            date: string;
            count: number;
        }[];
    }>;
    refreshEmails(): Promise<{
        message: string;
        newEmailsCount: number;
    }>;
    private mapToResponseDto;
}
