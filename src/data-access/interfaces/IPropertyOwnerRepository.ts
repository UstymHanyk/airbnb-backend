import { PropertyOwner, Prisma } from '@prisma/client';

export interface IPropertyOwnerRepository {
    create(data: Prisma.PropertyOwnerCreateInput): Promise<PropertyOwner>;
    createMany(data: Prisma.PropertyOwnerCreateManyInput[]): Promise<Prisma.BatchPayload>;
    findById(ownerId: string): Promise<PropertyOwner | null>;
    findByUserId(userId: string): Promise<PropertyOwner | null>;
    update(ownerId: string, data: Prisma.PropertyOwnerUpdateInput): Promise<PropertyOwner | null>; 
    delete(ownerId: string): Promise<PropertyOwner | null>;
}