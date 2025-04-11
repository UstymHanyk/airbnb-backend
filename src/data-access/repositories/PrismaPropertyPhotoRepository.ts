// src/data-access/repositories/PrismaPropertyPhotoRepository.ts
import { injectable, inject } from 'tsyringe';
import { PrismaClient, PropertyPhoto, Prisma } from '@prisma/client';
import { IPropertyPhotoRepository } from '../interfaces/IPropertyPhotoRepository';
import AppSymbols from '../../core/app-symbols';

@injectable()
export class PrismaPropertyPhotoRepository implements IPropertyPhotoRepository {
    constructor(
        @inject(AppSymbols.PrismaClient) private prisma: PrismaClient
    ) {}

    async create(data: Prisma.PropertyPhotoCreateInput): Promise<PropertyPhoto> {
        return this.prisma.propertyPhoto.create({ data });
    }

    async createMany(data: Prisma.PropertyPhotoCreateManyInput[]): Promise<Prisma.BatchPayload> {
        return this.prisma.propertyPhoto.createMany({ data, skipDuplicates: true });
    }

    async findById(photoId: string): Promise<PropertyPhoto | null> {
        return this.prisma.propertyPhoto.findUnique({ where: { photoId: photoId } });
    }

    async findByPropertyId(propertyId: string): Promise<PropertyPhoto[]> {
        return this.prisma.propertyPhoto.findMany({ where: { propertyId: propertyId } });
    }

    async update(photoId: string, data: Prisma.PropertyPhotoUpdateInput): Promise<PropertyPhoto | null> {
        try {
            return await this.prisma.propertyPhoto.update({ where: { photoId: photoId }, data: data });
        } catch (error) {
             if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2025') { return null; }
             throw error;
        }
    }

    async delete(photoId: string): Promise<PropertyPhoto | null> {
         try {
            return await this.prisma.propertyPhoto.delete({ where: { photoId: photoId } });
        } catch (error) {
             if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2025') { return null; }
             throw error;
        }
    }
}