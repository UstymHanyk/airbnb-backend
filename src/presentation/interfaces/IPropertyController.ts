interface PropertyListingDto {
    propertyId: string;
    title: string;
    city?: string | null;
    country?: string | null;
    pricePerNight: number;
    propertyType: string;
    maxGuests: number;
    mainImageUrl?: string | null;
    ownerRating?: number | null;
}

interface PropertyDetailsDto extends PropertyListingDto {
    description: string;
    addressLine1?: string | null;
    postalCode?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    amenities: string[];
    photos: { photoId: string, imageUrl: string, caption?: string | null }[];
    owner: { ownerId: string, name: string, responseRate?: number | null };
}

interface CreatePropertyDto {
    title: string;
    description: string;
    addressLine1?: string | null;
    city?: string | null;
    postalCode?: string | null;
    country?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    pricePerNight: number;
    amenities?: string[];
    maxGuests: number;
    propertyType: string;
}

export interface IPropertyController {
    listProperty(propertyData: CreatePropertyDto): Promise<PropertyDetailsDto | any>;
    searchProperties(searchCriteria: any): Promise<PropertyListingDto[] | any>;
    getPropertyDetails(propertyId: string): Promise<PropertyDetailsDto | any>;
    updateProperty(propertyId: string, updateData: Partial<CreatePropertyDto>): Promise<PropertyDetailsDto | any>;
    updateAvailability?(propertyId: string, availabilityData: any): Promise<void | any>;
}