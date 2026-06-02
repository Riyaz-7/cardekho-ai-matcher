import type { Car } from "@/types/car";

interface CarCardProps {
  car: Car;
  rank: number;
}

function SafetyStars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-400" aria-label={`${rating} out of 5 safety rating`}>
      {"★".repeat(rating)}
      <span className="text-zinc-600">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export function CarCard({ car, rank }: CarCardProps) {
  return (
    <article
      className="animate-in flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5"
      style={{ animationDelay: `${rank * 120}ms` }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-cyan-400/80">
            {car.brand}
          </p>
          <h3 className="text-xl font-semibold text-white">{car.name}</h3>
        </div>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 text-sm font-bold text-cyan-300 ring-1 ring-cyan-400/30">
          #{rank}
        </span>
      </div>

      <p className="mb-4 text-lg font-medium text-zinc-200">{car.priceRange}</p>

      <div className="mb-4 flex flex-wrap gap-2">
        <span className="rounded-full bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300">
          {car.bodyType.toUpperCase()}
        </span>
        <span className="rounded-full bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300">
          {car.fuelType}
        </span>
        <span className="rounded-full bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300">
          {car.mileage}
        </span>
        <span className="rounded-full bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300">
          {car.seatingCapacity} seats
        </span>
      </div>

      <div className="mb-3 flex items-center gap-2 text-sm text-zinc-400">
        <span>Safety</span>
        <SafetyStars rating={car.safetyRating} />
      </div>

      <p className="mt-auto text-sm leading-relaxed text-zinc-400">{car.description}</p>
    </article>
  );
}
