import { Injectable } from '@nestjs/common';
import { TICKET_TYPE } from '../const/ticket.enum';
import { TicketRepository } from '../repo/ticket.repository';

@Injectable()
export class TicketService {
  constructor(private readonly ticketRepository: TicketRepository) {
  }
  async findAll(ticketType?: TICKET_TYPE) {
    return await this.ticketRepository.list(ticketType);
  }
}