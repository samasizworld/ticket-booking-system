import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { TICKET_STATUS, TICKET_TYPE } from "../const/ticket.enum";

@Entity('tickets')
export class TicketEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, type: 'varchar', nullable: false })
  name: string;

  @Column({ type: 'enum', enum: TICKET_TYPE, nullable: false })
  type: TICKET_TYPE;

  @Column({ type: 'enum', enum: TICKET_STATUS, nullable: false })
  status: TICKET_STATUS;

  @Column({ length: 3, type: 'varchar', default: 'USD', nullable: false })
  currency: string;

  @Column({
    nullable: false,
    type: 'numeric',
    default: 0,
    transformer: {
      to: (value: number) => value, // Convert from number to database format
      from: (value: string) => parseFloat(value), // Convert from database format to number
    },
  })
  price: number;

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