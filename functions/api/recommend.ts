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
    const key = env.GROQ_API_KEY || env.GEMINI_API_KEY;
    if (!key) {
      return new Response(JSON.stringify({ error: "GROQ_API_KEY / GEMINI_API_KEY environment variable is not set." }), {
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
      return new Response(JSON.stringify({ error: `Groq API returned ${response.status}: ${errorText}` }), {
        status: response.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    const data: any = await response.json();
    const responseText = data.choices[0].message.content;

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
