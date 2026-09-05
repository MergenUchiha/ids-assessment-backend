import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { UsersService } from '../users/users.service';

export const BCRYPT_ROUNDS = 12;

/**
 * A bcrypt hash of a random value, computed once at startup, so comparing
 * against an unknown email costs the same as a known one and the response
 * time does not reveal which addresses are registered.
 */
const DUMMY_HASH = bcrypt.hashSync(
  randomBytes(32).toString('hex'),
  BCRYPT_ROUNDS,
);

@Injectable()
export class AuthService {
  constructor(
    private users: UsersService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.users.findByEmail(email);
    const matches = await bcrypt.compare(
      password,
      user?.password ?? DUMMY_HASH,
    );

    // `register` used to throw UnauthorizedException for a duplicate email,
    // which told an anonymous caller which addresses already had accounts.
    if (!user || !matches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.sign(user.id, user.email);
  }

  /** Requires an existing account — this platform launches attacks. */
  async createUser(email: string, password: string) {
    if (await this.users.findByEmail(email)) {
      throw new ConflictException('An account with that email already exists');
    }

    const user = await this.users.create(
      email,
      await bcrypt.hash(password, BCRYPT_ROUNDS),
    );

    return { id: user.id, email: user.email, createdAt: user.createdAt };
  }

  private sign(userId: string, email: string) {
    return {
      access_token: this.jwt.sign(
        { sub: userId, email },
        { expiresIn: this.config.getOrThrow<string>('JWT_EXPIRES_IN') },
      ),
    };
  }
}
