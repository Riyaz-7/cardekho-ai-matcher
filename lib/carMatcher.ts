import type { Car } from "@/types/car";
import type { MatchPriority, MatchRequest, ScoredCar } from "@/types/match";

function parseMileageKmPerLiter(mileage: string): number {
  const match = mileage.match(/([\d.]+)\s*km\/l/i);
  return match ? parseFloat(match[1]) : 0;
}

function parseElectricRangeKm(mileage: string): number {
  const match = mileage.match(/([\d.]+)\s*km/i);
  return match ? parseFloat(match[1]) / 10 : 0;
}

function getMileageScore(car: Car): number {
  if (car.fuelType === "Electric") {
    return parseElectricRangeKm(car.mileage);
  }
  return parseMileageKmPerLiter(car.mileage);
}

function getPerformanceScore(car: Car): number {
  let score = 0;
  const engine = car.engine.toLowerCase();

  if (engine.includes("turbo")) score += 35;
  if (engine.includes("motor")) score += 40;
  if (car.transmission.includes("DCT")) score += 25;
  if (car.transmission.includes("Automatic")) score += 15;
  if (car.features.some((f) => /adas|terrain|4x4/i.test(f))) score += 10;

  score += car.maxPriceLakhs * 1.5;
  return score;
}

export function scoreCar(car: Car, priority: MatchPriority): number {
  switch (priority) {
    case "safety":
      return car.safetyRating * 100 + getMileageScore(car) * 0.1;
    case "mileage":
      return getMileageScore(car) * 10 + car.safetyRating;
    case "performance":
      return getPerformanceScore(car) + car.safetyRating * 5;
  }
}

export function filterCars(cars: Car[], request: MatchRequest): Car[] {
  return cars.filter((car) => {
    if (car.maxPriceLakhs > request.budgetMax) return false;

    if (request.bodyType && request.bodyType !== "any" && car.bodyType !== request.bodyType) {
      return false;
    }

    if (request.fuelType && request.fuelType !== "any" && car.fuelType !== request.fuelType) {
      return false;
    }

    if (request.minSeating !== undefined && car.seatingCapacity < request.minSeating) {
      return false;
    }

    return true;
  });
}

export function rankCars(cars: Car[], priority: MatchPriority, limit = 3): ScoredCar[] {
  return cars
    .map((car) => ({ ...car, score: scoreCar(car, priority) }))
    .sort((a, b) => b.score - a.score || a.maxPriceLakhs - b.maxPriceLakhs)
    .slice(0, limit);
}
