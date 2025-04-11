import { injectable, inject } from 'tsyringe';
import { PrismaClient, Property, Prisma } from '@prisma/client';
import { IPropertyRepository } from '../interfaces/IPropertyRepository';
import AppSymbols from '../../core/app-symbols';

@injectable()
export class PrismaPropertyRepository implements IPropertyRepository {
    constructor(
        @inject(AppSymbols.PrismaClient) private prisma: PrismaClient
    ) {}

    async create(data: Prisma.PropertyCreateInput): Promise<Property> {
        return this.prisma.property.create({ data });
    }

    async createMany(data: Prisma.PropertyCreateManyInput[]): Promise<Prisma.BatchPayload> {
        return this.prisma.property.createMany({ data, skipDuplicates: true });
    }

    async findById(propertyId: string): Promise<Property | null> {
        return this.prisma.property.findUnique({ where: { propertyId: propertyId } });
    }

    async findByOwnerId(ownerId: string): Promise<Property[]> {
        return this.prisma.property.findMany({ where: { ownerId: ownerId } });
    }

    async findMany(args?: Prisma.PropertyFindManyArgs): Promise<Property[]> {
        return this.prisma.property.findMany(args);
    }

    async update(propertyId: string, data: Prisma.PropertyUpdateInput): Promise<Property | null> {
         try {
            return await this.prisma.property.update({ where: { propertyId: propertyId }, data: data });
        } catch (error) {
             if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2025') { return null; }
             throw error;
        }
    }

    async delete(propertyId: string): Promise<Property | null> {
        try {
            return await this.prisma.property.delete({ where: { propertyId: propertyId } });
        } catch (error) {
             if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2025') { return null; }
             throw error;
        }
    }
}