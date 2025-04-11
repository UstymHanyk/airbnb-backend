import fs from 'fs';
import path from 'path';
import { faker } from '@faker-js/faker';
import { Prisma, PropertyType, ReservationStatus, PaymentStatus } from '@prisma/client';

// Define the structure matching CsvRow in DataLoadingService
interface CsvOutputRow {
    user_id: string;
    user_name: string;
    user_email: string;
    user_phone?: string | null;
    user_verified: string;
    user_role: 'Guest' | 'PropertyOwner' | '';
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

const NUM_ROWS = 1000;
const OUTPUT_DIR = path.join(__dirname, '../../data');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'airbnb_data.csv');

if (!fs.existsSync(OUTPUT_DIR)) {
    console.log(`Creating output directory: ${OUTPUT_DIR}`);
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

console.log('Initializing data generation...');
const users = new Map<string, { name: string; email: string; phone?: string | null; verified: boolean; role: 'Guest' | 'PropertyOwner' }>();
const properties = new Map<string, { title: string; ownerUserId: string; price: number; maxGuests: number; type: PropertyType; amenities: string[] }>();
const reservations = new Map<string, { guestUserId: string; propertyId: string; checkIn: Date; checkOut: Date; guestCount: number; status: ReservationStatus }>();

const generatedUserIds = new Set<string>();
const generatedPropIds = new Set<string>();
const generatedResIds = new Set<string>();
const generatedReviewIds = new Set<string>();
const generatedPaymentIds = new Set<string>();
const generatedPhotoIds = new Set<string>();

function generateUniqueId(idSet: Set<string>): string {
    let id;
    do {
        id = faker.string.uuid();
    } while (idSet.has(id));
    idSet.add(id);
    return id;
}

const userTarget = Math.max(200, NUM_ROWS * 0.3);
console.log(`Generating ~${userTarget} unique users...`);
while (users.size < userTarget) {
    const userId = generateUniqueId(generatedUserIds);
    const role = faker.helpers.arrayElement<'Guest' | 'PropertyOwner'>(['Guest', 'Guest', 'Guest', 'PropertyOwner']);
    users.set(userId, {
        name: faker.person.fullName(),
        email: faker.internet.email({ firstName: `user_${userId.substring(0,4)}` }).toLowerCase(),
        phone: faker.helpers.maybe(() => faker.phone.number(), { probability: 0.7 }),
        verified: faker.datatype.boolean({ probability: 0.8 }), // Use probability syntax
        role: role,
    });
}
const userList = Array.from(users.entries());
const ownersList = userList.filter(u => u[1].role === 'PropertyOwner');
const guestsList = userList.filter(u => u[1].role === 'Guest');
console.log(`Generated ${users.size} users (${ownersList.length} owners, ${guestsList.length} guests).`);

const propertyTarget = Math.max(300, NUM_ROWS * 0.4);
console.log(`Generating ~${propertyTarget} unique properties...`);
if (ownersList.length > 0) {
    while (properties.size < propertyTarget) {
        const propId = generateUniqueId(generatedPropIds);
        const ownerEntry = faker.helpers.arrayElement(ownersList);
        const type = faker.helpers.arrayElement<PropertyType>(Object.values(PropertyType)); // Use enum values
        const amenities = faker.helpers.arrayElements(['Wifi', 'Kitchen', 'Washer', 'Dryer', 'Air conditioning', 'Heating', 'TV', 'Iron', 'Hair dryer', 'Pool', 'Gym', 'Free parking', 'EV charger'], {min: 2, max: 6})
        properties.set(propId, {
            title: `${faker.word.adjective()} ${type.toLowerCase()} near ${faker.location.street()}`,
            ownerUserId: ownerEntry[0],
            price: faker.number.float({ min: 30, max: 600, fractionDigits: 2 }),
            maxGuests: faker.number.int({ min: 1, max: 10 }),
            type: type,
            amenities: amenities
        });
    }
} else {
    console.warn("Cannot generate properties as no owners were generated.");
}
const propertyList = Array.from(properties.entries());
console.log(`Generated ${properties.size} properties.`);

const reservationTarget = Math.max(500, NUM_ROWS * 0.6);
console.log(`Generating ~${reservationTarget} unique reservations...`);
if (guestsList.length > 0 && propertyList.length > 0) {
    while (reservations.size < reservationTarget) {
        const resId = generateUniqueId(generatedResIds);
        const guestEntry = faker.helpers.arrayElement(guestsList);
        const propertyEntry = faker.helpers.arrayElement(propertyList);
        const propData = propertyEntry[1];

        const checkIn = faker.date.between({ from: '2023-01-01T00:00:00.000Z', to: '2024-12-31T00:00:00.000Z' });
        const checkOut = faker.date.soon({ days: faker.number.int({ min: 1, max: 14 }) , refDate: checkIn});
        const guestCount = faker.number.int({ min: 1, max: propData.maxGuests });
        const status = faker.helpers.arrayElement<ReservationStatus>(Object.values(ReservationStatus)); // Use enum values

        reservations.set(resId, {
            guestUserId: guestEntry[0],
            propertyId: propertyEntry[0],
            checkIn: checkIn,
            checkOut: checkOut,
            guestCount: guestCount,
            status: status
        });
    }
} else {
     console.warn("Cannot generate reservations as no guests or properties were generated.");
}
const reservationList = Array.from(reservations.entries());
console.log(`Generated ${reservations.size} reservations.`);

// --- Combine into CSV Rows ---
console.log('Generating CSV rows...');
const csvDataMap = new Map<string, CsvOutputRow>();
let rowCounter = 0;

function addOrUpdateRow(primaryId: string, entityType: 'user' | 'property' | 'reservation', data: Partial<CsvOutputRow>): string {
    let rowKey = `${entityType}_${primaryId}`;

    let targetRow: CsvOutputRow | undefined = undefined;
    if (entityType === 'property' && data.prop_owner_user_id) {
        targetRow = csvDataMap.get(`user_${data.prop_owner_user_id}`);
        if (targetRow?.prop_id) targetRow = undefined;
    } else if (entityType === 'reservation' && data.res_guest_user_id) {
        targetRow = csvDataMap.get(`user_${data.res_guest_user_id}`);
        if (targetRow?.res_id) targetRow = undefined;
    }

    if (targetRow) {
         Object.assign(targetRow, data);
         return `user_${targetRow.user_id}`;
    } else {
         const newRow: CsvOutputRow = {
             user_id: (entityType === 'user' ? primaryId : data.user_id) ?? faker.string.uuid(),
             user_name: data.user_name ?? '',
             user_email: data.user_email ?? '',
             user_verified: data.user_verified ?? 'false',
             user_role: data.user_role ?? '',
             ...data
         };
         csvDataMap.set(rowKey, newRow);
         rowCounter++;
         return rowKey;
    }
}

console.log('Adding base user rows...');
for (const [userId, userData] of userList) {
     if (rowCounter >= NUM_ROWS * 1.5) break;
     addOrUpdateRow(userId, 'user', {
         user_id: userId,
         user_name: userData.name,
         user_email: userData.email,
         user_phone: userData.phone,
         user_verified: String(userData.verified),
         user_role: userData.role,
     });
}

console.log('Adding base property rows...');
for (const [propId, propData] of propertyList) {
     if (rowCounter >= NUM_ROWS * 1.5) break;
     const ownerInfo = users.get(propData.ownerUserId);
     addOrUpdateRow(propId, 'property', {
         user_id: propData.ownerUserId,
         user_name: ownerInfo?.name,
         user_email: ownerInfo?.email,
         user_verified: String(ownerInfo?.verified),
         user_role: 'PropertyOwner',
         prop_id: propId,
         prop_title: propData.title,
         prop_description: faker.lorem.paragraphs(1),
         prop_address: faker.location.streetAddress(),
         prop_city: faker.location.city(),
         prop_country: faker.location.countryCode('alpha-3'),
         prop_price: String(propData.price.toFixed(2)),
         prop_max_guests: String(propData.maxGuests),
         prop_type: propData.type,
         prop_owner_user_id: propData.ownerUserId,
         prop_amenities: propData.amenities.join(','),
     });
}

console.log('Adding base reservation rows...');
for (const [resId, resData] of reservationList) {
    if (rowCounter >= NUM_ROWS * 1.5) break;
    const guestInfo = users.get(resData.guestUserId);
    const propInfo = properties.get(resData.propertyId);
    if (!guestInfo || !propInfo) continue;

    const checkIn = new Date(resData.checkIn);
    const checkOut = new Date(resData.checkOut);
    // Calculate number of nights (difference in days)
    const dayDiff = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
    const totalPrice = (propInfo.price * dayDiff).toFixed(2);

    addOrUpdateRow(resId, 'reservation', {
        user_id: resData.guestUserId,
        user_name: guestInfo.name,
        user_email: guestInfo.email,
        user_verified: String(guestInfo.verified),
        user_role: 'Guest',
        res_id: resId,
        res_check_in: resData.checkIn.toISOString(),
        res_check_out: resData.checkOut.toISOString(),
        res_guests: String(resData.guestCount),
        res_total_price: String(totalPrice),
        res_status: resData.status,
        res_guest_user_id: resData.guestUserId,
        res_prop_id: resData.propertyId,
        res_special_requests: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.2 }),
    });
}

