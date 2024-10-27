import { writeFileSync } from 'node:fs';
import { rzdQueryStations, rzdQueryTickets } from '../src/apis/rzd';
import { getListingById, getListings } from '../src/apis/rentals';
import { messageTypes } from '../src/message_types';

// Simplified types for easier processing
export interface FunctionParameter {
    type: string;
    description?: string;
    required?: boolean;
    properties?: Record<string, FunctionParameter>;
}

export interface FunctionSchema {
    name: string;
    namespace: string;
    description: string;
    parameters: Record<string, FunctionParameter>;
    returns: {
        type: string;
        properties?: Record<string, FunctionParameter>;
    };
}

export interface MessageType {
    name: string;
    type: string;
    description: string;
    fields: Array<{
        name: string;
        type: string;
        description: string;
        required: boolean;
    }>;
}

export interface ConfigSchema {
    assistantName: string;
    description: string;
    functions: FunctionSchema[];
    messageTypes: MessageType[];
}

function generateBasicJsonSchema(messageType: MessageType): string {
    const fields = messageType.fields
        .map(field => `    "${field.name}": "${field.type}"${field.required ? '' : '?'} // ${field.description}`)
        .join(',\n');
    
    return `{
${fields}
}`;
}

function generateFunctionDocs(func: FunctionSchema): string {
    return `### ${func.namespace}.${func.name}
${func.description}

Параметры:
\`\`\`json
${JSON.stringify(func.parameters, null, 2)}
\`\`\`

Возвращает:
\`\`\`json
${JSON.stringify(func.returns, null, 2)}
\`\`\`
`;
}

function generateInstructions(): string {
    return `
ВАЖНЫЕ ПРАВИЛА:
1. ВСЕГДА отвечай в формате JSON
2. Каждый ответ должен содержать:
   - "follow_up": true/false
   - "response": массив сообщений
   - "function_calls": массив вызовов функций

3. СТРУКТУРА ОТВЕТА:
\`\`\`json
{
    "follow_up": boolean,    // нужно ли ждать ответа от функции
    "response": [            // массив сообщений
        {
            "type": "text",  // или другой тип
            ...остальные поля
        }
    ],
    "function_calls": [      // вызовы функций
        {
            "namespace": "string",
            "name": "string",
            "args": {}
        }
    ]
}
\`\`\`

4. ЗАПРЕЩЕНО:
   - Отвечать обычным текстом
   - Использовать функции которые не доступны, только функции перечисленные выше
   - Делать follow_up без function_calls
   - Игнорировать ошибки функций
   - Добавлять комментарии в JSON

5. ВСЕГДА:
   - Проверяй все данные перед отправкой
   - Сообщай об ошибках пользователю
   - Используй короткие понятные сообщения

6. ЧАСТЫЕ СЦЕНАРИИ
    - Поиск ЖД билетов
    1. Узнаём у пользователя дату, точку отправления (если не указано использовать точку user_info.location), и точку прибытия
    2. Узнаём nodeId у станций использую rzdtrains.queryStations
    3. С помощью rzdtrains.queryTickets получаем 5 наиболее подходящих билетов также с помощью button_url предлагаем пользователю перейти на сайт РЖД по url из ответа.
    - Поиск квартиры
    1. Вызываем rentals.getListings с нужными нам параметрами
    2. Отображаем пользователю первые 3 вариант
    3. С помощью button_url предлагаем перейти на сайт агрегатора
`;
}

function generateSystemPrompt(config: ConfigSchema): string {
    const prompt = `# ${config.assistantName}
${config.description}

${generateInstructions()}

# Доступные типы сообщений:
${config.messageTypes.map(type => `
## ${type.name}
${type.description}
\`\`\`json
${generateBasicJsonSchema(type)}
\`\`\`
`).join('\n')}

# Доступные функции:
${config.functions.map(generateFunctionDocs).join('\n')}

# Примеры использования:

1. Простой ответ:
\`\`\`json
{
    "follow_up": false,
    "response": [
        {
            "type": "text",
            "text": "Привет! Чем могу помочь?"
        }
    ],
    "function_calls": []
}
\`\`\`

2. Запрос данных:
\`\`\`json
{
    "follow_up": true,
    "response": [
        {
            "type": "text",
            "text": "Ищу информацию..."
        }
    ],
    "function_calls": [
        {
            "namespace": "example",
            "name": "getData",
            "args": {
                "id": "123"
            }
        }
    ]
}
\`\`\`
`;

    return prompt;
}

// Example usage
export const config: ConfigSchema = {
    assistantName: "Ранчер",
    description: "ИИ-ассистент, созданный для помощи студентам",
    messageTypes,
    functions: [
        rzdQueryStations,
        rzdQueryTickets,
        getListings,
        getListingById
    ]
};

// Generate and save the prompt
const systemPrompt = generateSystemPrompt(config);
writeFileSync('assistant-config.md', systemPrompt, 'utf-8');

export { generateSystemPrompt };