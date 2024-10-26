import type { FunctionSchemaWithHandler } from "../../../cmd/generate_system_message";
import { getRZDSuggests, getRZDTrainPrices, rzdGetNode, simplifySuggests, simplifyTrainPricing } from "./rzd";

export const rzdQueryStations: FunctionSchemaWithHandler = {
    namespace: "rzdtrains",
    name: "queryStations",
    description: "Поиск железнодорожных станций РЖД по запросу",
    parameters: {
        query: {
            type: "string",
            required: true,
            description: "Поисковый запрос, например 'Москва' или 'Санкт-Петербург'"
        }
    },
    returns: {
        type: "array",
        items: {
            type: "object",
            properties: {
                // nodeId: {
                //     type: "string",
                //     required: true
                // },
                expressCode: {
                    type: "string",
                    required: true
                },
                region: {
                    type: "string",
                    required: true
                },
                name: {
                    type: "string",
                    required: true
                }
            }
        }
    },
    handler: async ({ query }) => {
        const suggests = await getRZDSuggests(query);
        return simplifySuggests(suggests);
    }
};

export const rzdQueryTickets: FunctionSchemaWithHandler = {
    namespace: "rzdtrains",
    name: "queryTickets",
    description: "Поиск билетов на поезда РЖД",
    parameters: {
        origin: {
            type: "number",
            required: true,
            description: "ID станции отправления (expressCode)"
        },
        destination: {
            type: "number",
            required: true,
            description: "ID станции прибытия (expressCode)"
        },
        departureDate: {
            type: "string",
            required: true,
            description: "Дата отправления в формате DD.MM.YYYY"
        }
    },
    returns: {
        type: "object",
        properties: {
            trains: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        display_name: {
                            type: "string",
                            required: true
                        },
                        url: {
                            type: "string",
                            required: true
                        },
                        origin: {
                            type: "object",
                            required: true,
                            properties: {
                                name: { type: "string", required: true },
                                code: { type: "string", required: true }
                            }
                        },
                        destination: {
                            type: "object",
                            required: true,
                            properties: {
                                name: { type: "string", required: true },
                                code: { type: "string", required: true }
                            }
                        },
                        prices: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    type: { type: "string", required: true },
                                    min_price: { type: "number", required: true },
                                    max_price: { type: "number", required: true }
                                }
                            }
                        },
                        duration: {
                            type: "string",
                            required: true
                        },
                        distance: {
                            type: "number",
                            required: true
                        },
                        departure: {
                            type: "object",
                            required: true,
                            properties: {
                                local: { type: "string", required: true },
                                normal: { type: "string", required: true }
                            }
                        },
                        arrival: {
                            type: "object",
                            required: true,
                            properties: {
                                local: { type: "string", required: true },
                                normal: { type: "string", required: true }
                            }
                        }
                    }
                }
            },
            url: {
                type: "string",
                required: true,
                description: "Ссылка для просмотра всех билетов"
            }
        }
    },
    handler: async ({ origin, destination, departureDate }) => {
        const [day, month, year] = departureDate.split('.');
        const date = new Date(+year, +month - 1, +day);
        let originNode = await rzdGetNode(origin);
        let destinationNode = await rzdGetNode(destination);
        const result = await getRZDTrainPrices(+originNode.expressCode, +destinationNode.expressCode, date);
        return {
            trains: simplifyTrainPricing(result).slice(0, 5),
            url: `https://ticket.rzd.ru/searchresults/v/1/${origin}/${destination}/${+year}-${+month}-${+day}`
        };
    }
};