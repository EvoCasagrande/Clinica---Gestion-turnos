import { Injectable, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service.js';
import { PublicUser } from './types/public-user.js';

import { LoginDto } from './dto/login.js';
import { RegisterDto } from './dto/register.dto.js';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    async register(data: RegisterDto): Promise<PublicUser> {
        const passwordHash = await bcrypt.hash(data.password, 10);

        return this.prisma.user.create({
            data: {
                email: data.email,
                passwordHash,
            },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async login(data: LoginDto) {
        const { password, email } = data;

        const user = await this.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                email: true,
                passwordHash: true,
            },
        });

        if (!user) throw new UnauthorizedException('Email o contraseña incorrecta');

        const result = await bcrypt.compare(password, user?.passwordHash);

        if (!result) throw new UnauthorizedException('Email o contraseña incorrecta');

        const token = this.jwtService.sign({ sub: user.id });

        const publicUser = {
            id: user.id,
            email: user.email,
        };

        return {
            publicUser,
            token,
        };
    }
}
