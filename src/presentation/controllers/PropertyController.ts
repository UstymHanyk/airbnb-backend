import { injectable, inject } from 'tsyringe';
import { Request, Response } from 'express';
import { PropertyService } from '../../domain/services/PropertyService';
import AppSymbols from '../../core/app-symbols';
import { PropertyType } from '@prisma/client';

@injectable()
export class PropertyController {
  constructor(
    @inject(AppSymbols.PropertyService) private propertyService: PropertyService
  ) {}

  // GET /properties
  async getAllProperties(req: Request, res: Response): Promise<void> {
    try {
      const properties = await this.propertyService.getAllProperties();
      res.render('properties/index', { properties });
    } catch (error) {
      console.error('Error fetching properties:', error);
      res.status(500).render('error', { message: 'Failed to load properties' });
    }
  }

  // GET /properties/new
  async getCreateForm(req: Request, res: Response): Promise<void> {
    try {
      const propertyTypes = Object.values(PropertyType);
      res.render('properties/new', { propertyTypes });
    } catch (error) {
      console.error('Error loading create form:', error);
      res.status(500).render('error', { message: 'Failed to load create form' });
    }
  }

  // POST /properties
  async createProperty(req: Request, res: Response): Promise<void> {
    try {
      const propertyData = {
        title: req.body.title,
        description: req.body.description,
        pricePerNight: parseFloat(req.body.pricePerNight),
        maxGuests: parseInt(req.body.maxGuests),
        propertyType: req.body.propertyType as PropertyType,
        ownerId: req.body.ownerId,
        addressLine1: req.body.addressLine1,
        city: req.body.city,
        postalCode: req.body.postalCode,
        country: req.body.country,
        amenities: req.body.amenities || []
      };

      await this.propertyService.createProperty(propertyData);
      res.redirect('/properties');
    } catch (error) {
      console.error('Error creating property:', error);
      const propertyTypes = Object.values(PropertyType);
      res.status(400).render('properties/new', { 
        propertyTypes,
        property: req.body,
        error: error instanceof Error ? error.message : 'Failed to create property'
      });
    }
  }

  // GET /properties/:id
  async getPropertyDetails(req: Request, res: Response): Promise<void> {
    try {
      const propertyId = req.params.id;
      const property = await this.propertyService.getPropertyById(propertyId);
      
      if (!property) {
        return res.status(404).render('error', { message: 'Property not found' });
      }
      
      res.render('properties/details', { property });
    } catch (error) {
      console.error('Error fetching property details:', error);
      res.status(500).render('error', { message: 'Failed to load property details' });
    }
  }

  // GET /properties/:id/edit
  async getEditForm(req: Request, res: Response): Promise<void> {
    try {
      const propertyId = req.params.id;
      const property = await this.propertyService.getPropertyById(propertyId);
      
      if (!property) {
        return res.status(404).render('error', { message: 'Property not found' });
      }
      
      const propertyTypes = Object.values(PropertyType);
      res.render('properties/edit', { property, propertyTypes });
    } catch (error) {
      console.error('Error loading edit form:', error);
      res.status(500).render('error', { message: 'Failed to load edit form' });
    }
  }

  // POST /properties/:id
  async updateProperty(req: Request, res: Response): Promise<void> {
    try {
      const propertyId = req.params.id;
      const propertyData = {
        title: req.body.title,
        description: req.body.description,
        pricePerNight: parseFloat(req.body.pricePerNight),
        maxGuests: parseInt(req.body.maxGuests),
        propertyType: req.body.propertyType as PropertyType,
        addressLine1: req.body.addressLine1,
        city: req.body.city,
        postalCode: req.body.postalCode,
        country: req.body.country,
        amenities: req.body.amenities || []
      };

      await this.propertyService.updateProperty(propertyId, propertyData);
      res.redirect(`/properties/${propertyId}`);
    } catch (error) {
      console.error('Error updating property:', error);
      const propertyTypes = Object.values(PropertyType);
      res.status(400).render('properties/edit', { 
        property: { ...req.body, propertyId: req.params.id },
        propertyTypes,
        error: error instanceof Error ? error.message : 'Failed to update property'
      });
    }
  }

  // POST /properties/:id/delete
  async deleteProperty(req: Request, res: Response): Promise<void> {
    try {
      const propertyId = req.params.id;
      await this.propertyService.deleteProperty(propertyId);
      res.redirect('/properties');
    } catch (error) {
      console.error('Error deleting property:', error);
      res.status(500).render('error', { message: 'Failed to delete property' });
    }
  }
} 