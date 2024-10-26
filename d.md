Introduction to Tool Use

Tool use is a powerful feature that allows Large Language Models (LLMs) to interact with external resources, such as APIs, databases, and the web, to gather dynamic data they wouldn't otherwise have access to in their pre-trained (or static) state and perform actions beyond simple text generation.

Tool use bridges the gap between the data that the LLMs were trained on with dynamic data and real-world actions, which opens up a wide array of realtime use cases for us to build powerful applications with, especially with Groq's insanely fast inference speed. 🚀
How Tool Use Works

Groq API tool use structure is compatible with OpenAI's tool use structure, which allows for easy integration. See the following cURL example of a tool use request:

curl https://api.groq.com/openai/v1/chat/completions \
-H "Content-Type: application/json" \
-H "Authorization: Bearer $GROQ_API_KEY" \
-d '{
  "model": "llama3-groq-70b-8192-tool-use-preview",
  "messages": [
    {
      "role": "user",
      "content": "What'\''s the weather like in Boston today?"
    }
  ],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_current_weather",
        "description": "Get the current weather in a given location",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "The city and state, e.g. San Francisco, CA"
            },
            "unit": {
              "type": "string",
              "enum": ["celsius", "fahrenheit"]
            }
          },
          "required": ["location"]
        }
      }
    }
  ],
  "tool_choice": "auto"
}'


To integrate tools with Groq API, follow these steps:

    Provide tools (or predefined functions) to the LLM for performing actions and accessing external data in real-time in addition to your user prompt within your Groq API request
    Define how the tools should be used to teach the LLM how to use them effectively (e.g. by defining input and output formats)
    Let the LLM autonomously decide whether or not the provided tools are needed for a user query by evaluating the user query, determining whether the tools can enhance its response, and utilizing the tools accordingly
    Extract tool input, execute the tool code, and return results
    Let the LLM use the tool result to formulate a response to the original prompt

This process allows the LLM to perform tasks such as real-time data retrieval, complex calculations, and external API interaction, all while maintaining a natural conversation with our end user.
Tool Use with Groq

Groq API endpoints support tool use to almost instantly deliver structured JSON output that can be used to directly invoke functions from desired external resources.
Supported Models

Groq Fine-Tuned Models

These models have been finetuned by Groq specifically for tool use and are currently in public preview:

    llama3-groq-70b-8192-tool-use-preview
    llama3-groq-8b-8192-tool-use-preview

Check out our launch post for more information.

Note: When using our fine-tuned models in your workflow, we recommend implementing a routing system. Learn more below.

Llama 3.1 Models

The following Llama-3.1 models are also recommended for tool use due to their versatility and performance:

    llama-3.1-70b-versatile
    llama-3.1-8b-instant


Note: For wide scenario multi-turn tool use, we recommend using the native tool use feature of the Llama 3.1 models. For multi-turn with a narrow scenarios, fine-tuned tool use models might work well. We recommend trying both and seeing which works best for your specific use case!

Other Supported Models

The following models powered by Groq also support tool use:

    llama3-70b-8192
    llama3-8b-8192
    mixtral-8x7b-32768 (parallel tool use not supported)
    gemma-7b-it (parallel tool use not supported)
    gemma2-9b-it (parallel tool use not supported)

Tools Specifications

Tool use is part of the Groq API chat completion request payload.
Tool Call and Tool Response Structure

Tool Call Structure

Groq API tool calls are structured to be OpenAI-compatible. The following is an example tool call structure:

{
  "model": "llama3-groq-70b-8192-tool-use-preview",
  "messages": [
    {
      "role": "system",
      "content": "You are a weather assistant. Use the get_weather function to retrieve weather information for a given location."
    },
    {
      "role": "user",
      "content": "What's the weather like in New York today?"
    }
  ],
  "tools": [
    {
      "type": "function",
      "function": {
        "name": "get_weather",
        "description": "Get the current weather for a location",
        "parameters": {
          "type": "object",
          "properties": {
            "location": {
              "type": "string",
              "description": "The city and state, e.g. San Francisco, CA"
            },
            "unit": {
              "type": "string",
              "enum": ["celsius", "fahrenheit"],
              "description": "The unit of temperature to use. Defaults to fahrenheit."
            }
          },
          "required": ["location"]
        }
      }
    }
  ],
  "tool_choice": "auto",
  "max_tokens": 4096
}'


