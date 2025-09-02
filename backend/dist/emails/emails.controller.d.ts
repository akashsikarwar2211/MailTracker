import { EmailsService } from './emails.service';
import { CreateEmailDto } from './dto/create-email.dto';
import { EmailResponseDto } from './dto/email-response.dto';
export declare class EmailsController {
    private readonly emailsService;
    constructor(emailsService: EmailsService);
    receiveEmail(createEmailDto: CreateEmailDto): Promise<{
        success: boolean;
        data: EmailResponseDto;
    }>;
    getLatest(): Promise<{
        success: boolean;
        data: EmailResponseDto;
    }>;
    getHistory(page?: string, limit?: string): Promise<{
        success: boolean;
        data: {
            emails: EmailResponseDto[];
            total: number;
            page: number;
            totalPages: number;
        };
    }>;
    getById(id: string): Promise<{
        success: boolean;
        data: EmailResponseDto;
    }>;
    getByEspType(type: string): Promise<{
        success: boolean;
        data: EmailResponseDto[];
    }>;
    getDashboardStats(): Promise<{
        success: boolean;
        data: {
            totalEmails: number;
            espTypes: {
                [key: string]: number;
            };
            recentActivity: {
                date: string;
                count: number;
            }[];
        };
    }>;
    refreshEmails(): Promise<{
        success: boolean;
        data: {
            message: string;
            newEmailsCount: number;
        };
    }>;
    getLatestHeaders(): Promise<{
        success: boolean;
        data: {
            rawHeaders: string;
            senderIp?: string;
            receivingChain: string[];
        };
    }>;
}
