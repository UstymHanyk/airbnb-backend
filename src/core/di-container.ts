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
// Import other BLL services if they exist (e.g., UserService)

// --- Import PL Interfaces (no implementations needed for Lab 2) ---
// import { IUserController } from '../presentation/interfaces/IUserController';


// --- Register Dependencies ---

// Register Prisma Client as a singleton instance
// This ensures all repositories use the same DB connection pool
const prisma = new PrismaClient();
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
// Register other BLL services here if created (e.g., UserService)
// container.register<IUserService>(AppSymbols.UserService, { useClass: UserService });


// --- Register PL (optional placeholders, no implementations) ---
// container.register<IUserController>(AppSymbols.UserController, { useClass: UserController }); // Would add UserController implementation later


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