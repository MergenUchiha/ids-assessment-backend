import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

/**
 * A Metasploit module path, as Metasploit itself writes them:
 * `auxiliary/scanner/http/http_version`, `exploit/unix/ftp/vsftpd_234_backdoor`.
 *
 * This value reaches `msfconsole -x`, so the pattern is deliberately narrow —
 * no spaces, no quotes, no semicolons, no shell metacharacters of any kind.
 * The endpoint had no DTO at all before, and the body type was an inline
 * object literal, which `ValidationPipe` skips entirely.
 */
export const MSF_MODULE_PATTERN =
  /^(auxiliary|exploit|post|payload|encoder|nop|evasion)\/[a-z0-9_]+(\/[a-z0-9_]+)+$/;

export class CreateScenarioDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsString()
  @Matches(MSF_MODULE_PATTERN, {
    message:
      'msfModule must be a Metasploit module path such as auxiliary/scanner/http/http_version',
  })
  @MaxLength(200)
  msfModule: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9_]+(\/[a-z0-9_]+)+$/, {
    message: 'payload must be a Metasploit payload path',
  })
  @MaxLength(200)
  payload?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  rport?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(50)
  @MaxLength(500, { each: true })
  expectedSignatures?: string[];
}
