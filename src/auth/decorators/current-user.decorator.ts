import { createParamDecorator, ExecutionContext, InternalServerErrorException } from "@nestjs/common";

export const CurrentUser = createParamDecorator(
    (data, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;

        if(!user) throw new InternalServerErrorException('Usuario no encontrado')

        return user
})