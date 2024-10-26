export interface TutuTrainsSuccess {
    trips: Trip[];
    url:   string;
}

export type TutuTrains = [] | TutuTrainsSuccess;

export interface Trip {
    arrivalStation:      string;
    arrivalTime:         string;
    categories:          Category[];
    departureStation:    string;
    departureTime:       string;
    firm:                boolean;
    name:                null | string;
    numberForUrl:        string;
    runArrivalStation:   string;
    runDepartureStation: string;
    trainNumber:         string;
    travelTimeInSeconds: string;
}

export interface Category {
    price: number;
    type:  Type;
}

export enum Type {
    Common = "common",
    Coupe = "coupe",
    Lux = "lux",
    Plazcard = "plazcard",
    Sedentary = "sedentary",
    Soft = "soft",
}