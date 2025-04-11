import { Payment, Prisma } from '@prisma/client';

export interface IPaymentRepository {
    create(data: Prisma.PaymentCreateInput): Promise<Payment>;
    createMany(data: Prisma.PaymentCreateManyInput[]): Promise<Prisma.BatchPayload>;
    findById(paymentId: string): Promise<Payment | null>;
    findByReservationId(reservationId: string): Promise<Payment | null>;
    update(paymentId: string, data: Prisma.PaymentUpdateInput): Promise<Payment | null>;
    delete(paymentId: string): Promise<Payment | null>;
}