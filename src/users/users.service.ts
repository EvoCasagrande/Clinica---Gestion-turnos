import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { PublicUser } from './types/public-user.js';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

    getAll(): Promise<PublicUser[]> {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async getById(id: string): Promise<PublicUser> {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!user) throw new NotFoundException('Usuario no encontrado');

        return user;
    }

    async delete(id: string): Promise<void> {
        await this.prisma.user.delete({
            where: { id },
        });
    }

    async findPublicById(id: string): Promise<PublicUser | null> {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if(!user) return null

        return user
    }
}
