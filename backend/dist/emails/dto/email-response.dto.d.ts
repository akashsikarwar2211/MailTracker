export declare class EmailResponseDto {
    id: string;
    rawHeaders: string;
    receivingChain: string[];
    espType: string;
    timestamp: string;
    subject?: string;
    from?: string;
    to?: string;
    receivedAt?: string;
    senderIp?: string;
    errorMessage?: string;
}
