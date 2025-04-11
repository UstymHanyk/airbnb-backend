import { Guest, Prisma } from '@prisma/client';

export interface IGuestRepository {
    create(data: Prisma.GuestCreateInput): Promise<Guest>;
    createMany(data: Prisma.GuestCreateManyInput[]): Promise<Prisma.BatchPayload>;
    findById(guestId: string): Promise<Guest | null>;
    findByUserId(userId: string): Promise<Guest | null>;
    update(guestId: string, data: Prisma.GuestUpdateInput): Promise<Guest | null>;
    delete(guestId: string): Promise<Guest | null>;
}