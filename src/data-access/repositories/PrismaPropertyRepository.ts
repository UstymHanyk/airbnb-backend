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
        try {
            return await this.prisma.property.create({ data });
        } catch (error) {
            console.error("Error creating property:", error);
            throw error;
        }
    }

    async createMany(data: Prisma.PropertyCreateManyInput[]): Promise<Prisma.BatchPayload> {
        try {
            return await this.prisma.property.createMany({ data, skipDuplicates: true });
        } catch (error) {
            console.error("Error creating multiple properties:", error);
            throw error;
        }
    }

    async findById(propertyId: string): Promise<Property | null> {
        try {
            return await this.prisma.property.findUnique({ where: { propertyId: propertyId } });
        } catch (error) {
            console.error(`Error finding property by ID ${propertyId}:`, error);
            throw error;
        }
    }

    async findByOwnerId(ownerId: string): Promise<Property[]> {
        try {
            return await this.prisma.property.findMany({ where: { ownerId: ownerId } });
        } catch (error) {
            console.error(`Error finding properties by owner ID ${ownerId}:`, error);
            throw error;
        }
    }

    async findMany(args?: Prisma.PropertyFindManyArgs): Promise<Property[]> {
        try {
            return await this.prisma.property.findMany(args);
        } catch (error) {
            console.error("Error finding multiple properties:", error);
            throw error;
        }
    }

    async update(propertyId: string, data: Prisma.PropertyUpdateInput): Promise<Property | null> {
        try {
            return await this.prisma.property.update({ where: { propertyId: propertyId }, data: data });
        } catch (error) {
            if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2025') { 
                return null; 
            }
            console.error(`Error updating property ${propertyId}:`, error);
            throw error;
        }
    }

    async delete(propertyId: string): Promise<Property | null> {
        try {
            return await this.prisma.property.delete({ where: { propertyId: propertyId } });
        } catch (error) {
            if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2025') { 
                return null; 
            }
            console.error(`Error deleting property ${propertyId}:`, error);
            throw error;
        }
    }
}