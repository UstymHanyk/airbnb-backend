import { injectable, inject } from 'tsyringe';
import { Prisma, PrismaClient, ReservationStatus, PaymentStatus, PropertyType } from '@prisma/client';
import AppSymbols from '../../core/app-symbols';
import { ICsvDataReader } from '../../data-access/csv/ICsvDataReader';
import { IDataLoadingService } from '../interfaces/IDataLoadingService';
import { IUserRepository } from '../../data-access/interfaces/IUserRepository';
import { IPropertyOwnerRepository } from '../../data-access/interfaces/IPropertyOwnerRepository';
import { IGuestRepository } from '../../data-access/interfaces/IGuestRepository';
import { IPropertyRepository } from '../../data-access/interfaces/IPropertyRepository';
import { IPropertyPhotoRepository } from '../../data-access/interfaces/IPropertyPhotoRepository';
import { IReviewRepository } from '../../data-access/interfaces/IReviewRepository';
import { IReservationRepository } from '../../data-access/interfaces/IReservationRepository';
import { IPaymentRepository } from '../../data-access/interfaces/IPaymentRepository';

interface CsvRow {
    user_id: string;
    user_name?: string | null;
    user_email: string;
    user_phone?: string | null;
    user_verified?: string | null;
    user_role?: 'Guest' | 'PropertyOwner' | string | null;
    prop_id?: string | null;
    prop_title?: string | null;
    prop_description?: string | null;
    prop_address?: string | null;
    prop_city?: string | null;
    prop_country?: string | null;
    prop_price?: string | null;
    prop_max_guests?: string | null;
    prop_type?: string | null;
    prop_owner_user_id?: string | null;
    prop_amenities?: string | null;
    res_id?: string | null;
    res_check_in?: string | null;
    res_check_out?: string | null;
    res_guests?: string | null;
    res_total_price?: string | null;
    res_status?: string | null;
    res_guest_user_id?: string | null;
    res_prop_id?: string | null;
    res_special_requests?: string | null;
    rev_id?: string | null;
    rev_rating?: string | null;
    rev_comment?: string | null;
    rev_reviewer_user_id?: string | null;
    rev_prop_id?: string | null;
    pay_id?: string | null;
    pay_amount?: string | null;
    pay_method?: string | null;
    pay_status?: string | null;
    pay_res_id?: string | null;
    pay_transaction_fee?: string | null;
    photo_id?: string | null;
    photo_url?: string | null;
    photo_caption?: string | null;
    photo_prop_id?: string | null;
    photo_room_type?: string | null;
}

@injectable()
export class DataLoadingService implements IDataLoadingService {
    constructor(
        @inject(AppSymbols.CsvDataReader) private csvReader: ICsvDataReader,
        @inject(AppSymbols.UserRepository) private userRepository: IUserRepository,
        @inject(AppSymbols.PropertyOwnerRepository) private ownerRepository: IPropertyOwnerRepository,
        @inject(AppSymbols.GuestRepository) private guestRepository: IGuestRepository,
        @inject(AppSymbols.PropertyRepository) private propertyRepository: IPropertyRepository,
        @inject(AppSymbols.PropertyPhotoRepository) private photoRepository: IPropertyPhotoRepository,
        @inject(AppSymbols.ReviewRepository) private reviewRepository: IReviewRepository,
        @inject(AppSymbols.ReservationRepository) private reservationRepository: IReservationRepository,
        @inject(AppSymbols.PaymentRepository) private paymentRepository: IPaymentRepository,
        @inject(AppSymbols.PrismaClient) private prisma: PrismaClient
    ) {}

    private safeParseFloat(value: string | null | undefined): number | null {
        if (value === null || typeof value === 'undefined') return null;
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
    }

    private safeParseInt(value: string | null | undefined): number | null {
        if (value === null || typeof value === 'undefined') return null;
        const num = parseInt(value, 10);
        return isNaN(num) ? null : num;
    }

    private safeParseBoolean(value: string | null | undefined): boolean {
        if (value === null || typeof value === 'undefined') return false;
        return value.toLowerCase() === 'true';
    }

