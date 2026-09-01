require("dotenv").config();

const express = require("express");
const path = require("path");
const OpenAI = require("openai");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

if (!process.env.GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY missing in .env");
    process.exit(1);
}

const gemini = new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
});

app.post("/api/chat", async (req, res) => {
    try {
        const { messages } = req.body;
        messages.unshift({
    role: "system",
    content: `You are a friendly AI assistant.

Reply in the same language and style as the user.

If the user speaks Hinglish, reply naturally in Hinglish.
Use Hindi words written in English/Roman letters mixed with English.
Keep replies simple, friendly and conversational.

Do not automatically change Hinglish into pure English or pure Hindi.

Example:
User: Bhai mujhe ye samjha do
Assistant: Haan bhai, simple way mein samjhata hoon...`
});

        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                error: "Invalid messages array"
            });
        }

        const completion = await gemini.chat.completions.create({
            model: "gemini-3.5-flash-lite",
            messages: messages
        });

        const reply = completion.choices[0]?.message?.content || "No response received.";

        res.json({ reply });

    } catch (error) {
        console.error("❌ Gemini API error:", error);

        res.status(500).json({
            error: "Gemini API request failed. Please try again."
        });
    }
});

app.listen(PORT, () => {
    console.log(`✅ Server running at http://localhost:${PORT}`);
    console.log("🤖 Gemini AI chat API is ready.");
});
