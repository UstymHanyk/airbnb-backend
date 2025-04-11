import { injectable, inject } from 'tsyringe';
import { PrismaClient, Review, Prisma } from '@prisma/client';
import { IReviewRepository } from '../interfaces/IReviewRepository';
import AppSymbols from '../../core/app-symbols';

@injectable()
export class PrismaReviewRepository implements IReviewRepository {
    constructor(
        @inject(AppSymbols.PrismaClient) private prisma: PrismaClient
    ) {}

    async create(data: Prisma.ReviewCreateInput): Promise<Review> {
        return this.prisma.review.create({ data });
    }

    async createMany(data: Prisma.ReviewCreateManyInput[]): Promise<Prisma.BatchPayload> {
        return this.prisma.review.createMany({ data, skipDuplicates: true });
    }

    async findById(reviewId: string): Promise<Review | null> {
        return this.prisma.review.findUnique({ where: { reviewId: reviewId } });
    }

    async findByPropertyId(propertyId: string): Promise<Review[]> {
        return this.prisma.review.findMany({ where: { propertyId: propertyId } });
    }

    async findByReviewerId(reviewerId: string): Promise<Review[]> {
        return this.prisma.review.findMany({ where: { reviewerId: reviewerId } });
    }

    async findMany(args?: Prisma.ReviewFindManyArgs): Promise<Review[]> {
        return this.prisma.review.findMany(args);
    }

    async update(reviewId: string, data: Prisma.ReviewUpdateInput): Promise<Review | null> {
        try {
            return await this.prisma.review.update({ where: { reviewId: reviewId }, data: data });
        } catch (error) {
            if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2025') { return null; }
            throw error;
        }
    }

    async delete(reviewId: string): Promise<Review | null> {
        try {
            return await this.prisma.review.delete({ where: { reviewId: reviewId } });
        } catch (error) {
            if ((error as Prisma.PrismaClientKnownRequestError).code === 'P2025') { return null; }
            throw error;
        }
    }
}