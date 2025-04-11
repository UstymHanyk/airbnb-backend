import { Reservation, Prisma } from '@prisma/client';

export interface IReservationRepository {
    create(data: Prisma.ReservationCreateInput): Promise<Reservation>;
    createMany(data: Prisma.ReservationCreateManyInput[]): Promise<Prisma.BatchPayload>;
    findById(reservationId: string): Promise<Reservation | null>;
    findByGuestId(guestId: string): Promise<Reservation[]>;
    findByPropertyId(propertyId: string): Promise<Reservation[]>;
    findMany(args?: Prisma.ReservationFindManyArgs): Promise<Reservation[]>;
    update(reservationId: string, data: Prisma.ReservationUpdateInput): Promise<Reservation | null>;
    delete(reservationId: string): Promise<Reservation | null>;
}