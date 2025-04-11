import { User, Prisma } from '@prisma/client';

export interface IUserRepository {
  create(data: Prisma.UserCreateInput): Promise<User>;
  createMany(data: Prisma.UserCreateManyInput[]): Promise<Prisma.BatchPayload>;
  findById(userId: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findMany(args?: Prisma.UserFindManyArgs): Promise<User[]>; 
  update(userId: string, data: Prisma.UserUpdateInput): Promise<User | null>; 
  delete(userId: string): Promise<User | null>;
}