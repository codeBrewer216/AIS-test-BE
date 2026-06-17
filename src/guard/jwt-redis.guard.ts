import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { AuthService } from '@/auth/auth.service'
// import { authLogger } from '../../logger/winston-mongodb.logger'

@Injectable()
export class JwtRedisGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {

    const req = context.switchToHttp().getRequest()
    const authHeader: string | undefined = req.headers.authorization

    if (!authHeader) {
      throw new UnauthorizedException('No authorization header')
    }
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid auth header format')
    }
    const token = authHeader.replace(/^Bearer\s/, '')

    if (!token) {
      throw new UnauthorizedException('No token provided')
    }
    if (!token) throw new UnauthorizedException('No token provided')
    const payload = await this.authService.validateToken(token) // will throw if invalid
    // IP Binding เฉพาะ role admin
    if (payload.roles && Array.isArray(payload.roles) && payload.roles.includes('admin')) {
      let currentIp = req.ip || req.connection?.remoteAddress || ''
      currentIp = currentIp.replace('::1', '127.0.0.1').replace('::ffff:', '')
      if (payload.ip.replace('::1', '127.0.0.1').replace('::ffff:', '') !== currentIp) {
        // authLogger.warning(`Session IP mismatch`, { userId: payload.sub, expectedIp: payload.ip, currentIp: currentIp.replace('::1', '127.0.0.1').replace('::ffff:', '') });
        throw new UnauthorizedException('Session context mismatch')
      }
    }
    req.user = payload
    return true
  }
}
