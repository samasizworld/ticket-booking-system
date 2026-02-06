import { IsEnum, IsNotEmpty, IsUUID } from "class-validator";
import { TICKET_BOOKING_STATUS } from "../const/ticket.enum";

export class ConfirmPaymentDto {
    @IsUUID()
    @IsNotEmpty()
    paymentToken: string;

    @IsEnum(TICKET_BOOKING_STATUS)
    @IsNotEmpty()
    paymentStatus: TICKET_BOOKING_STATUS
}