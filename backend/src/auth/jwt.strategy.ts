import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRole } from '../common/enums';
import { UsersService } from '../users/users.service';
import { AuthUser } from './auth-user';

export interface JwtPayload {
  sub: string; // user id
  role: UserRole;
}

/** Verifies the token signature + expiry (done by passport-jwt), then turns the payload into request.user. */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly users: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  // Called only for a valid token. We re-read the user so a deleted account, or a changed role,
  // takes effect immediately instead of when the token expires.
  async validate(payload: JwtPayload): Promise<AuthUser> {
    const user = await this.users.findById(payload.sub);
    if (!user) throw new UnauthorizedException();
    return { id: user.id, role: user.role };
  }
}
