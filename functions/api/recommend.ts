import { GoogleGenAI, Type } from "@google/genai";

const PRODUCTS_METADATA = [
  { id: 'p1', name: 'Nami Harmony', price: 429, tagline: 'Listen naturally.', description: 'Audio that feels like the open air. Constructed with warm acoustic fabric and recycled sandstone composite.', features: ['Organic Noise Cancellation', '50h Battery', 'Natural Soundstage'] },
  { id: 'p2', name: 'Nami Epoch', price: 349, tagline: 'Moments, not minutes.', description: 'A timepiece designed for wellness. Ceramic casing with a strap made from sustainable vegan leather.', features: ['Stress Monitoring', 'E-Ink Hybrid Display', '7-Day Battery'] },
  { id: 'p3', name: 'Nami Canvas', price: 1099, tagline: 'Capture the warmth.', description: 'A display that mimics the properties of paper. Soft on the eyes, vivid in color, and textured to the touch.', features: ['Paper-like OLED', 'Portrait Lens', 'Sandstone Texture'] },
  { id: 'p4', name: 'Nami Essence', price: 599, tagline: 'Return to nature.', description: 'An air purifier that doubles as a sculpture. Whisper quiet, diffusing subtle natural scents while cleaning your space.', features: ['Bio-HEPA Filter', 'Aromatherapy', 'Silent Night Mode'] },
  { id: 'p5', name: 'Nami Beam', price: 249, tagline: 'Light that breathes.', description: 'Smart circadian lighting that follows the sun. Casts a warm, candle-like glow in the evenings.', features: ['Circadian Rhythm Sync', 'Warm Dimming', 'Touchless Control'] },
  { id: 'p6', name: 'Nami Scribe', price: 129, tagline: 'Thought in motion.', description: 'A digital stylus with the friction of graphite. Charges wirelessly when magnetically attached to Nami Canvas.', features: ['Zero Latency', 'Textured Tip', 'Wireless Charging'] }
];

export async function onRequestPost(context: any) {
  try {
    const { env, request } = context;
    const key = env.GEMINI_API_KEY;
    if (!key) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY environment variable is not set." }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const { userQuery } = await request.json();
    if (!userQuery || typeof userQuery !== "string") {
      return new Response(JSON.stringify({ error: "userQuery is required and must be a string." }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const ai = new GoogleGenAI({ apiKey: key });

    const productContext = PRODUCTS_METADATA.map(p => 
      `- ID: ${p.id} | Name: ${p.name} ($${p.price}): ${p.description}. Features: ${p.features.join(', ')}`
    ).join('\n');

    const systemPrompt = `You are the Nami Lifestyle Concierge, a highly sophisticated, calm, and grounded product guide.
Your goal is to recommend custom-tailored objects from our premium collection based on the customer's mood, intent, or desired state of mind (e.g., 'focus', 'relax', 'calm', 'nature', 'unplug').

Here is our current product catalog:
${productContext}

Select between 1 to 3 products that align beautifully with their intent.
Provide a short, elegant, custom reason for why each selected product is perfect for them (1-2 lines), keeping Nami's peaceful and sophisticated brand voice. Raise recommendations based on features.
Return the result structured in JSON matching the exact schema specified. Keep the conversational intro and outro warm and reassuring in "conciergeFeedback".`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Customer desires: "${userQuery}"`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  productId: {
                    type: Type.STRING,
                    description: "The product ID matching the recommendation (MUST be one of: 'p1', 'p2', 'p3', 'p4', 'p5', 'p6').",
                  },
                  reason: {
                    type: Type.STRING,
                    description: "Tailored explanation of why this matches their specific query in 1-2 sophisticated sentences.",
                  }
                },
                required: ["productId", "reason"]
              }
            },
            conciergeFeedback: {
              type: Type.STRING,
              description: "A refined greeting or context synthesis reflecting on how these recommendations align with their intent and Nami's philosophy.",
            }
          },
          required: ["recommendations", "conciergeFeedback"]
        }
      }
    });

    const responseText = response.text || "{}";
    return new Response(responseText, {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    console.error("recommend endpoint error:", error);
    return new Response(JSON.stringify({ error: error.message || "An error occurred with the recommendation concierge." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
