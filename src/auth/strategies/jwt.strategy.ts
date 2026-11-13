import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy} from "passport-jwt";
import { JwtPayload } from "../interfaces/jwt-payload.interface.js";
import { UsersService } from "../../users/users.service.js";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PublicUser } from "../types/public-user.js";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        configService: ConfigService,
        private readonly usersService: UsersService){
        super({
            secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false
        });
    }

    async validate(payload: JwtPayload): Promise<PublicUser> {
        const { sub } = payload;
    
        const user = await this.usersService.findPublicById(sub)

        if(user === null) throw new UnauthorizedException('Acceso no autorizado')

        return user
    }
}