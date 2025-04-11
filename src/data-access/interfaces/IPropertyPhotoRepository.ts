import { PropertyPhoto, Prisma } from '@prisma/client';

export interface IPropertyPhotoRepository {
    create(data: Prisma.PropertyPhotoCreateInput): Promise<PropertyPhoto>;
    createMany(data: Prisma.PropertyPhotoCreateManyInput[]): Promise<Prisma.BatchPayload>;
    findById(photoId: string): Promise<PropertyPhoto | null>; 
    findByPropertyId(propertyId: string): Promise<PropertyPhoto[]>;
    update(photoId: string, data: Prisma.PropertyPhotoUpdateInput): Promise<PropertyPhoto | null>;
    delete(photoId: string): Promise<PropertyPhoto | null>; 
}