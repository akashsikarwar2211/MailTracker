import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EmailDocument = Email & Document;

@Schema({
  timestamps: true,
  collection: 'emails',
})
export class Email {
  @Prop({ required: true, type: String })
  rawHeaders: string;

  @Prop({ required: true, type: [String], default: [] })
  receivingChain: string[];

  @Prop({ required: true, type: String })
  espType: string;

  @Prop({ required: true, type: Date, default: Date.now })
  timestamp: Date;

  @Prop({ type: String, required: false })
  subject?: string;

  @Prop({ type: String, required: false })
  from?: string;

  @Prop({ type: String, required: false })
  to?: string;

  @Prop({ type: Date, required: false })
  receivedAt?: Date;

  @Prop({ type: String, required: false })
  senderIp?: string;

  @Prop({ type: Boolean, default: false })
  processed: boolean;

  @Prop({ type: String, required: false })
  errorMessage?: string;
}

export const EmailSchema = SchemaFactory.createForClass(Email);

// Indexes for better query performance
EmailSchema.index({ timestamp: -1 });
EmailSchema.index({ espType: 1 });
EmailSchema.index({ processed: 1 });
EmailSchema.index({ 'receivingChain.server': 1 });
