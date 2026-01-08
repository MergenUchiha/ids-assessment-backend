import { IsString, IsEnum, IsNotEmpty } from 'class-validator';

export class CreateReportDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsEnum(['summary', 'detailed', 'comparative'])
  type: string;

  @IsEnum(['pdf', 'csv', 'json'])
  format: string;

  @IsString()
  dateRange: string;
}