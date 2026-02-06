export const TicketCurrency = 'USD';

export enum TICKET_TYPE {
    GENERAL = 'general',
    VIP = 'vip',
    FRONT_ROW = 'front_row',
}

export enum TICKET_BOOKING_STATUS {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    CANCELLED = 'cancelled',
}

export enum TICKET_STATUS {
    AVAILABLE = 'available',
    SOLD = 'sold',
    RESERVED = 'reserved',
}