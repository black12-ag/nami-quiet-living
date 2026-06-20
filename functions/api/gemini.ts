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

    const { history, message } = await request.json();

    const ai = new GoogleGenAI({ apiKey: key });

    const formattedHistory = Array.isArray(history) 
      ? history.map((h: any) => ({
          role: h.role === 'assistant' ? 'model' : h.role,
          parts: [{ text: h.text || h.parts?.[0]?.text || '' }]
        }))
      : [];

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

You MUST respond in JSON matching the exact schema below. Keep your verbal voice warm, reassuring, and highly elegant.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        text: {
          type: Type.STRING,
          description: "Conversational response for the customer. Warm, high-end tone. Use formatting to make it beautiful."
        },
        actions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: {
                type: Type.STRING,
                description: "The action to execute: 'ADD_TO_CART', 'GO_TO_CHECKOUT', 'VIEW_PRODUCT', 'VIEW_ORDERS', 'APPLY_PROMO', 'NONE'."
              },
              payload: {
                type: Type.OBJECT,
                properties: {
                  productId: {
                    type: Type.STRING,
                    description: "The product ID (MUST be one of: 'p1', 'p2', 'p3', 'p4', 'p5', 'p6'). Required for ADD_TO_CART or VIEW_PRODUCT."
                  },
                  prefill: {
                    type: Type.OBJECT,
                    properties: {
                      email: { type: Type.STRING, description: "Extracted customer email coordinate if given." },
                      firstName: { type: Type.STRING, description: "Extracted customer first name if given." },
                      lastName: { type: Type.STRING, description: "Extracted customer last name if given." },
                      address: { type: Type.STRING, description: "Extracted customer relative address if given." },
                      city: { type: Type.STRING, description: "Extracted delivery city if given." },
                      postalCode: { type: Type.STRING, description: "Extracted postal zip code if given." }
                    }
                  },
                  promoCode: {
                    type: Type.STRING,
                    description: "Extracted active coupon code (must be one of: 'NAMI10', 'SERENE20', 'SPRING50')."
                  }
                }
              }
            },
            required: ["type"]
          }
        }
      },
      required: ["text", "actions"]
    };

    const chat = ai.chats.create({
      model: 'gemini-3.5-flash',
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: schema
      },
      history: formattedHistory
    });

    const result = await chat.sendMessage({ message: message });
    return new Response(result.text || "{}", {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    console.error("Function child chat error:", error);
    return new Response(JSON.stringify({ error: error.message || "An error occurred with the AI service." }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
