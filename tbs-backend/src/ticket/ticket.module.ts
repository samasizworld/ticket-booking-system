import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketEntity } from './entities/ticket.entity';
import { TicketBookingEntity } from './entities/ticketbooking.entity';
import { TicketRepository } from './repo/ticket.repository';
import { TicketController } from './ticket.controller';
import { TicketBookingService } from './services/ticket-booking.service';
import { TicketService } from './services/ticket.service';

@Module({
  imports: [TypeOrmModule.forFeature([TicketEntity, TicketBookingEntity])],
  controllers: [TicketController],
  providers: [TicketService, TicketRepository, TicketBookingService],
})
export class TicketModule { }