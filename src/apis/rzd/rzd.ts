import axios from "axios";
import type { RzdSuggests } from "../../types/rzd_suggests";
import type { RzdTrainPricing } from "../../types/rzd_train_pricing";
import type { Node } from "../../types/rzd_node";

export async function getRZDSuggests(query: string): Promise<RzdSuggests> {
    const response = await axios.get<RzdSuggests>(`https://ticket.rzd.ru/api/v1/suggests?GroupResults=true&RailwaySortPriority=true&MergeSuburban=true&Query=${query}&Language=ru&TransportType=rail`);
    return response.data;
}

export async function getRZDTrainPrices(origin: number, destination: number, departureDate: Date) {
    console.log(departureDate)
    let url = `https://ticket.rzd.ru/api/v1/railway-service/prices/train-pricing?service_provider=B2B_RZD&origin=${origin}&destination=${destination}&departureDate=${departureDate.getFullYear()}-${departureDate.getUTCMonth()+1}-${departureDate.getUTCDate()}T00:00:00&timeFrom=0&timeTo=24&carGrouping=DontGroup&getByLocalTime=true&specialPlacesDemand=StandardPlacesAndForDisabledPersons&carIssuingType=All&getTrainsFromSchedule=true`;
    console.log(url)
    const response = await axios.get<RzdTrainPricing>(url);
    return response.data;
}

export function simplifyTrainPricing(pricing: RzdTrainPricing) {
    return pricing.Trains.map(train =>({
        display_name: train.TrainName,
        url: `https://ticket.rzd.ru/booking/rail/${train.TrainNumberToGetRoute}`,
        origin: {
            name: train.OriginName,
            code: train.OriginStationCode
        },
        destination: {
            name: train.DestinationName,
            code: train.DestinationStationCode
        },
        prices: train.CarGroups.map(i => ({type: i.CarTypeName, min_price: i.MinPrice, max_price: i.MaxPrice})),
        duration: train.TripDuration,
        distance: train.TripDistance,
        departure: {local: train.LocalDepartureDateTime, normal: train.DepartureDateTime},
        arrival: {local: train.LocalArrivalDateTime, normal: train.ArrivalDateTime},
    }));
}

export function simplifySuggests(suggests: RzdSuggests) {
    return suggests.city.map(suggest => ({
        nodeId: suggest.nodeId,
        name: suggest.name,
  //      expressCode: suggest.expressCode,
        region: suggest.region
    }));
}

export async function rzdGetNode(id: string): Promise<Node> {
    const resp = await axios.get<Node>(`https://ticket.rzd.ru/api/v1/getobject?id=${id}`);

    return resp.data
}