import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: "*",
  }),
);
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post("/analyze", async (req, res) => {
  const { code, language } = req.body;

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ result: text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gemini API error" });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(5000, () => {
  onsole.log(`Server running on port ${PORT}`);
});
