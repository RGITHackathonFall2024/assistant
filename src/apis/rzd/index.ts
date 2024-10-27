import type { FunctionSchemaWithHandler } from "../../../cmd/generate_system_message";
import { getRZDSuggests, getRZDTrainPrices, rzdGetNode, simplifySuggests, simplifyTrainPricing } from "./rzd";

export const rzdQueryStations: FunctionSchemaWithHandler = {
    namespace: "rzdtrains",
    name: "queryStations",
    description: "Поиск железнодорожных станций РЖД по названию",
    parameters: {
        query: {
            type: "string",
            required: true,
            description: "Название станции для поиска (например: 'Москва')"
        }
    },
    returns: {
        type: "array",
        properties: {
            expressCode: { type: "string" },
            region: { type: "string" },
            name: { type: "string" }
        }
    },
    handler: async ({ query }: any) => {
        const suggests = await getRZDSuggests(query);
        console.log("test query")
        return simplifySuggests(suggests);
    }
};


export const rzdQueryTickets: FunctionSchemaWithHandler = {
    namespace: "rzdtrains",
    name: "queryTickets",
    description: "Поиск билетов на поезда РЖД между станциями",
    parameters: {
        origin: {
            type: "string",
            required: true,
            description: "Код/nodeId станции отправления"
        },
        destination: {
            type: "string",
            required: true,
            description: "Код/nodeId станции прибытия"
        },
        departureDate: {
            type: "string",
            required: true,
            description: "Дата отправления (формат: DD.MM.YYYY)"
        }
    },
    returns: {
        type: "object",
        properties: {
            trains: {
                type: "array",
                description: "Список найденных поездов",
                properties: {
                    display_name: { type: "string" },
                    url: { type: "string" },
                    duration: { type: "string" },
                    distance: { type: "number" },
                    prices: {
                        type: "array",
                        properties: {
                            type: { type: "string" },
                            min_price: { type: "number" },
                            max_price: { type: "number" }
                        }
                    }
                }
            },
            url: { 
                type: "string",
                description: "Ссылка на страницу с полным списком билетов"
            }
        }
    },
    handler: async ({ origin, destination, departureDate }: any) => {
        const [day, month, year] = departureDate.split('.');
        const date = new Date(+year, +month - 1, +day);
        console.log("gool", origin, destination)
        let originNode = await rzdGetNode(origin);
        let destinationNode = await rzdGetNode(destination);
        const result = await getRZDTrainPrices(+originNode.expressCode, +destinationNode.expressCode, date);
        return {
            trains: simplifyTrainPricing(result).slice(0, 5),
            url: `https://ticket.rzd.ru/searchresults/v/1/${origin}/${destination}/${+year}-${+month}-${+day}`
        };
    }
};