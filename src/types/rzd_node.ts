

export enum CountryISO {
    Ru = "RU",
}

export enum NodeType {
    City = "city",
    Station = "station",
}

export enum TransportType {
    City = "city",
    Train = "train",
}

export interface Node {
    nodeId:         string;
    expressCode:    string;
    name:           string;
    nodeType:       NodeType;
    transportType:  TransportType;
    region:         string;
    regionIso:      string;
    countryIso:     CountryISO;
    busCode?:       string;
    suburbanCode?:  string;
    foreignCode?:   string;
    hasAeroExpress: boolean;
    expressCodes?:  string;
}