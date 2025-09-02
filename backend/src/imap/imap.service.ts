import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as Imap from 'imap';
import { simpleParser } from 'mailparser';
import { EmailsService } from '../emails/emails.service';
import { CreateEmailDto } from '../emails/dto/create-email.dto';

@Injectable()
export class ImapService implements OnModuleInit {
  private readonly logger = new Logger(ImapService.name);
  private imap: Imap;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(private readonly emailsService: EmailsService) {}

  async onModuleInit() {
    await this.connectToImap();
  }

  /**
   * Connect to IMAP server
   */
  private async connectToImap(): Promise<void> {
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
    } catch (error) {
      this.logger.error('Failed to create IMAP connection:', error);
      this.handleReconnection();
    }
  }

  /**
   * Handle reconnection attempts
   */
  private handleReconnection(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      
      this.logger.log(`Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connectToImap();
      }, delay);
    } else {
      this.logger.error('Max reconnection attempts reached. Please check IMAP configuration.');
    }
  }

  /**
   * Open inbox and start monitoring
   */
  private openInbox(): void {
    this.imap.openBox('INBOX', false, (err, box) => {
      if (err) {
        this.logger.error('Failed to open inbox:', err);
        return;
      }

      this.logger.log(`📬 Inbox opened. Total messages: ${box.messages.total}`);

      // Start monitoring for new emails
      this.startMonitoring();
    });
  }

  /**
   * Start monitoring for new emails
   */
  private startMonitoring(): void {
    this.imap.on('mail', (numNewMsgs) => {
      this.logger.log(`📧 ${numNewMsgs} new email(s) detected`);
      this.processNewEmails();
    });
  }

  /**
   * Process new emails
   */
  private async processNewEmails(): Promise<void> {
    try {
      const searchCriteria = [
        ['UNSEEN'],
        ['SINCE', new Date(Date.now() - 24 * 60 * 60 * 1000)], // Last 24 hours
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
    } catch (error) {
      this.logger.error('Error processing new emails:', error);
    }
  }

  /**
   * Fetch emails for processing
   */
  private fetchEmails(uids: number[]): void {
    const fetch = this.imap.fetch(uids, {
      bodies: '', // fetch full raw message
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
        } catch (error) {
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

  /**
   * Process full raw email and extract information
   */
  private async processEmailRaw(raw: string): Promise<void> {
    try {
      // Parse the full message using mailparser
      const parsed = await simpleParser(raw);
      
      // Extract headers as raw text for analysis
      const header = parsed.headerLines
        .map(h => `${h.key}: ${h.line?.replace(/^.*?:\s*/, '') || ''}`)
        .join('\n');

      // Extract receiving chain from headers
      const receivingChain = this.extractReceivingChain(header);
      
      // Detect ESP type
      const espType = this.detectEspType(parsed.from?.text || '', header);

      // Extract sender IP address from the earliest Received header
      const senderIp = this.extractSenderIp(header);
      
      // Create email DTO
      const emailDto: CreateEmailDto = {
        rawHeaders: header,
        receivingChain,
        espType,
        subject: parsed.subject,
        from: parsed.from?.text,
        to: parsed.to?.text,
        receivedAt: parsed.date,
        senderIp,
      };

      // Save to database
      await this.emailsService.create(emailDto);
      
      this.logger.log(`✅ Email processed: ${parsed.subject} from ${espType}`);
      this.logger.log(`📧 Sender IP: ${senderIp || 'Not found'}`);
      this.logger.log(`🔗 Receiving chain: ${receivingChain.join(' → ')}`);
    } catch (error) {
      this.logger.error('Error processing email header:', error);
    }
  }

  /**
   * Extract receiving chain from email headers
   */
  private extractReceivingChain(header: string): string[] {
    const receivingChain: string[] = [];
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
    
    return receivingChain.reverse(); // Reverse to show chronological order
  }

  /**
   * Extract sender IP from the earliest Received header
   */
  private extractSenderIp(header: string): string | undefined {
    try {
      this.logger.debug('Extracting sender IP from headers...');
      
      // Split headers and find all Received headers
      const lines = header.split(/\r?\n/);
      const receivedHeaders: string[] = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (/^received:/i.test(line)) {
          // Collect multi-line received headers
          let fullHeader = line;
          let j = i + 1;
          while (j < lines.length && /^\s/.test(lines[j])) {
            fullHeader += ' ' + lines[j].trim();
            j++;
          }
          receivedHeaders.push(fullHeader);
          i = j - 1; // Skip processed lines
        }
      }

      this.logger.debug(`Found ${receivedHeaders.length} Received headers`);

      if (receivedHeaders.length === 0) {
        this.logger.debug('No Received headers found');
        return undefined;
      }

      // The last Received header is usually closest to the sender
      const earliest = receivedHeaders[receivedHeaders.length - 1];
      this.logger.debug(`Analyzing earliest Received header: ${earliest}`);

      // Enhanced IP patterns for various formats
      const ipPatterns = [
        // IPv4 in brackets: [192.168.1.1]
        /\[(\d{1,3}(?:\.\d{1,3}){3})\]/,
        // IPv4 without brackets: 192.168.1.1
        /(\b\d{1,3}(?:\.\d{1,3}){3}\b)/,
        // IPv6 in brackets: [IPv6:2001:db8::1] or [2001:db8::1]
        /\[(?:IPv6:)?([a-fA-F0-9:]+)\]/,
        // IPv6 without brackets
        /(\b[a-fA-F0-9:]+::[a-fA-F0-9:]+\b)/,
        // Generic IP pattern
        /(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/
      ];

      for (const pattern of ipPatterns) {
        const match = earliest.match(pattern);
        if (match && match[1]) {
          const ip = match[1];
          // Validate IPv4 format
          if (ip.includes('.')) {
            const parts = ip.split('.');
            if (parts.length === 4 && parts.every(part => {
              const num = parseInt(part, 10);
              return num >= 0 && num <= 255;
            })) {
              this.logger.debug(`Found valid IPv4: ${ip}`);
              return ip;
            }
          } else {
            // IPv6 or other format
            this.logger.debug(`Found IP: ${ip}`);
            return ip;
          }
        }
      }

      this.logger.debug('No valid IP found in Received headers');
      return undefined;
    } catch (error) {
      this.logger.error('Error extracting sender IP:', error);
      return undefined;
    }
  }

  /**
   * Detect ESP type based on domain and headers
   */
  private detectEspType(from: string, header: string): string {
    const domain = from.split('@')[1]?.toLowerCase() || '';
    
    // Known ESP patterns
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

    // Check domain patterns
    for (const [esp, domains] of Object.entries(espPatterns)) {
      if (domains.some(d => domain.includes(d))) {
        return esp.charAt(0).toUpperCase() + esp.slice(1);
      }
    }

    // Check for DKIM/SPF records in headers
    if (header.includes('dkim=') || header.includes('spf=')) {
      return 'Verified Sender';
    }

    // Check for corporate domains
    if (domain.includes('.corp') || domain.includes('.internal')) {
      return 'Corporate';
    }

    return 'Unknown';
  }

  /**
   * Scheduled task to check for new emails
   */
  @Cron(CronExpression.EVERY_30_SECONDS)
  async checkForNewEmails(): Promise<void> {
    if (this.isConnected) {
      this.processNewEmails();
    }
  }

  /**
   * Health check method
   */
  getConnectionStatus(): { connected: boolean; reconnectAttempts: number } {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
    };
  }
}
