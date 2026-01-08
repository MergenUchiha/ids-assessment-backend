import { IsString, IsInt, IsEnum, Min, Max, IsNotEmpty } from 'class-validator';

export class CreateScenarioDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  exploitType: string;

  @IsNotEmpty()
  @IsString()
  targetIP: string;

  @IsNotEmpty()
  @IsString()
  targetOS: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  targetPort: number;

  @IsEnum(['draft', 'ready', 'running', 'completed'])
  status?: string;
}

export class UpdateScenarioDto {
  @IsString()
  name?: string;

  @IsString()
  description?: string;

  @IsString()
  exploitType?: string;

  @IsString()
  targetIP?: string;

  @IsString()
  targetOS?: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  targetPort?: number;

  @IsEnum(['draft', 'ready', 'running', 'completed'])
  status?: string;
}