import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';
import { JwtRedisGuard } from '@/guard/jwt-redis.guard';

export interface JwtRequest extends Request {
  user: {
    email: string
    sub: string
    role: string[]
    imageUrl: string | null
  }
}


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'password123' }
      }
    }
  })
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password)
  }

  @Get('me')
  @UseGuards(JwtRedisGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get User Profile', description: 'Retrieve the profile information of the authenticated user' })
  getProfile(@Req() req: JwtRequest) {
    return {
      user: req.user.email,
      roles: req.user.role,
      img: req.user.imageUrl
    }
  }

  @Post('logout')
  async logout(@Body('token') token: string) {
    return await this.authService.logout(token);
  }
}