    private safeParseDate(value: string | null | undefined): Date | null {
        if (value === null || typeof value === 'undefined') return null;
        const date = new Date(value);
        return isNaN(date.getTime()) ? null : date;
    }

    private parseStringArray(value: string | null | undefined): string[] {
        if (!value) return [];
        return value.split(',').map(s => s.trim()).filter(s => s.length > 0);
    }

    async loadDataFromCsv(filePath: string): Promise<void> {
        console.log(`[BLL] Starting data load process from ${filePath}...`);
        let rawData: CsvRow[];
        try {
            rawData = await this.csvReader.readData<CsvRow>(filePath);
            console.log(`[BLL] Successfully read ${rawData.length} rows from CSV.`);
        } catch (error) {
            console.error(`[BLL] Failed to read CSV file: ${error}`);
            throw error;
        }

        if (rawData.length === 0) {
            console.log("[BLL] CSV file is empty or could not be parsed. No data to load.");
            return;
        }

        const usersToCreate = new Map<string, Prisma.UserCreateManyInput>();
        const ownersInputData = new Map<string, Prisma.PropertyOwnerCreateManyInput>();
        const guestsToCreate = new Map<string, Prisma.GuestCreateManyInput>();
        const propertiesInputData = new Map<string, Omit<Prisma.PropertyCreateManyInput, 'ownerId'> & { ownerUserId: string }>();
        const photosToCreate = new Map<string, Prisma.PropertyPhotoCreateManyInput>();
        const reviewsToCreate = new Map<string, Prisma.ReviewCreateManyInput>();
        const reservationsToCreate = new Map<string, Prisma.ReservationCreateManyInput>();
        const paymentsToCreate = new Map<string, Prisma.PaymentCreateManyInput>();

        console.log("[BLL] Processing and validating CSV rows...");
        for (const row of rawData) {
            if (!row.user_id || !row.user_email) {
                console.warn(`[BLL] Skipping row due to missing user_id or user_email:`, row);
                continue;
            }

            if (!usersToCreate.has(row.user_id)) {
                usersToCreate.set(row.user_id, {
                    userId: row.user_id,
                    name: row.user_name ?? `User ${row.user_id.substring(0, 5)}`,
                    email: row.user_email.toLowerCase(),
                    phoneNumber: row.user_phone || null,
                    verificationStatus: this.safeParseBoolean(row.user_verified),
                });
            }

            if (row.user_role === 'PropertyOwner' && !ownersInputData.has(row.user_id)) {
                ownersInputData.set(row.user_id, { userId: row.user_id });
            } else if (row.user_role === 'Guest' && !guestsToCreate.has(row.user_id)) {
                guestsToCreate.set(row.user_id, { userId: row.user_id });
            }

            if (row.prop_id && row.prop_owner_user_id && !propertiesInputData.has(row.prop_id)) {
                if (usersToCreate.has(row.prop_owner_user_id) && ownersInputData.has(row.prop_owner_user_id)) {
                    propertiesInputData.set(row.prop_id, {
                        propertyId: row.prop_id,
                        title: row.prop_title ?? 'Untitled Property',
                        description: row.prop_description ?? '',
                        addressLine1: row.prop_address || null,
                        city: row.prop_city || null,
                        country: row.prop_country || null,
                        pricePerNight: this.safeParseFloat(row.prop_price) ?? 0,
                        maxGuests: this.safeParseInt(row.prop_max_guests) ?? 1,
                        propertyType: (row.prop_type?.toUpperCase() ?? 'OTHER') as PropertyType,
                        amenities: this.parseStringArray(row.prop_amenities),
                        ownerUserId: row.prop_owner_user_id,
                    });
                } else {
                    console.warn(`[BLL] Skipping property ${row.prop_id} because owner user ${row.prop_owner_user_id} was not found or not marked as owner in processed data.`);
                }
            }

            if (row.photo_id && row.photo_prop_id && row.photo_url && !photosToCreate.has(row.photo_id)) {
                if (propertiesInputData.has(row.photo_prop_id)) {
                    photosToCreate.set(row.photo_id, {
                        photoId: row.photo_id,
                        imageUrl: row.photo_url,
                        caption: row.photo_caption || null,
                        roomType: row.photo_room_type || null,
                        propertyId: row.photo_prop_id,
                    });
                } else {
                    console.warn(`[BLL] Skipping photo ${row.photo_id} ... property ${row.photo_prop_id} not found.`);
                }
            }

            if (row.res_id && row.res_guest_user_id && row.res_prop_id && !reservationsToCreate.has(row.res_id)) {
                if (usersToCreate.has(row.res_guest_user_id) && propertiesInputData.has(row.res_prop_id)) {
                    const checkIn = this.safeParseDate(row.res_check_in);
                    const checkOut = this.safeParseDate(row.res_check_out);
                    if (!checkIn || !checkOut || checkOut <= checkIn) {
                        console.warn(`[BLL] Skipping reservation ${row.res_id} due to invalid dates.`);
                        continue;
                    }
                    reservationsToCreate.set(row.res_id, {
                        reservationId: row.res_id,
                        checkInDate: checkIn,
                        checkOutDate: checkOut,
                        totalPrice: this.safeParseFloat(row.res_total_price) ?? 0,
                        guestCount: this.safeParseInt(row.res_guests) ?? 1,
                        status: (row.res_status?.toUpperCase() ?? 'PENDING') as ReservationStatus,
                        specialRequests: row.res_special_requests || null,
                        guestId: row.res_guest_user_id,
                        propertyId: row.res_prop_id,
                    });
                } else {
                    console.warn(`[BLL] Skipping reservation ${row.res_id} ... guest ${row.res_guest_user_id} or property ${row.res_prop_id} not found.`);
                }
            }

            if (row.rev_id && row.rev_reviewer_user_id && row.rev_prop_id && !reviewsToCreate.has(row.rev_id)) {
                if (usersToCreate.has(row.rev_reviewer_user_id) && propertiesInputData.has(row.rev_prop_id)) {
                    reviewsToCreate.set(row.rev_id, {
                        reviewId: row.rev_id,
                        rating: this.safeParseFloat(row.rev_rating) ?? 0,
                        comment: row.rev_comment || null,
                        reviewerId: row.rev_reviewer_user_id,
                        propertyId: row.rev_prop_id,
                    });
                } else {
                    console.warn(`[BLL] Skipping review ${row.rev_id} ... reviewer ${row.rev_reviewer_user_id} or property ${row.rev_prop_id} not found.`);
                }
            }

            if (row.pay_id && row.pay_res_id && !paymentsToCreate.has(row.pay_id)) {
                if (reservationsToCreate.has(row.pay_res_id)) {
                    paymentsToCreate.set(row.pay_id, {
                        paymentId: row.pay_id,
                        amount: this.safeParseFloat(row.pay_amount) ?? 0,
                        paymentMethod: row.pay_method ?? 'unknown',
                        status: (row.pay_status?.toUpperCase() ?? 'PENDING') as PaymentStatus,
                        transactionFee: this.safeParseFloat(row.pay_transaction_fee),
                        reservationId: row.pay_res_id,
                    });
                } else {
                    console.warn(`[BLL] Skipping payment ${row.pay_id} ... reservation ${row.pay_res_id} not found.`);
                }
            }
        }

        console.log("[BLL] Finished processing CSV rows.");
        console.log(`[BLL] Prepared counts: Users=${usersToCreate.size}, OwnersInput=${ownersInputData.size}, Guests=${guestsToCreate.size}, PropertiesInput=${propertiesInputData.size}, Photos=${photosToCreate.size}, Reservations=${reservationsToCreate.size}, Reviews=${reviewsToCreate.size}, Payments=${paymentsToCreate.size}`);

        if (usersToCreate.size === 0 && propertiesInputData.size === 0) {
            console.log("[BLL] No valid core data prepared for insertion. Skipping database transaction.");
            return;
        }

        console.log("[BLL] Starting database transaction...");
        try {
            await this.prisma.$transaction(async (tx) => {
                if (usersToCreate.size > 0) {
                    console.log(`[BLL Tx] Inserting ${usersToCreate.size} users...`);
                    await tx.user.createMany({ data: Array.from(usersToCreate.values()), skipDuplicates: true });
                }

                let userIdToOwnerIdMap = new Map<string, string>();
                if (ownersInputData.size > 0) {
                    console.log(`[BLL Tx] Inserting ${ownersInputData.size} property owners...`);
                    await tx.propertyOwner.createMany({ data: Array.from(ownersInputData.values()), skipDuplicates: true });

                    const ownerUserIds = Array.from(ownersInputData.keys());
                    const createdOwners = await tx.propertyOwner.findMany({
                        where: { userId: { in: ownerUserIds } },
                        select: { id: true, userId: true },
                    });

                    createdOwners.forEach(owner => {
                        userIdToOwnerIdMap.set(owner.userId, owner.id);
                    });
                    console.log(`[BLL Tx] Mapped ${userIdToOwnerIdMap.size} UserIDs to PropertyOwner IDs.`);
                }

                if (guestsToCreate.size > 0) {
                    console.log(`[BLL Tx] Inserting ${guestsToCreate.size} guests...`);
                    await tx.guest.createMany({ data: Array.from(guestsToCreate.values()), skipDuplicates: true });
                }

                if (propertiesInputData.size > 0) {
                    console.log(`[BLL Tx] Preparing ${propertiesInputData.size} properties with correct owner IDs...`);
                    const propertiesToInsert: Prisma.PropertyCreateManyInput[] = [];
                    for (const [propId, propData] of propertiesInputData.entries()) {
                        const ownerRecordId = userIdToOwnerIdMap.get(propData.ownerUserId);
                        if (ownerRecordId) {
                            propertiesToInsert.push({
                                propertyId: propData.propertyId,
                                title: propData.title,
                                description: propData.description,
                                addressLine1: propData.addressLine1,
                                city: propData.city,
                                country: propData.country,
                                pricePerNight: propData.pricePerNight,
                                maxGuests: propData.maxGuests,
                                propertyType: propData.propertyType,
                                amenities: propData.amenities,
                                ownerId: ownerRecordId,
                            });
                        } else {
                            console.warn(`[BLL Tx] Could not find PropertyOwner record ID for user ${propData.ownerUserId} when preparing property ${propId}. Skipping property.`);
                        }
                    }

                    if (propertiesToInsert.length > 0) {
                        console.log(`[BLL Tx] Inserting ${propertiesToInsert.length} properties...`);
                        await tx.property.createMany({
                            data: propertiesToInsert,
                            skipDuplicates: true,
                        });
                    } else {
                        console.log(`[BLL Tx] No properties to insert after mapping owner IDs.`);
                    }
                }

                if (photosToCreate.size > 0) {
                    console.log(`[BLL Tx] Inserting ${photosToCreate.size} photos...`);
                    await tx.propertyPhoto.createMany({ data: Array.from(photosToCreate.values()), skipDuplicates: true });
                }

                if (reservationsToCreate.size > 0) {
                    console.log(`[BLL Tx] Inserting ${reservationsToCreate.size} reservations...`);
                    await tx.reservation.createMany({ data: Array.from(reservationsToCreate.values()), skipDuplicates: true });
                }

                if (reviewsToCreate.size > 0) {
                    console.log(`[BLL Tx] Inserting ${reviewsToCreate.size} reviews...`);
                    await tx.review.createMany({ data: Array.from(reviewsToCreate.values()), skipDuplicates: true });
                }

                if (paymentsToCreate.size > 0) {
                    console.log(`[BLL Tx] Inserting ${paymentsToCreate.size} payments...`);
                    await tx.payment.createMany({ data: Array.from(paymentsToCreate.values()), skipDuplicates: true });
                }

                console.log("[BLL Tx] All data insertion steps completed within transaction.");
            }, { maxWait: 15000, timeout: 30000 });

            console.log("[BLL] Database transaction committed successfully.");
            console.log("[BLL] Data loading process finished.");
        } catch (error) {
            console.error("[BLL] Error during database transaction. Rolling back.", error);
            throw error;
        }
    }
}