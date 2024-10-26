import type { FunctionSchema, FunctionSchemaWithHandler } from "../../../cmd/generate_system_message";
import { getRailwayStationSuggestions } from "./tutu";

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
                    type: "string",
                    required: true
                },
                value: {
                    type: "string",
                    required: true
                }
            }
        }
    },
    handler: ({query}) => getRailwayStationSuggestions(query)
};