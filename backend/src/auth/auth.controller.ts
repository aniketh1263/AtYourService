import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import type { AuthUser } from './auth-user';
import { CurrentUser, Public } from './decorators';
import { LoginDto, RegisterDto } from './dto/auth.dto';

// Login and sign-up are limited to 5 tries per minute per IP: slows down password guessing.
const STRICT = { default: { limit: 5, ttl: 60_000 } };

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  // POST /api/auth/register  { name, email, password } -> { accessToken, user }
  @Public()
  @Throttle(STRICT)
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  // POST /api/auth/login  { email, password } -> { accessToken, user }
  @Public()
  @Throttle(STRICT)
  @HttpCode(200)
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  // GET /api/auth/me -> the logged-in user (the frontend calls this on page load to restore the session)
  @Get('me')
  me(@CurrentUser() user: AuthUser) {
    return this.auth.me(user.id);
  }
}
