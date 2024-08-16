import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Custom logic before the base `canActivate` method
    const request = context.switchToHttp().getRequest();
    console.log('JwtAuthGuard - Request:', request); // Debugging log

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext, status?: any) {
    // Custom logic to handle request errors or user validation
    if (err || !user) {
      throw err || new Error('Unauthorized');
    }
    return user;
  }
}
