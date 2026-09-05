import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  @MaxLength(200)
  email: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  password: string;
}

/**
 * Creating an account requires an existing one — see `AuthController`. The
 * minimum is longer than the login minimum on purpose: login has to accept
 * whatever was already set.
 */
export class CreateUserDto {
  @IsEmail()
  @MaxLength(200)
  email: string;

  @IsString()
  @MinLength(12, { message: 'Password must be at least 12 characters' })
  @MaxLength(200)
  password: string;
}
