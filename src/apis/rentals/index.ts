import type { FunctionParameter, FunctionSchema, FunctionSchemaWithHandler } from "../../../cmd/old_generate_system_message";
import { RealEstateApiClient } from "./rentals";

const client = new RealEstateApiClient("https://rentals.bethetka.ru")

const listing: FunctionParameter = {
    type: "object",
    properties: {
        id: { type: "integer", description: "Уникальный идентификатор объявления", required: true },
        title: { type: "string", description: "Название объявления с кратким описанием объекта", required: true },
        description: { type: "string", description: "Полное описание объекта недвижимости", required: true },
        address: { type: "string", description: "Адрес объекта недвижимости", required: true },
        area: { type: "string", description: "Район, в котором расположен объект", required: true },
        rooms: { type: "integer", description: "Количество комнат", required: true },
        price: { type: "number", description: "Цена объекта недвижимости", required: true },
        location: {
            type: "object",
            description: "Географические координаты объекта",
            required: true,
            properties: {
                lat: { type: "number", description: "Широта", required: true },
                lng: { type: "number", description: "Долгота", required: true }
            }
        },
        details: {
            type: "object",
            description: "Подробные характеристики объекта",
            required: true,
            properties: {
                floor: { type: "integer", description: "Этаж", required: true },
                totalFloors: { type: "integer", description: "Общее количество этажей в здании", required: true },
                area: { type: "number", description: "Площадь объекта в квадратных метрах", required: true },
                hasBalcony: { type: "boolean", description: "Наличие балкона", required: true },
                hasParking: { type: "boolean", description: "Наличие парковки", required: true },
                renovationType: { type: "string", description: "Тип ремонта", required: true }
            }
        },
        photos: {
            type: "array",
            description: "Массив ссылок на фотографии объекта",
            items: { type: "string" },
            required: true
        },
        contact: {
            type: "object",
            description: "Контактная информация владельца объявления",
            required: true,
            properties: {
                name: { type: "string", description: "Имя контактного лица", required: true },
                phone: { type: "string", description: "Телефонный номер контактного лица", required: true },
                email: { type: "string", description: "Электронная почта контактного лица", required: true }
            }
        },
        created: { type: "string", description: "Дата и время создания объявления", required: true },
        views: { type: "integer", description: "Количество просмотров объявления", required: true },
        isFavorite: { type: "boolean", description: "Является ли объявление избранным", required: true }
    }
};

export const getListings: FunctionSchemaWithHandler = {
    namespace: "realEstate",
    name: "getListings",
    description: "Получение списка объявлений о недвижимости с фильтрацией и пагинацией",
    parameters: {
        page: { type: "integer", description: "Номер страницы (по умолчанию 1)", required: false },
        limit: { type: "integer", description: "Количество объявлений на странице (по умолчанию 20)", required: false },
        minPrice: { type: "number", description: "Минимальная цена", required: false },
        maxPrice: { type: "number", description: "Максимальная цена", required: false },
        minRooms: { type: "integer", description: "Минимальное количество комнат", required: false },
        maxRooms: { type: "integer", description: "Максимальное количество комнат", required: false }
    },
    returns: {
        type: "object",
        properties: {
            items: {
                type: "array",
                items: listing,
                description: "Список объявлений, соответствующих фильтрам",
                required: true
            },
            total: { type: "integer", description: "Общее количество объявлений, соответствующих фильтрам", required: true },
            page: { type: "integer", description: "Текущий номер страницы", required: true },
            totalPages: { type: "integer", description: "Общее количество страниц", required: true }
        }
    },
    handler: async ({ page = 1, limit = 20, minPrice, maxPrice, minRooms, maxRooms }) => {
        const response = await client.getListings(page, limit, minPrice, maxPrice, minRooms, maxRooms);
        return response;
    }
};

export const getListingById: FunctionSchemaWithHandler = {
    namespace: "realEstate",
    name: "getListingById",
    description: "Получение детальной информации об объявлении по идентификатору",
    parameters: {
        id: { type: "integer", description: "Уникальный идентификатор объявления", required: true }
    },
    returns: listing,
    handler: async ({ id }) => {
        const response = await client.getListingById(id);
        return response;
    }
};
