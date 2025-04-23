declare module '../presentation/controllers/PropertyController' {
  import { Request, Response } from 'express';
  
  export class PropertyController {
    getAllProperties(req: Request, res: Response): Promise<void>;
    getCreateForm(req: Request, res: Response): Promise<void>;
    createProperty(req: Request, res: Response): Promise<void>;
    getPropertyDetails(req: Request, res: Response): Promise<void>;
    getEditForm(req: Request, res: Response): Promise<void>;
    updateProperty(req: Request, res: Response): Promise<void>;
    deleteProperty(req: Request, res: Response): Promise<void>;
  }
} 