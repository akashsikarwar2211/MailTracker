"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ImapService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImapService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const Imap = require("imap");
const mailparser_1 = require("mailparser");
const emails_service_1 = require("../emails/emails.service");
let ImapService = ImapService_1 = class ImapService {
    constructor(emailsService) {
        this.emailsService = emailsService;
        this.logger = new common_1.Logger(ImapService_1.name);
        this.isConnected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }
    async onModuleInit() {
        await this.connectToImap();
    }
    async connectToImap() {
        try {
            this.imap = new Imap({
                user: process.env.IMAP_USER,
                password: process.env.IMAP_PASSWORD,
                host: process.env.IMAP_HOST,
                port: parseInt(process.env.IMAP_PORT || '993'),
                tls: process.env.IMAP_TLS === 'true',
                tlsOptions: { rejectUnauthorized: false },
                connTimeout: 60000,
                authTimeout: 5000,
            });
            this.imap.on('ready', () => {
                this.logger.log('✅ IMAP connection established');
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.openInbox();
            });
            this.imap.on('error', (err) => {
                this.logger.error('❌ IMAP connection error:', err);
                this.isConnected = false;
                this.handleReconnection();
            });
            this.imap.on('end', () => {
                this.logger.log('⚠️ IMAP connection ended');
                this.isConnected = false;
                this.handleReconnection();
            });
            this.imap.connect();
        }
        catch (error) {
            this.logger.error('Failed to create IMAP connection:', error);
            this.handleReconnection();
        }
    }
    handleReconnection() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
            this.logger.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => {
                this.connectToImap();
            }, delay);
        }
        else {
            this.logger.error('Max reconnection attempts reached. Please check IMAP configuration.');
        }
    }
    openInbox() {
        this.imap.openBox('INBOX', false, (err, box) => {
            if (err) {
                this.logger.error('Failed to open inbox:', err);
                return;
            }
            this.logger.log(`📬 Inbox opened. Total messages: ${box.messages.total}`);
            this.startMonitoring();
        });
    }
    startMonitoring() {
        this.imap.on('mail', (numNewMsgs) => {
            this.logger.log(`📧 ${numNewMsgs} new email(s) detected`);
            this.processNewEmails();
        });
    }
    async processNewEmails() {
        try {
            const searchCriteria = [
                ['UNSEEN'],
                ['SINCE', new Date(Date.now() - 24 * 60 * 60 * 1000)],
            ];
            this.imap.search(searchCriteria, (err, results) => {
                if (err) {
                    this.logger.error('Search error:', err);
                    return;
                }
                if (results.length === 0) {
                    this.logger.log('No new emails to process');
                    return;
                }
                this.logger.log(`Processing ${results.length} new email(s)`);
                this.fetchEmails(results);
            });
        }
        catch (error) {
            this.logger.error('Error processing new emails:', error);
        }
    }
    fetchEmails(uids) {
        const fetch = this.imap.fetch(uids, {
            bodies: '',
            struct: true,
        });
        fetch.on('message', (msg, seqno) => {
            let buffer = '';
            let raw = '';
            msg.on('body', (stream, info) => {
                stream.on('data', (chunk) => {
                    buffer += chunk.toString('utf8');
                });
                stream.on('end', () => {
                    raw = buffer;
                });
            });
            msg.once('end', async () => {
                try {
                    await this.processEmailRaw(raw);
                }
                catch (error) {
                    this.logger.error(`Error processing email ${seqno}:`, error);
                }
            });
        });
        fetch.once('error', (err) => {
            this.logger.error('Fetch error:', err);
        });
        fetch.once('end', () => {
            this.logger.log('Finished fetching emails');
        });
    }
    async processEmailRaw(raw) {
        try {
            const parsed = await (0, mailparser_1.simpleParser)(raw);
            const header = parsed.headerLines
                .map(h => `${h.key}: ${h.line?.replace(/^.*?:\s*/, '') || ''}`)
                .join('\n');
            const receivingChain = this.extractReceivingChain(header);
            const espType = this.detectEspType(parsed.from?.text || '', header);
            const senderIp = this.extractSenderIp(header);
            const emailDto = {
                rawHeaders: header,
                receivingChain,
                espType,
                subject: parsed.subject,
                from: parsed.from?.text,
                to: parsed.to?.text,
                receivedAt: parsed.date,
                senderIp,
            };
            await this.emailsService.create(emailDto);
            this.logger.log(`✅ Email processed: ${parsed.subject} from ${espType}`);
            this.logger.log(`📧 Sender IP: ${senderIp || 'Not found'}`);
            this.logger.log(`🔗 Receiving chain: ${receivingChain.join(' → ')}`);
        }
        catch (error) {
            this.logger.error('Error processing email header:', error);
        }
    }
    extractReceivingChain(header) {
        const receivingChain = [];
        const lines = header.split('\n');
        for (const line of lines) {
            if (line.toLowerCase().startsWith('received:')) {
                const match = line.match(/from\s+([^\s]+)/i);
                if (match && match[1]) {
                    const server = match[1].replace(/[<>]/g, '');
                    if (server && !receivingChain.includes(server)) {
                        receivingChain.push(server);
                    }
                }
            }
        }
        return receivingChain.reverse();
    }
    extractSenderIp(header) {
        try {
            this.logger.debug('Extracting sender IP from headers...');
            const lines = header.split(/\r?\n/);
            const receivedHeaders = [];
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (/^received:/i.test(line)) {
                    let fullHeader = line;
                    let j = i + 1;
                    while (j < lines.length && /^\s/.test(lines[j])) {
                        fullHeader += ' ' + lines[j].trim();
                        j++;
                    }
                    receivedHeaders.push(fullHeader);
                    i = j - 1;
                }
            }
            this.logger.debug(`Found ${receivedHeaders.length} Received headers`);
            if (receivedHeaders.length === 0) {
                this.logger.debug('No Received headers found');
                return undefined;
            }
            const earliest = receivedHeaders[receivedHeaders.length - 1];
            this.logger.debug(`Analyzing earliest Received header: ${earliest}`);
            const ipPatterns = [
                /\[(\d{1,3}(?:\.\d{1,3}){3})\]/,
                /(\b\d{1,3}(?:\.\d{1,3}){3}\b)/,
                /\[(?:IPv6:)?([a-fA-F0-9:]+)\]/,
                /(\b[a-fA-F0-9:]+::[a-fA-F0-9:]+\b)/,
                /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/
            ];
            for (const pattern of ipPatterns) {
                const match = earliest.match(pattern);
                if (match && match[1]) {
                    const ip = match[1];
                    if (ip.includes('.')) {
                        const parts = ip.split('.');
                        if (parts.length === 4 && parts.every(part => {
                            const num = parseInt(part, 10);
                            return num >= 0 && num <= 255;
                        })) {
                            this.logger.debug(`Found valid IPv4: ${ip}`);
                            return ip;
                        }
                    }
                    else {
                        this.logger.debug(`Found IP: ${ip}`);
                        return ip;
                    }
                }
            }
            this.logger.debug('No valid IP found in Received headers');
            return undefined;
        }
        catch (error) {
            this.logger.error('Error extracting sender IP:', error);
            return undefined;
        }
    }
    detectEspType(from, header) {
        const domain = from.split('@')[1]?.toLowerCase() || '';
        const espPatterns = {
            'gmail': ['gmail.com', 'googlemail.com'],
            'outlook': ['outlook.com', 'hotmail.com', 'live.com', 'msn.com'],
            'yahoo': ['yahoo.com', 'ymail.com'],
            'icloud': ['icloud.com', 'me.com', 'mac.com'],
            'amazon': ['amazon.com', 'amazonses.com'],
            'zoho': ['zoho.com', 'zohomail.com'],
            'sendgrid': ['sendgrid.net'],
            'mailgun': ['mailgun.org'],
            'postmark': ['postmarkapp.com'],
            'mandrill': ['mandrillapp.com'],
        };
        for (const [esp, domains] of Object.entries(espPatterns)) {
            if (domains.some(d => domain.includes(d))) {
                return esp.charAt(0).toUpperCase() + esp.slice(1);
            }
        }
        if (header.includes('dkim=') || header.includes('spf=')) {
            return 'Verified Sender';
        }
        if (domain.includes('.corp') || domain.includes('.internal')) {
            return 'Corporate';
        }
        return 'Unknown';
    }
    async checkForNewEmails() {
        if (this.isConnected) {
            this.processNewEmails();
        }
    }
    getConnectionStatus() {
        return {
            connected: this.isConnected,
            reconnectAttempts: this.reconnectAttempts,
        };
    }
};
exports.ImapService = ImapService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_30_SECONDS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ImapService.prototype, "checkForNewEmails", null);
exports.ImapService = ImapService = ImapService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [emails_service_1.EmailsService])
], ImapService);
//# sourceMappingURL=imap.service.js.map