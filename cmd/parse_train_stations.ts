
import fs from "node:fs/promises";
import axios from "axios";
import "dotenv/config";
import { StationType, TransportType, type Station, type Stations } from "../src/types/yandex_schedule";

const URL = `https://api.rasp.yandex.net/v3.0/stations_list/?apikey=${process.env.YRASP_API_KEY!}&lang=ru_RU&format=json`;
const stationsResponse = await axios.get<Stations>(URL);
const stationsList = stationsResponse.data;

const russia = stationsList.countries.find(i=>i.title == "Россия")!;

export interface TrainStations extends Station {
    region: string;
    settlement: string;
}

await fs.writeFile("./data/train_stations.json", JSON.stringify(
    russia.regions
        .map(i => i.settlements
            .map(j => j.stations
                .filter(k => k.transport_type == TransportType.Train)
                .map(k => ({...k, region: i.title, settlement: j.title}))))
        .flat(2)
), "utf-8")