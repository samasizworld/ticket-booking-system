import 'reflect-metadata';
import { EntityManager } from 'typeorm';
import { TICKET_TYPE, TICKET_STATUS, TicketCurrency } from '../const/ticket.enum';
import { TicketEntity } from '../entities/ticket.entity';
import AppDataSource from './migration';

async function seedTickets() {
    await AppDataSource.transaction(async (transaction: EntityManager) => {
        const ticketRepository = transaction.getRepository(TicketEntity);

        const tiers = [
            { type: TICKET_TYPE.VIP, namePrefix: 'VIP Ticket', count: 50, price: 100, currency: TicketCurrency },
            { type: TICKET_TYPE.FRONT_ROW, namePrefix: 'Front Row Ticket', count: 100, price: 50, currency: TicketCurrency },
            { type: TICKET_TYPE.GENERAL, namePrefix: 'General Admission', count: 500, price: 10, currency: TicketCurrency },
        ];

        for (const tier of tiers) {
            for (let i = 1; i <= tier.count; i++) {
                const ticketName = `${tier.namePrefix} #${i}`;

                // Check if ticket already exists
                const existingTicket = await ticketRepository.findOne({
                    where: { name: ticketName },
                });
                if (existingTicket) continue;

                const ticket = new TicketEntity();
                ticket.name = ticketName;
                ticket.type = tier.type;
                ticket.status = TICKET_STATUS.AVAILABLE;
                ticket.price = tier.price;
                ticket.currency = TicketCurrency;

                await ticketRepository.save(ticket);
            }
        }

        console.log('Tickets seeded successfully.');
    });
}

(async () => {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
            console.log('Database connection initialized successfully.');
        }

        await seedTickets();

        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
            console.log('Database connection closed');
        }
    } catch (error) {
        console.error('Error during ticket seeding:', error);
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
})();