Tool Call Response

The following is an example tool call response based on the above:

"model": "llama3-groq-70b-8192-tool-use-preview",
"choices": [{
    "index": 0,
    "message": {
        "role": "assistant",
        "tool_calls": [{
            "id": "call_d5wg",
            "type": "function",
            "function": {
                "name": "get_weather",
                "arguments": "{\"location\": \"New York, NY\"}"
            }
        }]
    },
    "logprobs": null,
    "finish_reason": "tool_calls"
}],


When a model decides to use a tool, it returns a response with a tool_calls object containing:

    id: a unique identifier for the tool call
    type: the type of tool call, i.e. function
    name: the name of the tool being used
    parameters: an object containing the input being passed to the tool

Setting Up Tools

To get started, let's go through an example of tool use with Groq API that you can use as a base to build more tools on your own.

Step 1: Create Tool

Let's install Groq SDK, set up our Groq client, and create a function called calculate to evaluate a mathematical expression that we will represent as a tool.

Note: In this example, we're defining a function as our tool, but your tool can be any function or an external resource (e.g. dabatase, web search engine, external API).

npm install --save groq-sdk


const { Groq } = require('groq-sdk');


const client = new Groq();

const MODEL = 'llama3-groq-70b-8192-tool-use-preview';


function calculate(expression) {

    try {

        // Note: Using eval() in JavaScript can be dangerous.

        // In a production environment, you should use a safer alternative.

        const result = eval(expression);

        return JSON.stringify({ result });

    } catch {

        return JSON.stringify({ error: "Invalid expression" });

    }

}

Step 2: Pass Tool Definition and Messages to Model

Next, we'll define our calculate tool within an array of available tools and call our Groq API chat completion. You can read more about tool schema and supported required and optional fields above in Tool Specifications.

By defining our tool, we'll inform our model about what our tool does and have the model decide whether or not to use the tool. We should be as descriptive and specific as possible for our model to be able to make the correct tool use decisions.

In addition to our tools array, we will provide our messages array (e.g. containing system prompt, assistant prompt, and/or user prompt).
Step 3: Receive and Handle Tool Results

After executing our chat completion, we'll extract our model's response and check for tool calls.

If the model decides that no tools should be used and does not generate a tool or function call, then the response will be a normal chat completion (i.e. response_message = response.choices[0].message) with a direct model reply to the user query.

If the model decides that tools should be used and generates a tool or function call, we will:

    Define available tool or function,
    Add the model's response to the conversation by appending our message
    Process the tool call and add the tool response to our message
    Make a second Groq API call with the updated conversation
    Return the final response


// imports calculate function from step 1

async function runConversation(userPrompt) {

    const messages = [

        {

            role: "system",

            content: "You are a calculator assistant. Use the calculate function to perform mathematical operations and provide the results."

        },

        {

            role: "user",

            content: userPrompt,

        }

    ];


    const tools = [

        {

            type: "function",

            function: {

                name: "calculate",

                description: "Evaluate a mathematical expression",

                parameters: {

                    type: "object",

                    properties: {

                        expression: {

                            type: "string",

                            description: "The mathematical expression to evaluate",

                        }

                    },

                    required: ["expression"],

                },

            },

        }

    ];


    const response = await client.chat.completions.create({

        model: MODEL,

        messages: messages,

        stream: false,

        tools: tools,

        tool_choice: "auto",

        max_tokens: 4096

    });


    const responseMessage = response.choices[0].message;

    const toolCalls = responseMessage.tool_calls;


    if (toolCalls) {

        const availableFunctions = {

            "calculate": calculate,

        };


        messages.push(responseMessage);


        for (const toolCall of toolCalls) {

            const functionName = toolCall.function.name;

            const functionToCall = availableFunctions[functionName];

            const functionArgs = JSON.parse(toolCall.function.arguments);

            const functionResponse = functionToCall(functionArgs.expression);


            messages.push({

                tool_call_id: toolCall.id,

                role: "tool",

                name: functionName,

                content: functionResponse,

            });

        }


        const secondResponse = await client.chat.completions.create({

            model: MODEL,

            messages: messages

        });


        return secondResponse.choices[0].message.content;

    }


    return responseMessage.content;

}


