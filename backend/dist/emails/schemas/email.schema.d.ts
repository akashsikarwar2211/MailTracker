import { Document, Types } from 'mongoose';
export type EmailDocument = Email & Document;
export declare class Email {
    rawHeaders: string;
    receivingChain: string[];
    espType: string;
    timestamp: Date;
    subject?: string;
    from?: string;
    to?: string;
    receivedAt?: Date;
    senderIp?: string;
    processed: boolean;
    errorMessage?: string;
}
export declare const EmailSchema: import("mongoose").Schema<Email, import("mongoose").Model<Email, any, any, any, Document<unknown, any, Email, any, {}> & Email & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Email, Document<unknown, {}, import("mongoose").FlatRecord<Email>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Email> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
