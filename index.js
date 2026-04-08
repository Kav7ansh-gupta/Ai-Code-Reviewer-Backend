import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

// NVIDIA NIM client
const nvidiaClient = axios.create({
  baseURL: "https://integrate.api.nvidia.com/v1",
  headers: {
    Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
    "Content-Type": "application/json",
  },
});

// API route
app.post("/analyze", async (req, res) => {
  try {
    const { code, language } = req.body;

    // Safety check
    if (!code || !language) {
      return res.status(400).json({
        error: "code and language are required",
      });
    }

    const prompt = `
You are a senior software engineer.

Analyze the following ${language} code and provide:

1. Bugs
2. Time Complexity
3. Improvements
4. Refactored Code

Code:
${code}
`;

    const response = await nvidiaClient.post("/chat/completions", {
      model: "meta/llama3-70b-instruct", // change if needed
      messages: [
        { role: "system", content: "You are a helpful coding assistant." },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 500,
    });

    const reply = response.data.choices[0].message.content;

    res.json({ result: reply });
  } catch (error) {
    console.error("NVIDIA ERROR:", error.response?.data || error.message);
    res.status(500).json({
      error: "NVIDIA API error",
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});