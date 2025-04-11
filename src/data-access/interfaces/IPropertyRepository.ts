import { Property, Prisma } from '@prisma/client';

export interface IPropertyRepository {
    create(data: Prisma.PropertyCreateInput): Promise<Property>;
    createMany(data: Prisma.PropertyCreateManyInput[]): Promise<Prisma.BatchPayload>;
    findById(propertyId: string): Promise<Property | null>;
    findByOwnerId(ownerId: string): Promise<Property[]>;
    findMany(args?: Prisma.PropertyFindManyArgs): Promise<Property[]>;
    update(propertyId: string, data: Prisma.PropertyUpdateInput): Promise<Property | null>;
    delete(propertyId: string): Promise<Property | null>; 
}