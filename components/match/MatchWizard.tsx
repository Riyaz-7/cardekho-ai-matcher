"use client";

import { useMemo, useState } from "react";

import { mockCars } from "@/data/mockCar";
import { filterCars } from "@/lib/carMatcher";
import type { BodyType, FuelType } from "@/types/car";
import type { MatchPriority, MatchRequest } from "@/types/match";

import { PillGroup } from "./PillGroup";

export interface WizardFormState {
  budgetMax: number;
  bodyType: BodyType | "any";
  priority: MatchPriority;
  fuelType: FuelType | "any";
  minSeating?: number;
}

export const DEFAULT_FORM: WizardFormState = {
  budgetMax: 15,
  bodyType: "any",
  priority: "safety",
  fuelType: "any",
};

export function toMatchRequest(form: WizardFormState): MatchRequest {
  const request: MatchRequest = {
    budgetMax: form.budgetMax,
    priority: form.priority,
  };

  if (form.bodyType !== "any") request.bodyType = form.bodyType;
  if (form.fuelType !== "any") request.fuelType = form.fuelType;
  if (form.minSeating !== undefined) request.minSeating = form.minSeating;

  return request;
}

const BODY_OPTIONS: { value: BodyType | "any"; label: string }[] = [
  { value: "any", label: "All" },
  { value: "SUV", label: "SUV" },
  { value: "hatchback", label: "Hatchback" },
  { value: "sedan", label: "Sedan" },
  { value: "MPV", label: "MPV" },
];

const PRIORITY_OPTIONS: { value: MatchPriority; label: string; hint: string }[] = [
  { value: "safety", label: "Safety", hint: "Keep my family safe" },
  { value: "mileage", label: "Mileage", hint: "Save on fuel" },
  { value: "performance", label: "Performance", hint: "Power & driving fun" },
];

const FUEL_OPTIONS: { value: FuelType | "any"; label: string }[] = [
  { value: "any", label: "All" },
  { value: "Petrol", label: "Petrol" },
  { value: "Diesel", label: "Diesel" },
  { value: "Electric", label: "Electric" },
  { value: "CNG", label: "CNG" },
  { value: "Hybrid", label: "Hybrid" },
];

type SeatingChoice = "any" | "5" | "7";

interface MatchWizardProps {
  form: WizardFormState;
  onChange: (form: WizardFormState) => void;
  onSubmit: () => void;
  loading: boolean;
  error: string | null;
}

export function MatchWizard({ form, onChange, onSubmit, loading, error }: MatchWizardProps) {
  const [moreOpen, setMoreOpen] = useState(false);

  const matchCount = useMemo(
    () => filterCars(mockCars, toMatchRequest(form)).length,
    [form],
  );

  const seatingChoice: SeatingChoice =
    form.minSeating === 7 ? "7" : form.minSeating === 5 ? "5" : "any";

  const setSeating = (choice: SeatingChoice) => {
    onChange({
      ...form,
      minSeating: choice === "any" ? undefined : Number(choice),
    });
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6 shadow-xl shadow-black/20 backdrop-blur sm:p-8">
      <div className="space-y-8">
        {/* Budget */}
        <div className="space-y-4">
          <div className="flex items-end justify-between gap-4">
            <label htmlFor="budget" className="text-sm font-medium text-zinc-300">
              Maximum budget
            </label>
            <span className="text-2xl font-bold text-cyan-400">
              ₹{form.budgetMax} <span className="text-base font-normal text-zinc-500">Lakh</span>
            </span>
          </div>
          <input
            id="budget"
            type="range"
            min={5}
            max={50}
            step={1}
            value={form.budgetMax}
            disabled={loading}
            onChange={(e) => onChange({ ...form, budgetMax: Number(e.target.value) })}
            className="range-cyan w-full"
          />
          <div className="flex justify-between text-xs text-zinc-600">
            <span>₹5L</span>
            <span>₹25L</span>
            <span>₹50L</span>
          </div>
          <p className="text-center text-sm text-zinc-500">
            <span className="font-medium text-cyan-400/90">{matchCount}</span>{" "}
            {matchCount === 1 ? "car matches" : "cars match"} your filters right now
          </p>
        </div>

        <PillGroup
          label="Body type"
          options={BODY_OPTIONS}
          value={form.bodyType}
          onChange={(bodyType) => onChange({ ...form, bodyType })}
          disabled={loading}
        />

        <PillGroup
          label="What matters most?"
          options={PRIORITY_OPTIONS}
          value={form.priority}
          onChange={(priority) => onChange({ ...form, priority })}
          disabled={loading}
        />

        {/* More filters */}
        <div className="border-t border-zinc-800 pt-6">
          <button
            type="button"
            onClick={() => setMoreOpen((open) => !open)}
            className="flex w-full items-center justify-between text-sm font-medium text-zinc-400 transition hover:text-zinc-200"
            aria-expanded={moreOpen}
          >
            More filters
            <span className="text-cyan-400">{moreOpen ? "−" : "+"}</span>
          </button>

          {moreOpen && (
            <div className="mt-6 space-y-6 animate-fade-in">
              <PillGroup
                label="Fuel type"
                options={FUEL_OPTIONS}
                value={form.fuelType}
                onChange={(fuelType) => onChange({ ...form, fuelType })}
                disabled={loading}
              />
              <PillGroup
                label="Family size"
                options={[
                  { value: "any" as const, label: "Any" },
                  { value: "5" as const, label: "5 seats" },
                  { value: "7" as const, label: "7 seats" },
                ]}
                value={seatingChoice}
                onChange={setSeating}
                disabled={loading}
              />
            </div>
          )}
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          >
            {error}
          </div>
        )}
      </div>

      <div className="sticky bottom-0 -mx-6 mt-8 border-t border-zinc-800/80 bg-zinc-900/95 px-6 py-4 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:pt-8">
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading || matchCount === 0}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 py-3.5 text-sm font-semibold text-zinc-950 transition hover:from-cyan-400 hover:to-teal-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Spinner />
              Analyzing your preferences…
            </>
          ) : (
            "Find my cars"
          )}
        </button>
        {matchCount === 0 && !loading && (
          <p className="mt-2 text-center text-xs text-zinc-500">
            No cars in range — try increasing your budget
          </p>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
