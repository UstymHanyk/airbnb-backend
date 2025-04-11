import { injectable, inject } from 'tsyringe';
import { PrismaClient, Guest, Prisma } from '@prisma/client';
import { IGuestRepository } from '../interfaces/IGuestRepository';
import AppSymbols from '../../core/app-symbols';

@injectable()
export class PrismaGuestRepository implements IGuestRepository {
     constructor(
        @inject(AppSymbols.PrismaClient) private prisma: PrismaClient
    ) {}

    async create(data: Prisma.GuestCreateInput): Promise<Guest> {
         return this.prisma.guest.create({ data });
    }

    async createMany(data: Prisma.GuestCreateManyInput[]): Promise<Prisma.BatchPayload> {
         return this.prisma.guest.createMany({ data, skipDuplicates: true });
    }

    async findById(guestId: string): Promise<Guest | null> {
        return this.prisma.guest.findUnique({ where: { id: guestId } });
    }

    async findByUserId(userId: string): Promise<Guest | null> {
        return this.prisma.guest.findUnique({ where: { userId: userId } });
    }

    async update(guestId: string, data: Prisma.GuestUpdateInput): Promise<Guest | null> {
        try {
            return await this.prisma.guest.update({ where: { id: guestId }, data: data });
        } catch (error) {
            if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2025') { return null; }
            throw error;
        }
    }

    async delete(guestId: string): Promise<Guest | null> {
         try {
            return await this.prisma.guest.delete({ where: { id: guestId } });
        } catch (error) {
            if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2025') { return null; }
            throw error;
        }
    }
}