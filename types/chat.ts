import type { Car } from "@/types/car";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
  at?: number;
}

export interface ChatRequest {
  message: string;
  history: ChatMessage[];
  cars: Car[];
}

export interface ChatResponse {
  reply: string;
}

