import type { FunctionParameter, FunctionSchema, FunctionSchemaWithHandler } from "../../../cmd/old_generate_system_message";
import { RealEstateApiClient } from "./rentals";

const client = new RealEstateApiClient("https://rentals.bethetka.ru")

export const getListings: FunctionSchemaWithHandler = {
    namespace: "realEstate",
    name: "getListings",
    description: "Поиск объявлений о недвижимости с фильтрами",
    parameters: {
        page: {
            type: "number",
            required: false,
            description: "Номер страницы (по умолчанию: 1)"
        },
        limit: {
            type: "number",
            required: false,
            description: "Результатов на странице (по умолчанию: 3)"
        },
        minPrice: {
            type: "number",
            required: false,
            description: "Минимальная цена"
        },
        maxPrice: {
            type: "number",
            required: false,
            description: "Максимальная цена"
        },
        minRooms: {
            type: "number",
            required: false,
            description: "Минимум комнат"
        },
        maxRooms: {
            type: "number",
            required: false,
            description: "Максимум комнат"
        }
    },
    returns: {
        type: "object",
        properties: {
            items: { type: "array", description: "Список объявлений" },
            total: { type: "number", description: "Общее количество" },
            page: { type: "number", description: "Текущая страница" },
            totalPages: { type: "number", description: "Всего страниц" },
            url: { type: "string", description: "Ссылка на агрегатора (предложи пользователю перейти на сайт)" },
        }
    },
    handler: async ({ page = 1, limit = 3, minPrice, maxPrice, minRooms, maxRooms }) => {
        const response = await client.getListings(page, limit, minPrice, maxPrice, minRooms, maxRooms);
        return {
            total: response.total,
            page: response.page,
            totalPages: response.totalPages,
            items: response.items.map((i: any) => ({
                id: i.id,
                title: i.title,
                description: i.description,
                address: i.address,
                rooms: i.rooms,
                price: i.price,
                //details: i.details
            })),
            url: "https://rentals.bethetka.ru"
        }
    }
};

export const getListingById: FunctionSchemaWithHandler = {
    namespace: "realEstate",
    name: "getListingById",
    description: "Получение информации об одном объявлении",
    parameters: {
        id: {
            type: "number",
            required: true,
            description: "ID объявления"
        }
    },
    returns: {
        type: "object",
        properties: {
            id: { type: "number" },
            title: { type: "string" },
            price: { type: "number" },
            rooms: { type: "number" },
            description: { type: "string" }
        }
    },
    handler: async ({ id }) => {
        const response = await client.getListingById(id);
        return response;
    }
};