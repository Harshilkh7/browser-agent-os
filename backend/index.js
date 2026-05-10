const express = require("express");
const cors = require("cors");
require("dotenv").config();

const OpenAI = require("openai");
const calculator = require("./tools/calculator");
const getTime = require("./tools/time");
const randomNumber = require("./tools/random");

const app = express();

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

app.get("/", (req, res) => {
  res.json({
    message: "Browser Agent OS Backend Running",
  });
});

const tools = {
  calculator,
  time: getTime,
  random: randomNumber,
};

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const completion =
  await openai.chat.completions.create({
    model: "openrouter/free",
    messages: [
      {
        role: "system",
        content: `
You are an AI agent.

You have access to these tools:

1. calculator
- Use for mathematical calculations

2. time
- Use for current date and time

3. random
- Use to generate random numbers

IMPORTANT:

If a tool is needed,
respond ONLY with valid raw JSON.

DO NOT:
- explain
- add markdown
- add XML
- add comments
- add extra text

Examples:

{
  "tool": "calculator",
  "input": "45 * 78"
}

{
  "tool": "time"
}

{
  "tool": "random"
}

If no tool is needed,
respond normally.
`,
      },
      {
        role: "user",
        content: message,
      },
    ],

    max_tokens: 300,
  });

    const aiResponse =
      completion.choices[0].message.content;

    let parsedResponse;

try {
    console.log(aiResponse);
  parsedResponse = JSON.parse(aiResponse);

if (parsedResponse.tool) {
  const toolName = parsedResponse.tool;

  const tool = tools[toolName];

  if (tool) {
    const result = parsedResponse.input
      ? tool(parsedResponse.input)
      : tool();

    const secondCompletion =
      await openai.chat.completions.create({
        model: "openrouter/free",

        messages: [
          {
            role: "system",
            content:
              "You are an AI agent.",
          },

          {
            role: "user",
            content: message,
          },

          {
            role: "assistant",
            content: aiResponse,
          },

          {
            role: "user",
            content: `Tool result: ${result}.
Now provide a final response to the user.`,
          },
        ],

        max_tokens: 300,
      });

    const finalResponse =
      secondCompletion.choices[0]
        .message.content;

    return res.json({
      response: finalResponse,
    });
  }
}

} catch (error) {
    // Not a JSON response, proceed as normal
}

    res.json({
      response: aiResponse,
    });
  } catch (error) {
    console.error(
      error.response?.data ||
        error.message ||
        error
    );

    res.status(500).json({
      error: "Something went wrong",
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});