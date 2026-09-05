import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto, LoginDto } from './dto/login.dto';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private auth: AuthService,
    private users: UsersService,
  ) {}

  @Public()
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Exchange credentials for a JWT' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password);
  }

  /**
   * Replaces the public `POST /auth/register`. An account here can start a
   * Metasploit run against the lab, so a new one has to be created by someone
   * who already holds a token. The first account comes from the seeder.
   */
  @Post('users')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create an account (requires an existing account)' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  createUser(@Body() dto: CreateUserDto) {
    return this.auth.createUser(dto.email, dto.password);
  }

  @Get('users')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List accounts' })
  listUsers() {
    return this.users.findAll();
  }
}
