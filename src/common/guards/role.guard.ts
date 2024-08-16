import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "../decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredRoles) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        console.log('Required Roles:', requiredRoles);
        console.log('User Role:', user?.role);
        
        if (!user) {
            throw new ForbiddenException('user not found in request');
        }

        if (!requiredRoles.includes(user.role)) {
            throw new ForbiddenException('user does not have the required role');
        }

        return true;
    }
}
