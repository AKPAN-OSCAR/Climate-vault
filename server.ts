import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent set to 'aistudio-build'
const apiKey = process.env.GEMINI_API_KEY || "AIzaSyDemo_ReplaceWithRealKey";
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API endpoint for AI Advisor
app.post("/api/advisor", async (req, res) => {
  try {
    const { message, history, user, climate, vault, alerts } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const systemContext = `You are ClimaVault's AI Advisor — a climate-smart financial advisor for rural Nigerian farmers. Warm, practical, direct tone. Responses under 150 words. Always end with ONE specific actionable financial recommendation tied to OPay wallet actions.
User Profile:
- Name: ${user?.name || "Emeka Okonkwo"}
- Location: ${user?.location || "Akwa Ibom"}
- Farm Type: ${user?.farmType || "Cassava & Yam"}
- Farm Size: ${user?.farmSize || "2 acres"}
- Language: ${user?.language || "English"}

Risk Profile:
- Risk Level: ${climate?.riskLevel || "High Risk"}
- Risk Score: ${climate?.riskScore || 88}/100

Financial Vault:
- Total Saved: ₦${(vault?.totalSaved || 75000).toLocaleString()}
- Active Goals Count: ${vault?.goals?.length || 5}
- Complete Goals Count: ${vault?.goals?.filter((g: any) => g.complete)?.length || 2}

Active Climate Alerts:
- ${alerts && alerts.length > 0 ? alerts.map((a: any) => `${a.title} (${a.severity})`).join(", ") : "No active critical alerts"}

Always respond in the context of rural Nigeria and OPay. Focus on helping them navigate climate risk using their savings and secure insurance via OPay. Always respond entirely in the user's selected language: ${user?.language || "English"}.`;

    // Map the conversation history format to generateContent structure
    const chatContents = [];
    
    // Add past history if available
    if (history && history.length > 0) {
      for (const h of history) {
        chatContents.push({
          role: h.role === "assistant" || h.role === "model" ? "model" : "user",
          parts: [{ text: h.content || h.text || "" }]
        });
      }
    }
    
    // Append user's current message
    chatContents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: chatContents,
      config: {
        systemInstruction: systemContext,
        temperature: 0.7,
      }
    });

    const text = response.text || "I was unable to formulate advice at the moment. Please secure your farms and check back soon.";
    res.json({ text });
  } catch (error: any) {
    console.error("Gemini API Error in /api/advisor:", error);
    res.status(500).json({ 
      error: "Failed to fetch response from advisor", 
      details: error?.message || error
    });
  }
});

// Vite server integrations
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

initServer();
