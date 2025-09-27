require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors({ origin: process.env.SITE_URL || "*" }));
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Proxy endpoint
app.post("/api/proxy", async (req, res) => {
  try {
    const fetch = (await import("node-fetch")).default;

    if (!process.env.API_KEY) {
      console.error("API_KEY is missing");
      return res.status(500).json({ error: "Server misconfiguration: API_KEY not set" });
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.SITE_URL || "https://your-app.vercel.app",
        "X-Title": process.env.SITE_NAME || "Dumpr",
      },
      body: JSON.stringify({
  ...req.body,
  max_tokens: 1000,   // 👈 safe limit
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenRouter error:", data);
      return res.status(response.status).json({ error: data });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Proxy error:", error);
    return res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
