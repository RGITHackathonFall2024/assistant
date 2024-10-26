import { tickets } from "./getTicketPrices";
import type { Ticket } from "./mock";

export async function getTicketInfo(ticket_id: string): Promise<Ticket | null> {
    console.log(tickets)
    return tickets.find(i => i.ticket_id == ticket_id) || null;
}