import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from './roles.decorator'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!requiredRoles) return true

    const request = context.switchToHttp().getRequest()
    const user = request.user
    if (!user) return false

    const raw = user.roles ?? user.role
    const userRoles = Array.isArray(raw) ? raw : [raw]
    const normalized = userRoles.filter(Boolean) as string[]
    return requiredRoles.some((role) => normalized.includes(role))
  }
}
