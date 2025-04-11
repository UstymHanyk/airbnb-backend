import { injectable, inject } from 'tsyringe';
import { PrismaClient, User, Prisma } from '@prisma/client';
import { IUserRepository } from '../interfaces/IUserRepository';
import AppSymbols from '../../core/app-symbols';

@injectable()
export class PrismaUserRepository implements IUserRepository {
    constructor(
        @inject(AppSymbols.PrismaClient) private prisma: PrismaClient
    ) {}

    async create(data: Prisma.UserCreateInput): Promise<User> {
        return this.prisma.user.create({ data });
    }

    async createMany(data: Prisma.UserCreateManyInput[]): Promise<Prisma.BatchPayload> {
        return this.prisma.user.createMany({ data, skipDuplicates: true });
    }

    async findById(userId: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { userId: userId } });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({ where: { email: email } });
    }

    async findMany(args?: Prisma.UserFindManyArgs): Promise<User[]> {
        return this.prisma.user.findMany(args);
    }

    async update(userId: string, data: Prisma.UserUpdateInput): Promise<User | null> {
        try {
            return await this.prisma.user.update({
                where: { userId: userId },
                data: data,
            });
        } catch (error) {
            // Handle potential errors like record not found (P2025)
            if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2025') {
                return null;
            }
            console.error(`Error updating user ${userId}:`, error);
            throw error; // Re-throw other errors
        }
    }

    async delete(userId: string): Promise<User | null> {
         try {
            return await this.prisma.user.delete({
                where: { userId: userId },
            });
        } catch (error) {
            if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2025') {
                return null; // Record to delete not found
            }
            console.error(`Error deleting user ${userId}:`, error);
            throw error;
        }
    }
}