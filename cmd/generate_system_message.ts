import { writeFileSync } from 'node:fs';
import { tutuQueryStations, tutuQueryTickets } from '../src/apis/tutu';
import { rzdQueryStations, rzdQueryTickets } from '../src/apis/rzd';

// Types for the function schem

export interface FollowUpMessage {
    type: "follow_up";
    responses: any[];
}

// Previous types remain the same
interface FunctionParameter {
    type: string;
    description?: string;
    required?: boolean;
    properties?: Record<string, FunctionParameter>;
    items?: FunctionParameter;
}

export interface FunctionSchema {
    name: string;
    namespace: string;
    description: string;
    parameters: Record<string, FunctionParameter>;
    returns: {
        type: string;
        properties?: Record<string, FunctionParameter>;
        items?: FunctionParameter;
    };
}

export type FunctionSchemaWithHandler = FunctionSchema & {handler: (data: any) => Promise<any>}

interface MessageType {
    name: string;
    description: string;
    properties: Record<string, {
        type: string;
        description: string;
        required?: boolean;
    }>;
}

interface ConfigSchema {
    description: string;
    functions: FunctionSchema[];
    messageTypes: MessageType[];
}

// New function to generate JSON Schema
function generateJsonSchema(config: ConfigSchema): any {
    const schema: any = {
        $schema: "http://json-schema.org/draft-07/schema#",
        type: "object",
        title: "Assistant Response",
        required: ["follow_up", "response", "function_calls"],
        properties: {
            follow_up: {
                type: "boolean",
                title: "Follow Up",
                description: "Indicates if a function response is expected"
            },
            response: {
                type: "array",
                title: "Response Messages",
                items: {
                    oneOf: config.messageTypes.map(msgType => generateMessageTypeSchema(msgType))
                }
            },
            function_calls: {
                type: "array",
                title: "Function Calls",
                items: {
                    type: "object",
                    required: ["namespace", "name", "args"],
                    properties: {
                        namespace: {
                            type: "string",
                            enum: [...new Set(config.functions.map(f => f.namespace))]
                        },
                        name: {
                            type: "string",
                            enum: config.functions.map(f => f.name)
                        },
                        args: {
                            type: "object"
                        }
                    }
                }
            }
        }
    };

    // Add message type definitions
    schema.$defs = {};
    config.messageTypes.forEach(msgType => {
        schema.$defs[getSchemaTypeName(msgType.name)] = generateMessageTypeSchema(msgType);
    });

    // Add function parameter and return type definitions
    config.functions.forEach(func => {
        const paramSchema = convertToJsonSchema(func.parameters);
        const returnSchema = convertToJsonSchema(func.returns);
        
        schema.$defs[`${func.namespace}_${func.name}_params`] = paramSchema;
        schema.$defs[`${func.namespace}_${func.name}_returns`] = returnSchema;
    });

    return schema;
}

function generateMessageTypeSchema(msgType: MessageType): any {
    return {
        type: "object",
        title: msgType.name,
        description: msgType.description,
        required: Object.entries(msgType.properties)
            .filter(([_, prop]) => prop.required !== false)
            .map(([key]) => key),
        properties: Object.entries(msgType.properties).reduce((acc, [key, prop]) => ({
            ...acc,
            [key]: {
                type: prop.type,
                description: prop.description,
                title: toTitleCase(key)
            }
        }), {})
    };
}

function convertToJsonSchema(param: any): any {
    if (!param) return { type: "null" };

    const schema: any = { type: param.type };
    
    if (param.description) {
        schema.description = param.description;
    }

    if (param.properties) {
        schema.properties = {};
        schema.required = [];
        
        Object.entries(param.properties).forEach(([key, prop]: [string, any]) => {
            schema.properties[key] = convertToJsonSchema(prop);
            if (prop.required !== false) {
                schema.required.push(key);
            }
        });
    }

    if (param.items) {
        schema.items = convertToJsonSchema(param.items);
    }

    return schema;
}

