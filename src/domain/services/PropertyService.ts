import { injectable, inject } from 'tsyringe';
import { PropertyModel } from '../models/PropertyModel';
import { Property, PropertyType } from '@prisma/client';

@injectable()
export class PropertyService {
  constructor(
    @inject(PropertyModel) private propertyModel: PropertyModel
  ) {}

  async getAllProperties(): Promise<Property[]> {
    return this.propertyModel.getAllProperties();
  }

  async getPropertyById(id: string): Promise<Property | null> {
    return this.propertyModel.getPropertyById(id);
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
    // Validate data
    if (!propertyData.title || propertyData.title.trim() === '') {
      throw new Error('Property title is required');
    }
    
    if (!propertyData.description || propertyData.description.trim() === '') {
      throw new Error('Property description is required');
    }
    
    if (propertyData.pricePerNight <= 0) {
      throw new Error('Price per night must be greater than 0');
    }
    
    if (propertyData.maxGuests <= 0) {
      throw new Error('Max guests must be greater than 0');
    }

    // Process amenities if they come as a single string
    if (typeof propertyData.amenities === 'string') {
      propertyData.amenities = (propertyData.amenities as unknown as string)
        .split(',')
        .map(item => item.trim());
    }
    
    return this.propertyModel.createProperty(propertyData);
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
    // Validate data
    if (propertyData.title && propertyData.title.trim() === '') {
      throw new Error('Property title cannot be empty');
    }
    
    if (propertyData.description && propertyData.description.trim() === '') {
      throw new Error('Property description cannot be empty');
    }
    
    if (propertyData.pricePerNight && propertyData.pricePerNight <= 0) {
      throw new Error('Price per night must be greater than 0');
    }
    
    if (propertyData.maxGuests && propertyData.maxGuests <= 0) {
      throw new Error('Max guests must be greater than 0');
    }

    // Process amenities if they come as a single string
    if (typeof propertyData.amenities === 'string') {
      propertyData.amenities = (propertyData.amenities as unknown as string)
        .split(',')
        .map(item => item.trim());
    }
    
    return this.propertyModel.updateProperty(id, propertyData);
  }

  async deleteProperty(id: string): Promise<Property> {
    return this.propertyModel.deleteProperty(id);
  }
} 