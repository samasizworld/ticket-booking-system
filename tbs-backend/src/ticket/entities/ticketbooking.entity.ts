import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TicketEntity } from "./ticket.entity";
import { TICKET_BOOKING_STATUS } from "../const/ticket.enum";

@Entity('ticket_bookings')
export class TicketBookingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => TicketEntity, (ticket) => ticket.id)
  ticket: TicketEntity;

  @Column({ type: 'enum', enum: TICKET_BOOKING_STATUS, nullable: false })
  status: TICKET_BOOKING_STATUS;

  @Column({ type: 'text', nullable: false })
  paymentToken: string;

  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}