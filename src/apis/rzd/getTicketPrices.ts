import { generateMockTickets, type Ticket } from "./mock";

export let tickets: Ticket[] = [];

export const rzdGetTicketPrices = {
    "rzd.getTicketPrices": /*{
       function: */async (data: any) => {
            let query: { from: string, to: string, from_date: string, to_date: string | undefined} = data;
            console.log("[TOOLS] AI tried to search tickets from", query.from, "to", query.to, "on date from", query.from_date, query.to_date ? `to date ${query.to_date}` : '');
            let t = generateMockTickets(query.from, query.to, 2, 5);
            tickets.push(...t)
            return t
        }/*,
        description: "Получает информацию о доступных билетах на поезд",
        parameters: {
            properties: {
                from: {
                    type: "string",
                    description: "Место отправления (город или станция)",
                },
                to: {
                    type: "string",
                    description: "Место прибытия (город или станция)",
                },

                from_date: {
                    type: "string",
                    description: "Начальная дата"
                },
                to_date: {
                    type: "string",
                    description: "Конечная дата",
                }
            },
            required: ["from", "to", "from_date"]
        }
    }*/
}