console.log('Adding supplementary data (payments, reviews, photos)...');
const allRows = Array.from(csvDataMap.values());

// Add Payments to Confirmed/Completed Reservations
allRows.filter(row => row.res_id && (row.res_status === ReservationStatus.CONFIRMED || row.res_status === ReservationStatus.COMPLETED) && !row.pay_id)
       .forEach(row => {
           if (faker.datatype.boolean({ probability: 0.9 })) {
                const payId = generateUniqueId(generatedPaymentIds);
                row.pay_id = payId;
                row.pay_amount = row.res_total_price;
                row.pay_method = faker.helpers.arrayElement(['card', 'paypal', 'bank_transfer']);
                row.pay_status = row.res_status === ReservationStatus.COMPLETED ? PaymentStatus.COMPLETED : PaymentStatus.PENDING;
                row.pay_res_id = row.res_id;
                row.pay_transaction_fee = String(faker.number.float({ min: 0.5, max: 5, fractionDigits: 2 }));
           }
       });

// Add Reviews to Completed Reservations
allRows.filter(row => row.res_id && row.res_status === ReservationStatus.COMPLETED && row.res_guest_user_id && row.res_prop_id && !row.rev_id)
       .forEach(row => {
            if (faker.datatype.boolean({ probability: 0.7 })) {
                const revId = generateUniqueId(generatedReviewIds);
                row.rev_id = revId;
                row.rev_rating = String(faker.number.int({ min: 1, max: 5 }));
                row.rev_comment = faker.lorem.sentences(faker.number.int({ min: 1, max: 3 }));
                row.rev_reviewer_user_id = row.res_guest_user_id;
                row.rev_prop_id = row.res_prop_id;
            }
       });

