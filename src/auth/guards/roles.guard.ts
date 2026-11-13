import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from '../decorators/roles.decorator.js';
import { ValidRoles } from '../interfaces/valid-roles.interface.js';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector){}
    
    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
        const validRoles: ValidRoles[] = this.reflector.getAllAndOverride(ROLES_KEY, [context.getHandler(), context.getClass()])
        
        if(!validRoles) return true
        if(validRoles.length === 0) return true
        
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if(!user) throw new UnauthorizedException('Acceso no autorizado')

        if(validRoles.includes(user.role)) return true
        
        throw new ForbiddenException('Acceso no autorizado');
    }
}
