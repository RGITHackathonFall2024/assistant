import { getArticle1 } from "./articles";
import { getListingById, getListings } from "./rentals";
import { rzdQueryStations, rzdQueryTickets } from "./rzd";

export const apiTools = {
    "rzdtrains.queryStations": rzdQueryStations,
    "rzdtrains.queryTickets": rzdQueryTickets,

    "realEstate.getListingById": getListingById,
    "realEstate.getListings": getListings,

    "articles.article1": getArticle1
}