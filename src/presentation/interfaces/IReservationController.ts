interface CreateReservationDto {
    propertyId: string;
    checkInDate: string;
    checkOutDate: string;
    guestCount: number;
    specialRequests?: string | null;
}

interface ReservationDetailsDto {
    reservationId: string;
    property: { propertyId: string, title: string };
    guest: { guestId: string, name: string };
    checkInDate: Date;
    checkOutDate: Date;
    totalPrice: number;
    status: string;
    guestCount: number;
    specialRequests?: string | null;
    createdAt: Date;
    payment?: { paymentId: string, status: string, amount: number } | null;
}

export interface IReservationController {
    requestBooking(bookingRequest: CreateReservationDto): Promise<ReservationDetailsDto | any>;
    getReservationDetails(reservationId: string): Promise<ReservationDetailsDto | any>;
    cancelReservation(reservationId: string): Promise<{ status: string } | any>;
    modifyReservationDates(reservationId: string, dates: { checkInDate: string, checkOutDate: string }): Promise<ReservationDetailsDto | any>;
}