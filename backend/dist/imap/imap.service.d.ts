import { OnModuleInit } from '@nestjs/common';
import { EmailsService } from '../emails/emails.service';
export declare class ImapService implements OnModuleInit {
    private readonly emailsService;
    private readonly logger;
    private imap;
    private isConnected;
    private reconnectAttempts;
    private maxReconnectAttempts;
    constructor(emailsService: EmailsService);
    onModuleInit(): Promise<void>;
    private connectToImap;
    private handleReconnection;
    private openInbox;
    private startMonitoring;
    private processNewEmails;
    private fetchEmails;
    private processEmailRaw;
    private extractReceivingChain;
    private extractSenderIp;
    private detectEspType;
    checkForNewEmails(): Promise<void>;
    getConnectionStatus(): {
        connected: boolean;
        reconnectAttempts: number;
    };
}
