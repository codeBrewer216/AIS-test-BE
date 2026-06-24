import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { AuthService } from '../auth/auth.service'
import { authLogger } from '@/logger/winston-mongodb.logger'
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
      authLogger.error(`Invalid auth header format: ${authHeader}`)
      throw new UnauthorizedException('Invalid auth header format')
    }
    const token = authHeader.replace(/^Bearer\s/, '')

    if (!token) {
      authLogger.error(`No token provided in auth header: ${authHeader}`)
      throw new UnauthorizedException('No token provided')
    }

    const payload = await this.authService.validateToken(token)
    if (!payload) {
      authLogger.error(`Invalid token: ${token}`)
      throw new UnauthorizedException('Invalid token')
    }

    // IP Binding เฉพาะ role admin
    const isAdmin = (Array.isArray(payload.roles) && payload?.role === 'admin')
    if (isAdmin) {
      let currentIp = req.ip || req.connection?.remoteAddress || ''
      currentIp = String(currentIp).replace('::1', '127.0.0.1').replace('::ffff:', '')
      const payloadIp = String(payload.ip ?? '').replace('::1', '127.0.0.1').replace('::ffff:', '')
      if (payloadIp !== currentIp) {
        authLogger.error(`Session context mismatch: payload IP ${payloadIp} does not match current IP ${currentIp}`)
        throw new UnauthorizedException('Session context mismatch')
      }
    }
    req.user = payload
    return true
  }
}
