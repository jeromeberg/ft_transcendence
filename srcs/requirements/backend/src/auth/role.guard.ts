import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '../common/types';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private requiredRole: UserRole) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.role !== this.requiredRole) {
      throw new ForbiddenException(`Only ${this.requiredRole}s can access this resource`);
    }

    return true;
  }
}
