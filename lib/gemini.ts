import { GoogleGenAI } from "@google/genai";

import type { Car } from "@/types/car";
import type { ChatMessage } from "@/types/chat";
import type { MatchRequest } from "@/types/match";

let client: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  if (!client) {
    client = new GoogleGenAI({ apiKey });
  }

  return client;
}

export async function generateMatchSummary(
  preferences: MatchRequest,
  cars: Car[],
): Promise<string> {
  const ai = getGeminiClient();

  const prompt = `You are an expert Indian automotive advisor helping a buyer choose a car.

User preferences:
${JSON.stringify(preferences, null, 2)}

Shortlisted cars (top ${cars.length}):
${JSON.stringify(cars, null, 2)}

Write exactly 3 sentences explaining why these shortlisted cars are the best fit for this buyer's budget, body type, and priority (${preferences.priority}). Mention specific strengths of each car. Be concise, helpful, and use Indian market context (lakhs, NCAP safety, mileage). Do not use bullet points or numbered lists.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const summary = response.text?.trim();

  if (!summary) {
    throw new Error("Gemini returned an empty summary");
  }

  return summary;
}

export async function generateChatReply(args: {
  message: string;
  history: ChatMessage[];
  cars: Car[];
}): Promise<string> {
  const ai = getGeminiClient();

  const safeHistory = args.history.slice(-12).map((m) => ({
    role: m.role,
    content: String(m.content ?? "").slice(0, 2000),
  }));

  const prompt = `You are an expert Indian car advisor.\n\nContext: The user already has 3 shortlisted cars. Your job is to help them compare, understand trade-offs, and pick the best fit.\n\nShortlisted cars (JSON):\n${JSON.stringify(args.cars, null, 2)}\n\nConversation so far (most recent last):\n${JSON.stringify(safeHistory, null, 2)}\n\nUser message:\n${args.message}\n\nReply as a helpful assistant in 4-7 short sentences. Be specific: mention the car names and facts from the JSON (safety rating, mileage, seating, fuel type). If the user asks something not in the data, say what you'd need to know or suggest a quick heuristic. Avoid bullet points unless the user asks for a list.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  const reply = response.text?.trim();
  if (!reply) throw new Error("Gemini returned an empty reply");
  return reply;
}
