import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

export const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      // Public 라우트에서도 토큰이 있으면 사용자 정보 추출 시도
      const request = context.switchToHttp().getRequest();
      const authHeader = request.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        // 토큰이 있으면 검증 시도 (실패해도 통과)
        return super.canActivate(context);
      }
      return true;
    }

    return super.canActivate(context);
  }

  // Public 라우트에서 토큰 검증 실패 시 에러 대신 null user로 진행
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic && !user) {
      // Public 라우트에서는 인증 실패해도 통과 (user는 undefined)
      return null;
    }

    if (err || !user) {
      throw err || new Error('Unauthorized');
    }

    return user;
  }
}
