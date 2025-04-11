import { injectable, inject } from 'tsyringe';
import { PrismaClient, Reservation, Prisma } from '@prisma/client';
import { IReservationRepository } from '../interfaces/IReservationRepository';
import AppSymbols from '../../core/app-symbols';

@injectable()
export class PrismaReservationRepository implements IReservationRepository {
     constructor(
        @inject(AppSymbols.PrismaClient) private prisma: PrismaClient
    ) {}

    async create(data: Prisma.ReservationCreateInput): Promise<Reservation> {
        return this.prisma.reservation.create({ data });
    }

    async createMany(data: Prisma.ReservationCreateManyInput[]): Promise<Prisma.BatchPayload> {
        return this.prisma.reservation.createMany({ data, skipDuplicates: true });
    }

    async findById(reservationId: string): Promise<Reservation | null> {
        return this.prisma.reservation.findUnique({ where: { reservationId: reservationId } });
    }

    async findByGuestId(guestId: string): Promise<Reservation[]> {
        return this.prisma.reservation.findMany({ where: { guestId: guestId } });
    }

    async findByPropertyId(propertyId: string): Promise<Reservation[]> {
        return this.prisma.reservation.findMany({ where: { propertyId: propertyId } });
    }

    async findMany(args?: Prisma.ReservationFindManyArgs): Promise<Reservation[]> {
        return this.prisma.reservation.findMany(args);
    }

    async update(reservationId: string, data: Prisma.ReservationUpdateInput): Promise<Reservation | null> {
         try {
            return await this.prisma.reservation.update({ where: { reservationId: reservationId }, data: data });
        } catch (error) {
            if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2025') { return null; }
            throw error;
        }
    }

    async delete(reservationId: string): Promise<Reservation | null> {
        try {
            return await this.prisma.reservation.delete({ where: { reservationId: reservationId } });
        } catch (error) {
            if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2025') { return null; }
            throw error;
        }
    }
}