// Add Photos to Properties
allRows.filter(row => row.prop_id && !row.photo_id)
       .forEach(row => {
           if (faker.datatype.boolean({ probability: 0.8 })) {
                const photoCount = faker.number.int({ min: 1, max: 6 });
                const photoId1 = generateUniqueId(generatedPhotoIds);
                row.photo_id = photoId1;
                row.photo_url = faker.image.urlLoremFlickr({ category: 'house', width: 1024, height: 768 });
                row.photo_caption = faker.lorem.words(3);
                row.photo_prop_id = row.prop_id;
                row.photo_room_type = faker.helpers.arrayElement(['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Exterior']);

                for (let i = 1; i < photoCount; i++) {
                     if (rowCounter >= NUM_ROWS * 1.5) break;
                     const photoIdN = generateUniqueId(generatedPhotoIds);
                     const photoRow: CsvOutputRow = { ...row };
                     photoRow.res_id = undefined; photoRow.rev_id = undefined; photoRow.pay_id = undefined;
                     photoRow.photo_id = photoIdN;
                     photoRow.photo_url = faker.image.urlLoremFlickr({ category: 'room', width: 1024, height: 768 });
                     photoRow.photo_caption = faker.lorem.words(3);
                     photoRow.photo_room_type = faker.helpers.arrayElement(['Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Exterior']);
                     photoRow.photo_prop_id = row.prop_id;
                     csvDataMap.set(`photo_${photoIdN}`, photoRow);
                     rowCounter++;
                }
           }
       });

// --- Finalize Rows ---
let finalCsvRows = Array.from(csvDataMap.values());
console.log(`Generated ${finalCsvRows.length} potentially unique row combinations.`);

while (finalCsvRows.length < NUM_ROWS) {
    console.log(`Adding filler rows to reach target ${NUM_ROWS}... Current: ${finalCsvRows.length}`);
    const userId = generateUniqueId(generatedUserIds);
    const role = faker.helpers.arrayElement<'Guest' | 'PropertyOwner'>(['Guest', 'PropertyOwner']);
     finalCsvRows.push({
         user_id: userId,
         user_name: faker.person.fullName(),
         user_email: faker.internet.email({firstName: `filler_${userId.substring(0,4)}`}).toLowerCase(),
         user_verified: String(faker.datatype.boolean()),
         user_role: role,
     });
}

if (finalCsvRows.length > NUM_ROWS * 1.2) {
    console.log(`Truncating generated rows from ${finalCsvRows.length} to ${NUM_ROWS}`);
    finalCsvRows = finalCsvRows.slice(0, NUM_ROWS);
}

// --- Write CSV File ---
console.log(`Writing ${finalCsvRows.length} rows to ${OUTPUT_FILE}...`);

const headers: Array<keyof CsvOutputRow> = [
    'user_id', 'user_name', 'user_email', 'user_phone', 'user_verified', 'user_role',
    'prop_id', 'prop_title', 'prop_description', 'prop_address', 'prop_city', 'prop_country', 'prop_price', 'prop_max_guests', 'prop_type', 'prop_owner_user_id', 'prop_amenities',
    'res_id', 'res_check_in', 'res_check_out', 'res_guests', 'res_total_price', 'res_status', 'res_guest_user_id', 'res_prop_id', 'res_special_requests',
    'rev_id', 'rev_rating', 'rev_comment', 'rev_reviewer_user_id', 'rev_prop_id',
    'pay_id', 'pay_amount', 'pay_method', 'pay_status', 'pay_res_id', 'pay_transaction_fee',
    'photo_id', 'photo_url', 'photo_caption', 'photo_prop_id', 'photo_room_type'
];

const writer = fs.createWriteStream(OUTPUT_FILE);

writer.write(headers.join(',') + '\n');

finalCsvRows.forEach(row => {
    const values = headers.map(header => {
        const value = row[header];
        if (value === null || typeof value === 'undefined') {
            return '';
        }
        const stringValue = String(value);
        // Basic CSV quoting
        if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    });
    writer.write(values.join(',') + '\n');
});

writer.end();

writer.on('finish', () => {
    console.log(`Successfully generated CSV file: ${OUTPUT_FILE} with ${finalCsvRows.length} rows.`);
});

writer.on('error', (err) => {
    console.error('Error writing CSV file:', err);
});