const userPrompt = "What is 25 * 4 + 10?";

runConversation(userPrompt).then(console.log).catch(console.error);

Routing System

If you use our models fine-tuned for tool use, we recommended to use them as part of a routing system:

    Query Analysis: Implement a routing system that analyzes incoming user queries to determine their nature and requirements.
    Model Selection: Based on the query analysis, route the request to the most appropriate model:
        For queries involving function calling, API interactions, or structured data manipulation, use the Llama 3 Groq Tool Use models.
        For general knowledge, open-ended conversations, or tasks not specifically related to tool use, route to a general-purpose language model, such as Llama 3 70B.

The following is the calculate tool we built in the above steps enhanced to include a routing system that routes our request to Llama 3 70B if the user query does not require the tool:

import Groq from "groq-sdk";


const groq = new Groq();


// Define models

const ROUTING_MODEL = 'llama3-70b-8192';

const TOOL_USE_MODEL = 'llama3-groq-70b-8192-tool-use-preview';

const GENERAL_MODEL = 'llama3-70b-8192';


function calculate(expression) {

  // Simple calculator tool

  try {

    const result = eval(expression);

    return JSON.stringify({ result });

  } catch (error) {

    return JSON.stringify({ error: 'Invalid expression' });

  }

}


async function routeQuery(query) {

  const routingPrompt = `

    Given the following user query, determine if any tools are needed to answer it.

    If a calculation tool is needed, respond with 'TOOL: CALCULATE'.

    If no tools are needed, respond with 'NO TOOL'.


    User query: ${query}


    Response:

    `;


  const response = await groq.chat.completions.create({

    model: ROUTING_MODEL,

    messages: [

      {

        role: 'system',

        content:

          'You are a routing assistant. Determine if tools are needed based on the user query.',

      },

      { role: 'user', content: routingPrompt },

    ],

    max_tokens: 20,

  });


  const routingDecision = response.choices[0].message.content.trim();


  if (routingDecision.includes('TOOL: CALCULATE')) {

    return 'calculate tool needed';

  } else {

    return 'no tool needed';

  }

}


async function runWithTool(query) {

  const messages = [

    {

      role: 'system',

      content:

        'You are a calculator assistant. Use the calculate function to perform mathematical operations and provide the results.',

    },

    {

      role: 'user',

      content: query,

    },

  ];

  const tools = [

    {

      type: 'function',

      function: {

        name: 'calculate',

        description: 'Evaluate a mathematical expression',

        parameters: {

          type: 'object',

          properties: {

            expression: {

              type: 'string',

              description: 'The mathematical expression to evaluate',

            },

          },

          required: ['expression'],

        },

      },

    },

  ];

  const response = await groq.chat.completions.create({

    model: TOOL_USE_MODEL,

    messages: messages,

    tools: tools,

    tool_choice: 'auto',

    max_tokens: 4096,

  });

  const responseMessage = response.choices[0].message;

  const toolCalls = responseMessage.tool_calls;

  if (toolCalls) {

    messages.push(responseMessage);

    for (const toolCall of toolCalls) {

      const functionArgs = JSON.parse(toolCall.function.arguments);

      const functionResponse = calculate(functionArgs.expression);

      messages.push({

        tool_call_id: toolCall.id,

        role: 'tool',

        name: 'calculate',

        content: functionResponse,

      });

    }

    const secondResponse = await groq.chat.completions.create({

      model: TOOL_USE_MODEL,

      messages: messages,

    });

    return secondResponse.choices[0].message.content;

  }

  return responseMessage.content;

}


