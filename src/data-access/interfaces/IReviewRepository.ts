import { Review, Prisma } from '@prisma/client';

export interface IReviewRepository {
    create(data: Prisma.ReviewCreateInput): Promise<Review>;
    createMany(data: Prisma.ReviewCreateManyInput[]): Promise<Prisma.BatchPayload>;
    findById(reviewId: string): Promise<Review | null>;
    findByPropertyId(propertyId: string): Promise<Review[]>;
    findByReviewerId(reviewerId: string): Promise<Review[]>;
    findMany(args?: Prisma.ReviewFindManyArgs): Promise<Review[]>;
    update(reviewId: string, data: Prisma.ReviewUpdateInput): Promise<Review | null>;
    delete(reviewId: string): Promise<Review | null>;
}