function getSchemaTypeName(name: string): string {
    return name.replace(/\s+/g, '');
}

function toTitleCase(str: string): string {
    return str
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

function generateMarkdown(config: ConfigSchema): string {
    let md = `# Конфигурация ассистента
Вы - Ранчер, ИИ-ассистент, ${config.description}. Все ответы предоставляются исключительно в формате JSON согласно определённым схемам.

# Формат ответа
Каждый ответ должен следовать следующей базовой структуре:
\`\`\`json
{
    "follow_up": boolean,    // требуется ли ожидание ответа от функции
    "response": MessageEntity[], // массив сообщений
    "function_calls": FunctionCall[] // массив вызовов функций
}
\`\`\`

# Типы сообщений\n`;

    // Generate message types documentation
    config.messageTypes.forEach(msgType => {
        md += `\n## ${msgType.name}\n${msgType.description}\n\`\`\`json\n{\n`;
        Object.entries(msgType.properties).forEach(([key, prop]) => {
            md += `    "${key}": ${prop.type}${prop.required === false ? '?' : ''}`;
            if (prop.description) {
                md += `  // ${prop.description}`;
            }
            md += '\n';
        });
        md += '}\n\`\`\`\n';
    });

    // Generate functions documentation
    md += '\n# Доступные функции\n';
    
    config.functions.forEach(func => {
        md += `\n## ${func.namespace}.${func.name}\n`;
        md += `${func.description}\n\n`;
        
        // Parameters
        md += '### Параметры:\n```json\n';
        md += JSON.stringify(func.parameters, null, 4);
        md += '\n```\n';
        
        // Return type
        md += '\n### Структура ответа:\n```json\n';
        md += JSON.stringify(func.returns, null, 4);
        md += '\n```\n';
    });

    md += '\n# Доп правила\n';
    md += `# Важные правила форматирования ответов

# Правила валидации ответа
Перед отправкой ответа убедитесь, что:
1. Все временные метки корректно преобразованы в Unix timestamp
2. Если информации недостаточно не отправляйте больше запросов follow_up просто ответьте к примеру "Я не нашёл билетов на эту дату, возможно вы хотите изменить дату?" и всё, ожидайте информации от пользователя.
3. Если вы хотите узнать информацию например о станциях или билетах вызывайте доступные вам функции в follow_up запросах тогда вы получите ответ в свой промпт.
4. Не вызывай follow_up без функций
5. Если получил пустой массив или ошибку оповести пользователя об ошибке.
6. Предлагай пользователю переходить на сторонние ссылки к примеру на страницу с билетами
7. Не предлагай пользователю использовать функции которых у тебя нет, к примеру ты не можешь покупать билеты ты можешь их только отображать значит не пиши "Выберите подходящий вариант билета:" пиши "Вот какие билеты я смог найти"
8. Не делай больших сообщений, например вместо того чтобы выводить все найденные билеты предлагай пользователю перейти на сайт агрегатора который ты получаешь вместе с "rzdtrains.queryTickets"
# Частые сценарии 
- Посмотреть билеты из точки А (или точки user_info.location) в точку B
> Для этого нужно получить ID станций для этого нужно вызвать "rzdtrains.queryStations", далее указываем ID наиболее подходящих станций в "rzdtrains.queryTickets"

`

    return md;
}

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
        // tutuQueryStations,
        // tutuQueryTickets
        rzdQueryStations,
        rzdQueryTickets
    ]
};

// Generate the markdown
const markdown = generateMarkdown(sampleConfig);
const jsonSchema = generateJsonSchema(sampleConfig);

// Save to file (optional)
writeFileSync('assistant-config.md', markdown, 'utf-8');
writeFileSync('assistant-schema.json', JSON.stringify(jsonSchema, null, 2), 'utf-8');

export { generateMarkdown, generateJsonSchema };