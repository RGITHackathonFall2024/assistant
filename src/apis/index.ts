import { rzdQueryStations, rzdQueryTickets } from "./rzd";
import { tutuQueryStations, tutuQueryTickets } from "./tutu";

export const apiTools = {
    // "tututrains.queryStations": tutuQueryStations,
    // "tututrains.queryTickets": tutuQueryTickets
    "rzdtrains.queryStations": rzdQueryStations,
    "rzdtrains.queryTickets": rzdQueryTickets
}