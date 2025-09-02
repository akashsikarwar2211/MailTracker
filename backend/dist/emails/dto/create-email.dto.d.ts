export declare class CreateEmailDto {
    rawHeaders: string;
    receivingChain: string[];
    espType: string;
    subject?: string;
    from?: string;
    to?: string;
    receivedAt?: string;
    senderIp?: string;
}