async function runGeneral(query) {

  const response = await groq.chat.completions.create({

    model: GENERAL_MODEL,

    messages: [

      { role: 'system', content: 'You are a helpful assistant.' },

      { role: 'user', content: query },

    ],

  });

  return response.choices[0].message.content;

}


export async function processQuery(query) {

  const route = await routeQuery(query);

  let response;

  if (route === 'calculate tool needed') {

    response = await runWithTool(query);

  } else {

    response = await runGeneral(query);

  }


  return {

    query: query,

    route: route,

    response: response,

  };

}


// Example usage

async function main() {

  const queries = [

    'What is the capital of the Netherlands?',

    'Calculate 25 * 4 + 10',

  ];


  for (const query of queries) {

    try {

      const result = await processQuery(query);

      console.log(`Query: ${result.query}`);

      console.log(`Route: ${result.route}`);

      console.log(`Response: ${result.response}\n`);

    } catch (error) {

      console.error(`Error processing query "${query}":`, error);

    }

  }

}


if (require.main === module) {

  main().catch(console.error).finally(() => {

    setTimeout(() => process.exit(), 0);

  });

}

Parallel Tool Use

We learned about tool use and built single-turn tool use examples above. Now let's take tool use a step further and imagine a workflow where multiple tools can be called simultaneously, enabling more efficient and effective responses.

This concept is known as parallel tool use and is key for building agentic workflows that can deal with complex queries, which is a great example of where inference speed becomes increasingly important (and thankfully we can access fast inference speed with Groq API).

Note: Parallel tool use is natively enabled for all Llama 3 and Llama 3.1 models!

Here's an example of parallel tool use with a tool for getting the temperature and the tool for getting the weather condition to show parallel tool use with Groq API in action:


import Groq from "groq-sdk";


// Initialize Groq client

const groq = new Groq();

const model = "llama3-groq-70b-8192-tool-use-preview";


// Define weather tools

function getTemperature(location) {

    // This is a mock tool/function. In a real scenario, you would call a weather API.

    const temperatures = {"New York": 22, "London": 18, "Tokyo": 26, "Sydney": 20};

    return temperatures[location] || "Temperature data not available";

}


function getWeatherCondition(location) {

    // This is a mock tool/function. In a real scenario, you would call a weather API.

    const conditions = {"New York": "Sunny", "London": "Rainy", "Tokyo": "Cloudy", "Sydney": "Clear"};

    return conditions[location] || "Weather condition data not available";

}


// Define system messages and tools

const messages = [

    {"role": "system", "content": "You are a helpful weather assistant."},

    {"role": "user", "content": "What's the weather like in New York and London?"},

];


const tools = [

    {

        "type": "function",

        "function": {

            "name": "getTemperature",

            "description": "Get the temperature for a given location",

            "parameters": {

                "type": "object",

                "properties": {

                    "location": {

                        "type": "string",

                        "description": "The name of the city",

                    }

                },

                "required": ["location"],

            },

        },

    },

    {

        "type": "function",

        "function": {

            "name": "getWeatherCondition",

            "description": "Get the weather condition for a given location",

            "parameters": {

                "type": "object",

                "properties": {

                    "location": {

                        "type": "string",

                        "description": "The name of the city",

                    }

                },

                "required": ["location"],

            },

        },

    }

];


// Function to get both temperature and weather condition

export function getWeatherInfo(location) {

    const temp = getTemperature(location);

    const condition = getWeatherCondition(location);

    return `${location}: Temperature: ${temp}°C, Condition: ${condition}`;

}


// Make the initial request

