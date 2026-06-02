import { NextResponse } from "next/server";

import { mockCars } from "@/data/mockCar";
import { filterCars, rankCars } from "@/lib/carMatcher";
import { generateMatchSummary } from "@/lib/gemini";
import type { BodyType, FuelType } from "@/types/car";
import type { MatchPriority, MatchRequest, MatchResponse } from "@/types/match";

const VALID_PRIORITIES: MatchPriority[] = ["safety", "mileage", "performance"];
const VALID_BODY_TYPES: (BodyType | "any")[] = ["SUV", "sedan", "hatchback", "MPV", "any"];
const VALID_FUEL_TYPES: (FuelType | "any")[] = ["Petrol", "Diesel", "Electric", "CNG", "Hybrid", "any"];

function isValidMatchRequest(body: unknown): body is MatchRequest {
  if (!body || typeof body !== "object") return false;

  const { budgetMax, bodyType, priority, fuelType, minSeating } = body as Record<string, unknown>;

  if (typeof budgetMax !== "number" || budgetMax <= 0) return false;
  if (typeof priority !== "string" || !VALID_PRIORITIES.includes(priority as MatchPriority)) {
    return false;
  }
  if (bodyType !== undefined && (typeof bodyType !== "string" || !VALID_BODY_TYPES.includes(bodyType as BodyType | "any"))) {
    return false;
  }
  if (fuelType !== undefined && (typeof fuelType !== "string" || !VALID_FUEL_TYPES.includes(fuelType as FuelType | "any"))) {
    return false;
  }
  if (minSeating !== undefined && (typeof minSeating !== "number" || minSeating < 2)) {
    return false;
  }

  return true;
}

function clientError(message: string, details?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...details }, { status: 400 });
}

function serverError(error: unknown) {
  console.error("[POST /api/match]", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
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

  if (!isValidMatchRequest(body)) {
    return clientError("Invalid request body", {
      expected: {
        budgetMax: "number (required, in lakhs)",
        priority: "safety | mileage | performance (required)",
        bodyType: "SUV | sedan | hatchback | MPV | any (optional)",
        fuelType: "Petrol | Diesel | Electric | CNG | Hybrid | any (optional)",
        minSeating: "number (optional, e.g. 5 or 7)",
      },
    });
  }

  try {
    const filtered = filterCars(mockCars, body);

    if (filtered.length === 0) {
      return NextResponse.json({
        cars: [],
        summary: "No cars match your filters. Try increasing budget or relaxing body type / fuel type.",
        matchedCount: 0,
      } satisfies MatchResponse);
    }

    const topCars = rankCars(filtered, body.priority, 3);
    const summary = await generateMatchSummary(body, topCars);

    const response: MatchResponse = {
      cars: topCars.map(({ score: _score, ...car }) => car),
      summary,
      matchedCount: filtered.length,
    };

    return NextResponse.json(response);
  } catch (error) {
    return serverError(error);
  }
}
