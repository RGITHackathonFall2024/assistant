import axios, { type AxiosInstance } from 'axios';

export class RealEstateApiClient {
    private apiClient: AxiosInstance;

    constructor(baseURL: string) {
        this.apiClient = axios.create({
            baseURL,
        });
    }

    /**
     * Получить список объявлений
     * @param page Номер страницы (по умолчанию 1)
     * @param limit Количество объявлений на странице (по умолчанию 20)
     * @param minPrice Минимальная цена фильтрации
     * @param maxPrice Максимальная цена фильтрации
     * @param minRooms Минимальное количество комнат
     * @param maxRooms Максимальное количество комнат
     * @returns Список объявлений, соответствующих фильтрам
     */
    async getListings(page = 1, limit = 20, minPrice?: number, maxPrice?: number, minRooms?: number, maxRooms?: number) {
        const response = await this.apiClient.get('/api/listings', {
            params: {
                page,
                limit,
                minPrice,
                maxPrice,
                minRooms,
                maxRooms,
            },
        });
        return response.data;
    }

    /**
     * Получить детальную информацию об объявлении
     * @param id Уникальный идентификатор объявления
     * @returns Подробности объявления по ID
     */
    async getListingById(id: number) {
        const response = await this.apiClient.get(`/api/listings/${id}`);
        return response.data;
    }
}

// Инициализация клиента API
const client = new RealEstateApiClient('https://rentals.bethetka.ru');
