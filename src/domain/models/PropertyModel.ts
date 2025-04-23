import { PrismaClient, Property, PropertyType } from '@prisma/client';
import { injectable } from 'tsyringe';

@injectable()
export class PropertyModel {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async getAllProperties(): Promise<Property[]> {
    return this.prisma.property.findMany({
      include: {
        owner: {
          include: {
            user: true
          }
        },
        photos: true
      }
    });
  }

  async getPropertyById(id: string): Promise<Property | null> {
    return this.prisma.property.findUnique({
      where: { propertyId: id },
      include: {
        owner: {
          include: {
            user: true
          }
        },
        photos: true,
        reviews: {
          include: {
            reviewer: true
          }
        }
      }
    });
  }

  async createProperty(propertyData: {
    title: string;
    description: string;
    pricePerNight: number;
    maxGuests: number;
    propertyType: PropertyType;
    ownerId: string;
    addressLine1?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    amenities?: string[];
  }): Promise<Property> {
    return this.prisma.property.create({
      data: propertyData
    });
  }

  async updateProperty(id: string, propertyData: {
    title?: string;
    description?: string;
    pricePerNight?: number;
    maxGuests?: number;
    propertyType?: PropertyType;
    addressLine1?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    amenities?: string[];
  }): Promise<Property> {
    return this.prisma.property.update({
      where: { propertyId: id },
      data: propertyData
    });
  }

  async deleteProperty(id: string): Promise<Property> {
    return this.prisma.property.delete({
      where: { propertyId: id }
    });
  }
} 