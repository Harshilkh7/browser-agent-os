const express = require("express");
const cors = require("cors");
require("dotenv").config();

const OpenAI = require("openai");
const calculator = require("./tools/calculator");
const getTime = require("./tools/time");
const randomNumber = require("./tools/random");
const openBrowser = require("./tools/browser");

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
  browser: openBrowser,
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
You are an AI planning agent.

Available tools:

1. calculator
Use ONLY for mathematical calculations.
Examples:
- 45 * 78
- 100 / 5

2. time
Use ONLY when user explicitly asks for:
- current time
- date
- current date/time

Examples:
- What time is it?
- Tell me today's date

3. random
Use ONLY when user asks for random values.
Examples:
- Give me a random number

4. browser
Use for:
- opening websites
- extracting webpage content
- searching the web
- interacting with browser pages

Examples:
- Open https://google.com
- Summarize https://wikipedia.org

IMPORTANT:
Respond ONLY with valid JSON when choosing a tool.

Examples:
{"tool":"calculator","input":"45 * 78"}
{"tool":"time"}
{"tool":"random"}
{"tool":"browser","input":"https://google.com"}
{"tool":"browser","input":"best gaming laptop under 80000"}

Otherwise respond normally.
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
      ? await tool(parsedResponse.input)
      : await tool();

    const secondCompletion =
  await openai.chat.completions.create({
    model: "openrouter/free",

    messages: [
      {
        role: "system",
        content: `
You are an AI agent.

IMPORTANT:
You MUST use the provided tool observation.

DO NOT rely on prior knowledge.
DO NOT say you couldn't access the page.
DO NOT invent information.

Your response must be based ONLY on the observation.
`,
      },

      {
        role: "user",
        content: `
Original user request:
${message}

Tool observation:
${result}

Use ONLY this observation to answer.
`,
      },
    ],

    max_tokens: 400,
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