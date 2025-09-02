import { IsString, IsArray, IsDateString, IsOptional } from 'class-validator';

export class EmailResponseDto {
  @IsString()
  id: string;

  @IsString()
  rawHeaders: string;

  @IsArray()
  @IsString({ each: true })
  receivingChain: string[];

  @IsString()
  espType: string;

  @IsDateString()
  timestamp: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;

  @IsOptional()
  @IsDateString()
  receivedAt?: string;

  @IsOptional()
  @IsString()
  senderIp?: string;

  @IsOptional()
  @IsString()
  errorMessage?: string;
}
