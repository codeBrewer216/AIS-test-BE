import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtRedisGuard } from '../guard/jwt-redis.guard';

export interface JwtRequest extends Request {
  user: {
    email: string
    sub: string
    role: string[]
    imageUrl: string | null
    _id: string
  }
}


@ApiTags('AUTH')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('login')
  @ApiOperation({ summary: 'User Login', description: 'Authenticate a user and return a JWT token' })
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
  @ApiOperation({ summary: 'Get Authenticated User Info', description: 'Retrieve the information of the authenticated user' })
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
  @ApiOperation({ summary: 'User Logout', description: 'Invalidate the JWT token and log out the user' })
  @UseGuards(JwtRedisGuard)
  @ApiBearerAuth('access-token')
  async logout(@Req() req: Request) {
    const authHeader = req.headers['authorization']
    const token: string = authHeader?.replace(/^Bearer /, '')
    if (token) {
      await this.authService.logout(token)
    }
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh JWT Token', description: 'Refresh the JWT token for the authenticated user' })
  @UseGuards(JwtRedisGuard)
  @ApiBearerAuth('access-token')
  async refreshToken(@Req() req: JwtRequest) {
    const authHeader = req.headers['authorization']
    const token: string = authHeader?.replace(/^Bearer /, '')
    if (token) {
      const payload: { email: string } = await this.authService.getPayloadFromToken(token)
      return this.authService.login(payload.email, null)
    }
  }
}
