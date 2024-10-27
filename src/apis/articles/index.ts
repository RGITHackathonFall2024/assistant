import type { FunctionSchemaWithHandler } from "../../../cmd/generate_system_message";
import { article1 } from "./article1";

export const getArticle1: FunctionSchemaWithHandler = {
    namespace: "articles",
    name: "article1",
    description: "Получить текст \"Заселение в общежитие\", ты получишь текст статьи о заселении в общежитие чтобы помочь студенту",
    parameters: {

    },
    returns: {
        type: "string"
    },
    handler: async () => {
        return article1;
    }
};