import { Body, Controller, Post, Query } from '@nestjs/common';
import { Get } from '@nestjs/common';
import { TICKET_TYPE } from './const/ticket.enum';
import { TicketBookingService } from './services/ticket-booking.service';
import { ConfirmPaymentDto } from './dto/ticket.dto';
import { TicketService } from './services/ticket.service';

@Controller('tickets')
export class TicketController {
  constructor(private readonly ticketService: TicketService,
    private readonly ticketBookingService: TicketBookingService
  ) { }
  @Get()
  async getTickets(@Query('ticketType') ticketType: TICKET_TYPE) {
    const list = await this.ticketService.findAll(ticketType);
    return list;
  }


  @Post('reserve')
  async reserve(@Body('ticketIds') ticketIds: string[]) {
    const token = await this.ticketBookingService.reserveTicket(ticketIds);
    return { message: 'The tickets are reserved for booking. Please proceed payment for booking', paymentToken: token }
  }

  @Post('confirm-payment')
  async confirmPayment(@Body() paymentDto: ConfirmPaymentDto) {
    const result = await this.ticketBookingService.confirmPayment(paymentDto);
    return { message: `The tickets are ${result}.` }
  }
}