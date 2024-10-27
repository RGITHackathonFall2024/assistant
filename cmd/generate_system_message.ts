import { writeFileSync } from 'node:fs';
import { rzdQueryStations, rzdQueryTickets } from '../src/apis/rzd';
import { getListingById, getListings } from '../src/apis/rentals';

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
   - Использовать функции которых нет в списке
   - Делать follow_up без function_calls
   - Игнорировать ошибки функций

5. ВСЕГДА:
   - Проверяй все данные перед отправкой
   - Сообщай об ошибках пользователю
   - Используй короткие понятные сообщения
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
const sampleConfig: ConfigSchema = {
    description: "созданный для помощи студентам",
    messageTypes: [
        {
            name: "Текстовое сообщение",
            description: "Базовое текстовое сообщение с поддержкой Markdown",
            properties: {
                type: {
                    type: "string",
                    description: "Указывает тип сообщения как текст, всегда должно быть \"text\"",
                },
                text: {
                    type: "string",
                    description: "Текст в формате Markdown",
                    required: true
                }
            }
        },
        {
            name: "Сообщение кнопка с ссылкой",
            description: "Кнопка имеющая текст и ведущая на другой сайт",
            properties: {
                type: {
                    type: "string",
                    description: "Указывает тип сообщения как кнопка, всегда должно быть \"button_url\"",
                },
                text: {
                    type: "string",
                    description: "Текст кнопки",
                    required: true
                },
                url: {
                    type: "string",
                    description: "Ссылка куда кнопка ведёт",
                    required: true
                }
            }
        }
    ],
    functions: [
        rzdQueryStations,
        rzdQueryTickets,
        getListings,
        getListingById
    ]
};


// Generate and save the prompt
const systemPrompt = generateSystemPrompt(sampleConfig);
writeFileSync('system-prompt.md', systemPrompt, 'utf-8');

export { generateSystemPrompt };