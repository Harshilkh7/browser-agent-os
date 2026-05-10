const express = require("express");
const cors = require("cors");
require("dotenv").config();

const OpenAI = require("openai");

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

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;

    const completion =
      await openai.chat.completions.create({
        model: "openrouter/free",

        messages: [
          {
            role: "system",
            content:
              "You are an autonomous browser agent assistant.",
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