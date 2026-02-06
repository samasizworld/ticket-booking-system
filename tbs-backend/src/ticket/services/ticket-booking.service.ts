import { BadRequestException, Injectable } from "@nestjs/common";
import { TicketRepository } from "../repo/ticket.repository";
import { ConfirmPaymentDto } from "../dto/ticket.dto";

@Injectable()
export class TicketBookingService {
    constructor(private readonly ticketRepository: TicketRepository) { }


    async reserveTicket(ticketIds: string[]) {
        if (!ticketIds || ticketIds.length === 0) {
            throw new BadRequestException('No tickets provided');
        }

        return await this.ticketRepository.reserve(ticketIds);
    }

    async confirmPayment(paymentDto: ConfirmPaymentDto) {
        const { paymentStatus, paymentToken } = paymentDto;

        return await this.ticketRepository.confirmPayment(paymentToken, paymentStatus);
    }
}