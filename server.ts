import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const PRODUCTS_METADATA = [
  { id: 'p1', name: 'Nami Harmony', price: 429, tagline: 'Listen naturally.', description: 'Audio that feels like the open air. Constructed with warm acoustic fabric and recycled sandstone composite.', features: ['Organic Noise Cancellation', '50h Battery', 'Natural Soundstage'] },
  { id: 'p2', name: 'Nami Epoch', price: 349, tagline: 'Moments, not minutes.', description: 'A timepiece designed for wellness. Ceramic casing with a strap made from sustainable vegan leather.', features: ['Stress Monitoring', 'E-Ink Hybrid Display', '7-Day Battery'] },
  { id: 'p3', name: 'Nami Canvas', price: 1099, tagline: 'Capture the warmth.', description: 'A display that mimics the properties of paper. Soft on the eyes, vivid in color, and textured to the touch.', features: ['Paper-like OLED', 'Portrait Lens', 'Sandstone Texture'] },
  { id: 'p4', name: 'Nami Essence', price: 599, tagline: 'Return to nature.', description: 'An air purifier that doubles as a sculpture. Whisper quiet, diffusing subtle natural scents while cleaning your space.', features: ['Bio-HEPA Filter', 'Aromatherapy', 'Silent Night Mode'] },
  { id: 'p5', name: 'Nami Beam', price: 249, tagline: 'Light that breathes.', description: 'Smart circadian lighting that follows the sun. Casts a warm, candle-like glow in the evenings.', features: ['Circadian Rhythm Sync', 'Warm Dimming', 'Touchless Control'] },
  { id: 'p6', name: 'Nami Scribe', price: 129, tagline: 'Thought in motion.', description: 'A digital stylus with the friction of graphite. Charges wirelessly when magnetically attached to Nami Canvas.', features: ['Zero Latency', 'Textured Tip', 'Wireless Charging'] }
];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API endpoint for Gemini chat concierge
  app.post("/api/gemini", async (req: any, res: any) => {
    try {
      const { history, message } = req.body;
      const key = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
      if (!key) {
        return res.status(500).json({ error: "GROQ_API_KEY / GEMINI_API_KEY environment variable is not set." });
      }

      const productDescriptions = PRODUCTS_METADATA.map(p => 
        `- ID: ${p.id} | Name: ${p.name} ($${p.price}): ${p.description}. Features: ${p.features.join(', ')}`
      ).join('\n');

      const systemPrompt = `You are the Nami Luxe Concierge, an interactive, sophisticated, and deeply helpful voice & order assistant.
You have native capabilities to assist users with their physical spaces, wellness coordinates, and to guide them through ordering directly via chat.

Catalog Details:
${productDescriptions}

Valid Promo Codes:
- 'NAMI10': 10% off
- 'SERENE20': 20% off
- 'SPRING50': $50 flat discount

Your unique abilities:
1. Explain any product feature, pricing, and suitability.
2. Autonomously choose & recommend products based on user mood, intent, or desired state (e.g. focus, sleep, air purity).
3. ADD products directly to the user's shopping cart on their command (e.g., "add Harmony to my cart", "I want to buy the watch", "choose Nami Epoch for me and add it").
4. TAKE the user to the order page ("checkout palace") when they say they want to order, checkout, or pay (e.g., "checkout", "take me to checkout", "I want to buy these now").
5. EXTRACT checkout contact and shipping details from user messages. If the user mentions their name, email, or shipping address, collect them.
6. PASS these prefill coordinates when navigating to checkout so the order page starts pre-populated!
7. ASK them for any missing billing/shipping credentials gracefully (e.g., "What name and email should we address this to?") if they say they want to buy but haven't provided details. You can also directly trigger the checkout screen with the prefilled fields.
8. VIEW order history or VIEW a specific product detailed card.

You MUST respond in a valid JSON object matching the exact schema below. Keep your verbal voice warm, reassuring, and highly elegant.

JSON Response Schema:
{
  "text": "Your warm, elegant, high-end conversational response. (markdown supported)",
  "actions": [
    {
      "type": "ADD_TO_CART" | "GO_TO_CHECKOUT" | "VIEW_PRODUCT" | "VIEW_ORDERS" | "APPLY_PROMO" | "NONE",
      "payload": {
        "productId": "p1" | "p2" | "p3" | "p4" | "p5" | "p6",
        "prefill": {
          "email": "string (optional)",
          "firstName": "string (optional)",
          "lastName": "string (optional)",
          "address": "string (optional)",
          "city": "string (optional)",
          "postalCode": "string (optional)"
        },
        "promoCode": "NAMI10" | "SERENE20" | "SPRING50"
      }
    }
  ]
}`;

      const messages: any[] = [];
      messages.push({ role: "system", content: systemPrompt });

      if (Array.isArray(history)) {
        for (const h of history) {
          messages.push({
            role: h.role === "model" || h.role === "assistant" ? "assistant" : "user",
            content: h.text || h.parts?.[0]?.text || ""
          });
        }
      }

      messages.push({ role: "user", content: message });

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: messages,
          response_format: { type: "json_object" },
          temperature: 0.2
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ error: `Groq API returned ${response.status}: ${errorText}` });
      }

      const data: any = await response.json();
      const responseText = data.choices[0].message.content;
      res.json(JSON.parse(responseText));
    } catch (error: any) {
      console.error("Server child chat error:", error);
      res.status(500).json({ error: error.message || "An error occurred with the AI service." });
    }
  });

  // Specialized structured recommendation endpoint for "Quick Shop"
  app.post("/api/recommend", async (req: any, res: any) => {
    try {
      const { userQuery } = req.body;
      if (!userQuery || typeof userQuery !== "string") {
        return res.status(400).json({ error: "userQuery is required and must be a string." });
      }

      const key = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
      if (!key) {
        return res.status(500).json({ error: "GROQ_API_KEY / GEMINI_API_KEY environment variable is not set." });
      }

      const productContext = PRODUCTS_METADATA.map(p => 
        `- ID: ${p.id} | Name: ${p.name} ($${p.price}): ${p.description}. Features: ${p.features.join(', ')}`
      ).join('\n');

      const systemPrompt = `You are the Nami Lifestyle Concierge, a highly sophisticated, calm, and grounded product guide.
Your goal is to recommend custom-tailored objects from our premium collection based on the customer's mood, intent, or desired state of mind (e.g., 'focus', 'relax', 'calm', 'nature', 'unplug').

Here is our current product catalog:
${productContext}

Select between 1 to 3 products that align beautifully with their intent.
Provide a short, elegant, custom reason for why each selected product is perfect for them (1-2 lines), keeping Nami's peaceful and sophisticated brand voice. Raise recommendations based on features.

You MUST respond in a valid JSON object matching the exact schema below.

JSON Response Schema:
{
  "recommendations": [
    {
      "productId": "p1" | "p2" | "p3" | "p4" | "p5" | "p6",
      "reason": "Tailored explanation of why this matches their specific query in 1-2 sophisticated sentences."
    }
  ],
  "conciergeFeedback": "A refined greeting or context synthesis reflecting on how these recommendations align with their intent and Nami's philosophy."
}`;

      const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Customer desires: "${userQuery}"` }
      ];

      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: messages,
          response_format: { type: "json_object" },
          temperature: 0.2
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(response.status).json({ error: `Groq API returned ${response.status}: ${errorText}` });
      }

      const data: any = await response.json();
      const responseText = data.choices[0].message.content;
      res.json(JSON.parse(responseText));
    } catch (error: any) {
      console.error("recommend endpoint error:", error);
      res.status(500).json({ error: error.message || "An error occurred with the recommendation concierge." });
    }
  });

  // Health check
  app.get("/api/health", (req: any, res: any) => {
    res.json({ status: "ok" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: any, res: any) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
