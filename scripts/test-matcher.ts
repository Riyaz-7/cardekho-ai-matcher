import { mockCars } from "@/data/mockCar";
import { filterCars, rankCars } from "@/lib/carMatcher";
import type { MatchRequest } from "@/types/match";

const cases: { name: string; request: MatchRequest; expectTopIds: string[] }[] = [
  {
    name: "SUV + safety + budget 15L",
    request: { budgetMax: 15, bodyType: "SUV", priority: "safety" },
    expectTopIds: ["tata-punch", "maruti-brezza", "maruti-fronx"],
  },
  {
    name: "Any body + mileage + budget 10L",
    request: { budgetMax: 10, priority: "mileage" },
    expectTopIds: ["maruti-swift", "renault-kwid"],
  },
  {
    name: "Electric + safety + budget 20L",
    request: { budgetMax: 20, fuelType: "Electric", priority: "safety" },
    expectTopIds: ["tata-nexon-ev"],
  },
  {
    name: "7 seats + budget 25L",
    request: { budgetMax: 25, minSeating: 7, priority: "safety" },
    expectTopIds: ["mahindra-scorpio-n"],
  },
];

let passed = 0;
let failed = 0;

for (const { name, request, expectTopIds } of cases) {
  const filtered = filterCars(mockCars, request);
  const ranked = rankCars(filtered, request.priority, 3);
  const ids = ranked.map((c) => c.id);

  console.log(`\n--- ${name} ---`);
  console.log(`Matched: ${filtered.length} | Top 3: ${ids.join(", ")}`);
  ranked.forEach((c) => console.log(`  ${c.name}: score=${c.score.toFixed(2)}, safety=${c.safetyRating}`));

  const ok =
    expectTopIds.every((id) => ids.includes(id)) &&
    ids.slice(0, expectTopIds.length).every((id, i) => id === expectTopIds[i]);

  if (ok) {
    console.log("PASS");
    passed++;
  } else {
    console.log(`FAIL (expected order: ${expectTopIds.join(", ")})`);
    failed++;
  }
}

console.log(`\nScoring tests: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
