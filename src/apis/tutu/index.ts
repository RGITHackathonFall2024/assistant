import type { FunctionSchema, FunctionSchemaWithHandler } from "../../../cmd/generate_system_message";
import { getRailwayStationSuggestions, getTrains } from "./tutu";
import fs from "node:fs/promises"

export const tutuQueryStations: FunctionSchemaWithHandler = {
    namespace: "tututrains",
    name: "queryStations",
    description: "Ищет ЖД станции по запросу",
    parameters: {
        query: {
            type: "string",
            required: true,
            description: "Запрос, к примеру Питер или Ростов"
        }
    },
    returns: {
        type: "array",
        items: {
            type: "object",
            description: "Объект ЖД стацнии",
            properties: {
                id: {
                    type: "number",
                    required: true
                },
                value: {
                    type: "string",
                    required: true
                }
            }
        }
    },
    handler: async ({ query }) => (await getRailwayStationSuggestions(query)).map(i => ({ value: i.value, id: +i.id }))
};

export const tutuQueryTickets: FunctionSchemaWithHandler = {
    namespace: "tututrains",
    name: "queryTickets",
    description: "Ищет ЖД станции по запросу",
    parameters: {
        term1: {
            type: "number",
            required: true,
            description: "ID вокзала отправления"
        },
        term2: {
            type: "number",
            required: true,
            description: "ID вокзала прибытия"
        }
    },
    returns: {
        type: "object",
        properties: {
            trips: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        arrivalStation: {
                            type: "string",
                            required: true
                        },
                        arrivalTime: {
                            type: "string",
                            required: true
                        },
                        departureStation: {
                            type: "string",
                            required: true
                        },
                        departureTime: {
                            type: "string",
                            required: true
                        },
                        numberForUrl: {
                            type: "string",
                            required: true
                        },
                        runArrivalStation: {
                            type: "string",
                            required: true
                        },
                        runDepartureStation: {
                            type: "string",
                            required: true
                        },
                        trainNumber: {
                            type: "string",
                            required: true
                        },
                        travelTimeInSeconds: {
                            type: "string",
                            required: true
                        },
                        name: {
                            type: "string",
                            required: false
                        },
                        firm: {
                            type: "boolean",
                            required: true
                        },
                        categories: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    price: {
                                        type: "number",
                                        required: true
                                    },
                                    type: {
                                        type: "string",
                                        required: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    handler: async ({ term1, term2 }) => {
        let result = await getTrains(term1, term2);
        if (Array.isArray(result)) {
            return {error: "nothing found"}
        }
        return result
    }
};