export async function runWeatherAssistant() {

    try {

        const response = await groq.chat.completions.create({

            model: model,

            messages: messages,

            tools: tools,

            tool_choice: "auto",

            max_tokens: 4096

        });


        const responseMessage = response.choices[0].message;

        console.log("Response message:", JSON.stringify(responseMessage, null, 2));


        const toolCalls = responseMessage.tool_calls || [];


        // Process tool calls

        messages.push(responseMessage);


        const availableFunctions = {

            getWeatherInfo: getWeatherInfo,

        };


        for (const toolCall of toolCalls) {

            const functionName = toolCall.function.name;

            const functionToCall = availableFunctions[functionName];

            const functionArgs = JSON.parse(toolCall.function.arguments);

            const functionResponse = functionToCall(functionArgs.location);


            messages.push({

                "role": "tool",

                "content": functionResponse,

                "tool_call_id": toolCall.id,

            });

        }


        // Make the final request with tool call results

        const finalResponse = await groq.chat.completions.create({

            model: model,

            messages: messages,

            tools: tools,

            tool_choice: "auto",

            max_tokens: 4096

        });


        console.log(finalResponse.choices[0].message.content);

        return finalResponse.choices[0].message.content;

    } catch (error) {

        console.error("An error occurred:", error);

        throw error; // Re-throw the error so it can be caught by the caller

    }

}


if (require.main === module) {

    runWeatherAssistant()

        .then(result => {

            console.log("Final result:", result);

            process.exit(0);

        })

        .catch(error => {

            console.error("Error in main execution:", error);

            process.exit(1);

        });

}


Error Handling

Groq API tool use is designed to verify whether a model generates a valid tool call object. When a model fails to generate a valid tool call object, Groq API will return a 400 error with an explanation in the "failed_generation" field of the JSON body that is returned.
Next Steps

For more information and examples of working with multiple tools in parallel using Groq API and Instructor, see our Groq API Cookbook tutorial here.
Tool Use with Structured Outputs (Python)

Groq API offers best-effort matching for parameters, which means the model could occasionally miss parameters or misinterpret types for more complex tool calls. We recommend the Instuctor library to simplify the process of working with structured data and to ensure that the model's output adheres to a predefined schema.

Here's an example of how to implement tool use using the Instructor library with Groq API:

pip install instructor pydantic


import instructor

from pydantic import BaseModel, Field

from groq import Groq


# Define the tool schema

tool_schema = {

    "name": "get_weather_info",

    "description": "Get the weather information for any location.",

    "parameters": {

        "type": "object",

        "properties": {

            "location": {

                "type": "string",

                "description": "The location for which we want to get the weather information (e.g., New York)"

            }

        },

        "required": ["location"]

    }

}


# Define the Pydantic model for the tool call

class ToolCall(BaseModel):

    input_text: str = Field(description="The user's input text")

    tool_name: str = Field(description="The name of the tool to call")

    tool_parameters: str = Field(description="JSON string of tool parameters")


class ResponseModel(BaseModel):

    tool_calls: list[ToolCall]


# Patch Groq() with instructor

client = instructor.from_groq(Groq(), mode=instructor.Mode.JSON)


def run_conversation(user_prompt):

    # Prepare the messages

    messages = [

        {

            "role": "system",

            "content": f"You are an assistant that can use tools. You have access to the following tool: {tool_schema}"

        },

        {

            "role": "user",

            "content": user_prompt,

        }

    ]


    # Make the Groq API call

    response = client.chat.completions.create(

        model="llama-3.1-70b-versatile",

        response_model=ResponseModel,

        messages=messages,

        temperature=0.7,

        max_tokens=1000,

    )


    return response.tool_calls


# Example usage

user_prompt = "What's the weather like in San Francisco?"

tool_calls = run_conversation(user_prompt)


for call in tool_calls:

    print(f"Input: {call.input_text}")

    print(f"Tool: {call.tool_name}")

    print(f"Parameters: {call.tool_parameters}")

    print()

Benefits of Using Structured Outputs

    Type Safety: Pydantic models ensure that output adheres to the expected structure, reducing the risk of errors.
    Automatic Validation: Instructor automatically validates the model's output against the defined schema.

Next Steps

For more information and examples of working with structured outputs using Groq API and Instructor, see our Groq API Cookbook tutorial here.
Best Practices

    Provide detailed tool descriptions for optimal performance.
    We recommend tool use with the Instructor library for structured outputs.
    Use the fine-tuned Llama 3 models by Groq or the Llama 3.1 models for your applications that require tool use.
    Implement a routing system when using fine-tuned models in your workflow.
    Handle tool execution errors by returning error messages with "is_error": true.
