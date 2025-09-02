import { IsString, IsArray, IsOptional, IsDateString } from 'class-validator';

export class CreateEmailDto {
  @IsString()
  rawHeaders: string;

  @IsArray()
  @IsString({ each: true })
  receivingChain: string[];

  @IsString()
  espType: string;

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
}
