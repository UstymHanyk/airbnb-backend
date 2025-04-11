import { injectable, inject } from 'tsyringe';
import { PrismaClient, Payment, Prisma } from '@prisma/client';
import { IPaymentRepository } from '../interfaces/IPaymentRepository';
import AppSymbols from '../../core/app-symbols';

@injectable()
export class PrismaPaymentRepository implements IPaymentRepository {
    constructor(
        @inject(AppSymbols.PrismaClient) private prisma: PrismaClient
    ) {}

    async create(data: Prisma.PaymentCreateInput): Promise<Payment> {
        return this.prisma.payment.create({ data });
    }

    async createMany(data: Prisma.PaymentCreateManyInput[]): Promise<Prisma.BatchPayload> {
        return this.prisma.payment.createMany({ data, skipDuplicates: true });
    }

    async findById(paymentId: string): Promise<Payment | null> {
        return this.prisma.payment.findUnique({ where: { paymentId: paymentId } });
    }

    async findByReservationId(reservationId: string): Promise<Payment | null> {
        return this.prisma.payment.findUnique({ where: { reservationId: reservationId } });
    }

    async update(paymentId: string, data: Prisma.PaymentUpdateInput): Promise<Payment | null> {
         try {
            return await this.prisma.payment.update({ where: { paymentId: paymentId }, data: data });
        } catch (error) {
             if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2025') { return null; }
             throw error;
        }
    }

    async delete(paymentId: string): Promise<Payment | null> {
         try {
            return await this.prisma.payment.delete({ where: { paymentId: paymentId } });
        } catch (error) {
             if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2025') { return null; }
             throw error;
        }
    }
}