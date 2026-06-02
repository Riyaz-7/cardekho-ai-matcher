import type { BodyType, Car, FuelType } from "@/types/car";

export type MatchPriority = "safety" | "mileage" | "performance";

export interface MatchRequest {
  budgetMax: number;
  bodyType?: BodyType | "any";
  priority: MatchPriority;
  fuelType?: FuelType | "any";
  minSeating?: number;
}

export interface ScoredCar extends Car {
  score: number;
}

export interface MatchResponse {
  cars: Car[];
  summary: string;
  matchedCount: number;
  aiUnavailable?: boolean;
}
