import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TicketEntity } from '../entities/ticket.entity';
import { TICKET_BOOKING_STATUS, TICKET_STATUS, TICKET_TYPE } from '../const/ticket.enum';
import { TicketBookingEntity } from '../entities/ticketbooking.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class TicketRepository {
    constructor(
        @InjectRepository(TicketEntity)
        private readonly ticketRepo: Repository<TicketEntity>,
        private readonly dataSource: DataSource, //Needed for transactions
    ) { }

    async list(ticketType?: TICKET_TYPE) {
        if (!ticketType) return this.ticketRepo.find();
        return this.ticketRepo.find({ where: { type: ticketType } });
    }

    async reserve(ticketIds: string[]) {
        // simulate unique payment token
        const paymentToken = randomUUID();
        return this.dataSource.transaction(async (manager) => {
            // Lock all selected tickets
            const tickets = await manager
                .getRepository(TicketEntity)
                .createQueryBuilder('ticket')
                .where('ticket.id IN (:...ids)', { ids: ticketIds })
                .setLock('pessimistic_write') // SELECT ... FOR UPDATE
                .getMany();

            // Check availability
            const unavailable = tickets.filter(
                (t) => t.status !== TICKET_STATUS.AVAILABLE,
            );
            if (unavailable.length > 0) {
                throw new BadRequestException(
                    `Tickets not available: ${unavailable.map((t) => t.name).join(', ')}`,
                );
            }

            // Mark as reserved
            for (const ticket of tickets) {
                ticket.status = TICKET_STATUS.RESERVED;
                await manager.getRepository(TicketEntity).save(ticket);

                const newticketBooking = new TicketBookingEntity();
                newticketBooking.ticket = ticket;
                newticketBooking.status = TICKET_BOOKING_STATUS.PENDING;
                newticketBooking.paymentToken = paymentToken;

                await manager.getRepository(TicketBookingEntity).save(newticketBooking);

            }

            return paymentToken;
        });
    }


    async confirmPayment(paymentToken: string, paymentBookingStatus: TICKET_BOOKING_STATUS) {

        return this.dataSource.transaction(async (manager) => {
            // Lock all selected tickets
            const bookings = await manager
                .getRepository(TicketBookingEntity)
                .createQueryBuilder('booking')
                .innerJoinAndSelect('booking.ticket', 'ticket') // include ticket
                .where('booking."paymentToken" = :token', { token: paymentToken })
                .setLock('pessimistic_write') // SELECT ... FOR UPDATE
                .getMany();

            if (bookings.length === 0) {
                throw new BadRequestException('No booking item found');
            }

            // Mark as reserved
            for (const booking of bookings) {
                booking.status = paymentBookingStatus;
                await manager.getRepository(TicketBookingEntity).save(booking);

                if (paymentBookingStatus === 'confirmed') {
                    const ticket = booking.ticket;
                    ticket.status = TICKET_STATUS.SOLD;
                    await manager.getRepository(TicketEntity).save(ticket);
                } else if (paymentBookingStatus === 'cancelled') {
                    const ticket = booking.ticket;
                    ticket.status = TICKET_STATUS.AVAILABLE;
                    await manager.getRepository(TicketEntity).save(ticket);
                } else {
                    throw new BadRequestException('Cannot set pending while doing payment');
                }
            }

            return paymentBookingStatus;

        });
    }
}
