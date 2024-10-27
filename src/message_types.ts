export const messageTypes = [
    {
        name: "Текстовое сообщение",
        type: "text",
        description: "Базовое текстовое сообщение с поддержкой Markdown",
        fields: [
            {
                name: "type",
                type: "string",
                description: "Всегда должно быть 'text'",
                required: true
            },
            {
                name: "text",
                type: "string",
                description: "Текст сообщения в формате Markdown",
                required: true
            }
        ]
    },
    {
        name: "Кнопка-ссылка",
        type: "button_url",
        description: "Кнопка с текстом и ссылкой для перехода",
        fields: [
            {
                name: "type",
                type: "string",
                description: "Всегда должно быть 'button_url'",
                required: true
            },
            {
                name: "text",
                type: "string",
                description: "Текст, отображаемый на кнопке",
                required: true
            },
            {
                name: "url",
                type: "string",
                description: "URL для перехода по клику",
                required: true
            }
        ]
    }
];