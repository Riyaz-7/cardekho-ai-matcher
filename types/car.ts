export type FuelType = "Petrol" | "Diesel" | "Electric" | "CNG" | "Hybrid";

export type Transmission = "Manual" | "Automatic" | "AMT" | "CVT" | "DCT";

export type BodyType = "SUV" | "sedan" | "hatchback" | "MPV";

export interface Car {
  id: string;
  name: string;
  brand: string;
  priceRange: string;
  maxPriceLakhs: number;
  fuelType: FuelType;
  transmission: Transmission[];
  mileage: string;
  safetyRating: number;
  bodyType: BodyType;
  description: string;
  seatingCapacity: number;
  engine: string;
  features: string[];
  bootSpaceLiters: number;
  groundClearanceMm: number;
}
