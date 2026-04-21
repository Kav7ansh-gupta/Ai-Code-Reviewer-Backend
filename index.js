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
You are an expert senior software engineer and security auditor.
Analyze the following ${language} code and provide a detailed review in Markdown format.

Use the following structure:
### 🐞 Bugs & Issues
(List any logical errors, security vulnerabilities, or syntax issues)

### ⏱️ Complexity Analysis
- **Time Complexity**: 
- **Space Complexity**: 

### 🚀 Performance & Readability Improvements
(Suggestions to optimize the code or make it cleaner)

### 💻 Refactored Code
(Provide the complete optimized and fixed version of the code)

Code:
\`\`\`${language}
${code}
\`\`\`
`;

    const response = await nvidiaClient.post("/chat/completions", {
      model: "meta/llama-3.1-70b-instruct",
      messages: [
        { 
          role: "system", 
          content: "You are a professional code reviewer. Your goal is to provide concise, actionable, and high-quality feedback. Always use the requested Markdown structure." 
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.2, // Lower temperature for more consistent analysis
      max_tokens: 1000, // Increased for refactored code
    });

    const reply = response.data.choices[0].message.content;

    res.json({ result: reply });
  } catch (error) {
    const errorDetails = error.response?.data || error.message;
    console.error("NVIDIA ERROR:", errorDetails);
    res.status(error.response?.status || 500).json({
      error: "AI Analysis failed",
      details: process.env.NODE_ENV === 'development' ? errorDetails : undefined
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});