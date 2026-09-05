import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Opens one route to unauthenticated callers. Everything else is closed by
 * the globally registered `JwtAuthGuard`, so a new controller is protected by
 * default — the previous arrangement had a `JwtStrategy` and not a single
 * `@UseGuards`, which `main.ts` admitted in a comment.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
