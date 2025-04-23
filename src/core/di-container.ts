// src/core/di-container.ts
import 'reflect-metadata'; // MUST be the first import
import { container } from 'tsyringe';
import { PrismaClient } from '@prisma/client';
import AppSymbols from './app-symbols';

// --- Import DAL Interfaces ---
import { ICsvDataReader } from '../data-access/csv/ICsvDataReader';
import { IUserRepository } from '../data-access/interfaces/IUserRepository';
import { IPropertyOwnerRepository } from '../data-access/interfaces/IPropertyOwnerRepository';
import { IGuestRepository } from '../data-access/interfaces/IGuestRepository';
import { IPropertyRepository } from '../data-access/interfaces/IPropertyRepository';
import { IPropertyPhotoRepository } from '../data-access/interfaces/IPropertyPhotoRepository';
import { IReviewRepository } from '../data-access/interfaces/IReviewRepository';
import { IReservationRepository } from '../data-access/interfaces/IReservationRepository';
import { IPaymentRepository } from '../data-access/interfaces/IPaymentRepository';

// --- Import DAL Implementations ---
import { CsvDataReader } from '../data-access/csv/CsvDataReader';
import { PrismaUserRepository } from '../data-access/repositories/PrismaUserRepository';
import { PrismaPropertyOwnerRepository } from '../data-access/repositories/PrismaPropertyOwnerRepository';
import { PrismaGuestRepository } from '../data-access/repositories/PrismaGuestRepository';
import { PrismaPropertyRepository } from '../data-access/repositories/PrismaPropertyRepository';
import { PrismaPropertyPhotoRepository } from '../data-access/repositories/PrismaPropertyPhotoRepository';
import { PrismaReviewRepository } from '../data-access/repositories/PrismaReviewRepository';
import { PrismaReservationRepository } from '../data-access/repositories/PrismaReservationRepository';
import { PrismaPaymentRepository } from '../data-access/repositories/PrismaPaymentRepository';

// --- Import BLL Interfaces ---
import { IDataLoadingService } from '../domain/interfaces/IDataLoadingService';
// Import other BLL interfaces if they exist (e.g., IUserService)

// --- Import BLL Implementations ---
import { DataLoadingService } from '../domain/services/DataLoadingService';
import { PropertyService } from '../domain/services/PropertyService';
import { PropertyModel } from '../domain/models/PropertyModel';

// --- Import PL Implementations ---
import { PropertyController } from '../presentation/controllers/PropertyController';

// --- Register Dependencies ---

// Register Prisma Client as a singleton instance
// This ensures all repositories use the same DB connection pool
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
  // Adding connection management options
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Add middleware to handle potential connection issues
prisma.$use(async (params, next) => {
  try {
    return await next(params);
  } catch (error) {
    // Log the error for debugging
    console.error("Prisma middleware caught an error:", error);
    throw error;
  }
});

container.register<PrismaClient>(AppSymbols.PrismaClient, { useValue: prisma });

// --- Register DAL ---
container.register<ICsvDataReader>(AppSymbols.CsvDataReader, { useClass: CsvDataReader });
container.register<IUserRepository>(AppSymbols.UserRepository, { useClass: PrismaUserRepository });
container.register<IPropertyOwnerRepository>(AppSymbols.PropertyOwnerRepository, { useClass: PrismaPropertyOwnerRepository });
container.register<IGuestRepository>(AppSymbols.GuestRepository, { useClass: PrismaGuestRepository });
container.register<IPropertyRepository>(AppSymbols.PropertyRepository, { useClass: PrismaPropertyRepository });
container.register<IPropertyPhotoRepository>(AppSymbols.PropertyPhotoRepository, { useClass: PrismaPropertyPhotoRepository });
container.register<IReviewRepository>(AppSymbols.ReviewRepository, { useClass: PrismaReviewRepository });
container.register<IReservationRepository>(AppSymbols.ReservationRepository, { useClass: PrismaReservationRepository });
container.register<IPaymentRepository>(AppSymbols.PaymentRepository, { useClass: PrismaPaymentRepository });

// --- Register BLL ---
container.register<IDataLoadingService>(AppSymbols.DataLoadingService, { useClass: DataLoadingService });
container.register(AppSymbols.PropertyModel, { useClass: PropertyModel });
container.register(AppSymbols.PropertyService, { useClass: PropertyService });

// --- Register PL Controllers ---
container.register(AppSymbols.PropertyController, { useClass: PropertyController });

// --- Prisma Shutdown Hook ---
// Optional, but good practice to ensure graceful shutdown
async function gracefulShutdown() {
  try {
    console.log("Disconnecting Prisma Client...");
    await prisma.$disconnect();
    console.log("Prisma Client disconnected.");
    process.exit(0);
  } catch (e) {
    console.error("Error during Prisma disconnection:", e);
    process.exit(1);
  }
}

// Listen for shutdown signals
process.on('SIGINT', gracefulShutdown); // Ctrl+C
process.on('SIGTERM', gracefulShutdown); // kill command

// Export the configured container
export { container };