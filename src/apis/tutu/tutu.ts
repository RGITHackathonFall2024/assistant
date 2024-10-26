
import axios from "axios";
import fs from "node:fs/promises"
import type { TutuTrains } from "../../types/tutu_trains";

export interface Station {
    division: string | null;
    esr: number | null;
    invalid_esr: number | null;
    country: string | null;
    region: string | null;
    express: number | null;
    dup_esr: string | null;
    source: string | null;
    iso3166: string | null;
    railway: string | null;
    type: string | null;
    name: string | null;
}

export interface RailwayStationSuggestion {
    id: string;
    value: string;
}

export type RailwayStationSuggestions = RailwayStationSuggestion[];

export async function getRailwayStationSuggestions(query: string): Promise<RailwayStationSuggestions> {
    const response = await axios.get<RailwayStationSuggestions>(`https://www.tutu.ru/suggest/railway_simple/?name=${encodeURIComponent(query)}`);
    return response.data.filter(i => +i.id%1000!==0);
}

export async function getTrains(term1Express: number, term2Express: number): Promise<TutuTrains> {
    const response = await axios.get<TutuTrains>(`https://suggest.travelpayouts.com/search?service=tutu_trains&term=${term1Express}&term2=${term2Express}`);
    let d = response.data;
    if (Array.isArray(d)) return d;
    d.url = `https://tutu.ru${d.url}` 
    return d;
}


