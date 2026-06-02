import type { MatchResponse } from "@/types/match";

import { CarCard } from "./CarCard";
import { ChatPanel } from "./ChatPanel";

interface CarResultsProps {
  data: MatchResponse;
  onReset: () => void;
  onAdjust: () => void;
}

export function CarResults({ data, onReset, onAdjust }: CarResultsProps) {
  const hasCars = data.cars.length > 0;

  return (
    <section className="animate-in fade-in duration-500 space-y-8" aria-live="polite">
      <blockquote className="relative rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 pl-8">
        <div className="absolute left-0 top-0 h-full w-1 rounded-l-2xl bg-gradient-to-b from-cyan-400 to-teal-500" />
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-cyan-400">
          ✦ AI Advisor
        </p>
        <p className="text-base leading-relaxed text-zinc-300">{data.summary}</p>
      </blockquote>

      {hasCars ? (
        <>
          <p className="text-center text-sm text-zinc-500">
            {data.matchedCount} car{data.matchedCount === 1 ? "" : "s"} matched — showing top{" "}
            {data.cars.length}
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.cars.map((car, index) => (
              <CarCard key={car.id} car={car} rank={index + 1} />
            ))}
          </div>

          <ChatPanel cars={data.cars} />
        </>
      ) : (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center">
          <p className="text-lg text-zinc-300">No cars matched your filters</p>
          <p className="mt-2 text-sm text-zinc-500">
            Try raising your budget or choosing &quot;All&quot; for body type and fuel.
          </p>
          <button
            type="button"
            onClick={onAdjust}
            className="mt-6 rounded-full border border-cyan-400/40 px-6 py-2.5 text-sm font-medium text-cyan-300 transition hover:bg-cyan-400/10"
          >
            Adjust filters
          </button>
        </div>
      )}

      <div className="flex justify-center pt-2">
        <button
          type="button"
          onClick={onReset}
          className="rounded-full border border-zinc-700 px-8 py-3 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white"
        >
          Start over
        </button>
      </div>

      <p className="text-center text-xs text-zinc-600">
        Want to dig deeper? AI chat advisor coming soon.
      </p>
    </section>
  );
}
