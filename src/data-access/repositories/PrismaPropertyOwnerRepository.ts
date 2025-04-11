import { injectable, inject } from 'tsyringe';
import { PrismaClient, PropertyOwner, Prisma } from '@prisma/client';
import { IPropertyOwnerRepository } from '../interfaces/IPropertyOwnerRepository';
import AppSymbols from '../../core/app-symbols';

@injectable()
export class PrismaPropertyOwnerRepository implements IPropertyOwnerRepository {
    constructor(
        @inject(AppSymbols.PrismaClient) private prisma: PrismaClient
    ) {}

    async create(data: Prisma.PropertyOwnerCreateInput): Promise<PropertyOwner> {
        return this.prisma.propertyOwner.create({ data });
    }

    async createMany(data: Prisma.PropertyOwnerCreateManyInput[]): Promise<Prisma.BatchPayload> {
        return this.prisma.propertyOwner.createMany({ data, skipDuplicates: true });
    }

    async findById(ownerId: string): Promise<PropertyOwner | null> {
        return this.prisma.propertyOwner.findUnique({ where: { id: ownerId } });
    }

    async findByUserId(userId: string): Promise<PropertyOwner | null> {
        return this.prisma.propertyOwner.findUnique({ where: { userId: userId } });
    }

     async update(ownerId: string, data: Prisma.PropertyOwnerUpdateInput): Promise<PropertyOwner | null> {
         try {
            return await this.prisma.propertyOwner.update({
                where: { id: ownerId },
                data: data,
            });
        } catch (error) {
             if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2025') { return null; }
             throw error;
        }
    }

    async delete(ownerId: string): Promise<PropertyOwner | null> {
        try {
            return await this.prisma.propertyOwner.delete({
                where: { id: ownerId },
            });
        } catch (error) {
            if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2025') { return null; }
             throw error;
        }
    }
}