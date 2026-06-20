/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/


import { PRODUCTS } from '../constants';

const getSystemInstruction = () => {
  const productContext = PRODUCTS.map(p => 
    `- ${p.name} ($${p.price}): ${p.description}. Features: ${p.features.join(', ')}`
  ).join('\n');

  return `You are the AI Concierge for "Nami", a warm, organic lifestyle tech brand. 
  Your tone is calm, inviting, grounded, and sophisticated. Avoid overly "techy" jargon; prefer words like "natural", "seamless", "warm", and "texture".
  
  Here is our current product catalog:
  ${productContext}
  
  Answer customer questions about specifications, recommendations, and brand philosophy.
  Keep answers concise (under 3 sentences usually) to fit the chat UI. 
  If asked about products not in the list, gently steer them back to Nami products.`;
};

export interface ChatAction {
  type: 'ADD_TO_CART' | 'GO_TO_CHECKOUT' | 'VIEW_PRODUCT' | 'VIEW_ORDERS' | 'APPLY_PROMO' | 'NONE';
  payload?: {
    productId?: string;
    prefill?: {
      email?: string;
      firstName?: string;
      lastName?: string;
      address?: string;
      city?: string;
      postalCode?: string;
    };
    promoCode?: string;
  };
}

export interface ChatResponse {
  text: string;
  actions: ChatAction[];
}

export const sendMessageToGemini = async (history: {role: string, text: string}[], newMessage: string): Promise<ChatResponse> => {
  try {
    const response = await fetch("/api/gemini", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        history,
        message: newMessage,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with status ${response.status}`);
    }

    const data = await response.json();
    return {
      text: data.text || "I was unable to formulate a response.",
      actions: data.actions || []
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      text: "I apologize, but I seem to be having trouble reaching our archives at the moment.",
      actions: []
    };
  }
};

export interface AIRecommendation {
  productId: string;
  reason: string;
}

export interface AIRecommendationResponse {
  recommendations: AIRecommendation[];
  conciergeFeedback: string;
}

export const getAIRecommendations = async (userQuery: string): Promise<AIRecommendationResponse> => {
  try {
    const response = await fetch("/api/recommend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userQuery }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server responded with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("AI recommendation error:", error);
    throw error;
  }
};