import { NextResponse } from "next/server";

import { generateChatReply } from "@/lib/gemini";
import type { ChatMessage, ChatRequest, ChatResponse } from "@/types/chat";
import type { Car } from "@/types/car";

function clientError(message: string, details?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...details }, { status: 400 });
}

function getUpstreamStatus(error: unknown): number | null {
  if (!error || typeof error !== "object") return null;
  const e = error as Record<string, unknown>;
  const status = e.status;
  if (typeof status === "number") return status;
  return null;
}

function serverError(error: unknown) {
  console.error("[POST /api/chat]", error);
  const upstream = getUpstreamStatus(error);
  if (upstream === 503) {
    return NextResponse.json(
      { error: "AI is temporarily unavailable. Please try again in a moment." },
      { status: 503 },
    );
  }
  if (upstream === 429) {
    return NextResponse.json(
      { error: "AI rate limit reached. Please wait a bit and retry." },
      { status: 429 },
    );
  }
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

function isChatMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    (v.role === "user" || v.role === "assistant") &&
    typeof v.content === "string" &&
    v.content.trim().length > 0
  );
}

function isCar(value: unknown): value is Car {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === "string" && typeof v.name === "string" && typeof v.brand === "string";
}

function isChatRequest(value: unknown): value is ChatRequest {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;

  if (typeof v.message !== "string" || v.message.trim().length === 0) return false;
  if (!Array.isArray(v.history) || !v.history.every(isChatMessage)) return false;
  if (!Array.isArray(v.cars) || v.cars.length === 0 || !v.cars.every(isCar)) return false;

  return true;
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      return clientError("Malformed JSON in request body");
    }
    return serverError(error);
  }

  if (!isChatRequest(body)) {
    return clientError("Invalid request body", {
      expected: {
        message: "string (required)",
        history: "{ role: 'user'|'assistant', content: string }[] (required)",
        cars: "Car[] (required, shortlisted cars)",
      },
    });
  }

  try {
    const reply = await generateChatReply({
      message: body.message,
      history: body.history,
      cars: body.cars,
    });

    const response: ChatResponse = { reply };
    return NextResponse.json(response);
  } catch (error) {
    return serverError(error);
  }
}

