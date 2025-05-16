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
    console.log(`${process.env.API_KEY}`);
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.SITE_URL || "https://your-app.vercel.app",
          "X-Title": process.env.SITE_NAME || "Dumpr",
        },
        body: JSON.stringify(req.body),
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
