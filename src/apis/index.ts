import type { Tools } from "../ai";
import { rzdGetTicketPrices } from "./rzd/getTicketPrices";

export const apiTools: Tools = {
    ...rzdGetTicketPrices
}