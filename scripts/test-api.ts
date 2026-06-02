import { execSync } from "node:child_process";
import { writeFileSync, unlinkSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const baseUrl = "http://localhost:3000/api/match";
const tmpDir = mkdtempSync(join(tmpdir(), "match-api-"));

function post(payload: unknown): { status: number; body: Record<string, unknown> } {
  const file = join(tmpDir, "payload.json");
  writeFileSync(file, JSON.stringify(payload));

  const raw = execSync(
    `curl.exe -s -w "\\nHTTP_STATUS:%{http_code}" -X POST ${baseUrl} -H "Content-Type: application/json" -d "@${file}"`,
    { encoding: "utf8" },
  );

  const [bodyText, statusLine] = raw.trim().split("\nHTTP_STATUS:");
  return { status: Number(statusLine), body: JSON.parse(bodyText) as Record<string, unknown> };
}

const cases = [
  {
    name: "valid SUV safety match",
    payload: { budgetMax: 15, bodyType: "SUV", priority: "safety" },
    expectStatus: 200,
    assert: (b: Record<string, unknown>) =>
      Array.isArray(b.cars) &&
      (b.cars as { id: string }[]).map((c) => c.id).join() === "tata-punch,maruti-brezza,maruti-fronx" &&
      typeof b.summary === "string" &&
      (b.summary as string).length > 0,
  },
  {
    name: "valid mileage match",
    payload: { budgetMax: 10, priority: "mileage" },
    expectStatus: 200,
    assert: (b: Record<string, unknown>) =>
      (b.cars as { id: string }[]).map((c) => c.id).join() === "maruti-swift,renault-kwid",
  },
  {
    name: "valid filters no results",
    payload: { budgetMax: 5, bodyType: "SUV", priority: "safety" },
    expectStatus: 200,
    assert: (b: Record<string, unknown>) =>
      Array.isArray(b.cars) && (b.cars as unknown[]).length === 0 && b.matchedCount === 0,
  },
  {
    name: "invalid priority",
    payload: { budgetMax: 15, priority: "invalid" },
    expectStatus: 400,
    assert: (b: Record<string, unknown>) => b.error === "Invalid request body",
  },
  {
    name: "malformed JSON",
    raw: "{bad",
    expectStatus: 400,
    assert: (b: Record<string, unknown>) => b.error === "Malformed JSON in request body",
  },
];

let passed = 0;
let failed = 0;

for (const testCase of cases) {
  try {
    let result: { status: number; body: Record<string, unknown> };

    if ("raw" in testCase && testCase.raw) {
      const raw = execSync(
        `curl.exe -s -w "\\nHTTP_STATUS:%{http_code}" -X POST ${baseUrl} -H "Content-Type: application/json" -d "${testCase.raw}"`,
        { encoding: "utf8" },
      );
      const [bodyText, statusLine] = raw.trim().split("\nHTTP_STATUS:");
      result = { status: Number(statusLine), body: JSON.parse(bodyText) as Record<string, unknown> };
    } else {
      result = post(testCase.payload);
    }

    const ok = result.status === testCase.expectStatus && testCase.assert(result.body);
    console.log(`${ok ? "PASS" : "FAIL"} - ${testCase.name} (HTTP ${result.status})`);
    if (!ok) {
      console.log("  Response:", JSON.stringify(result.body));
      failed++;
    } else {
      passed++;
    }
  } catch (error) {
    console.log(`FAIL - ${testCase.name}`);
    console.log(" ", error);
    failed++;
  }
}

try {
  unlinkSync(join(tmpDir, "payload.json"));
} catch {
  // temp cleanup best-effort
}

console.log(`\nAPI tests: ${passed} passed, ${failed} failed`);
process.exit(failed > 0 ? 1 : 0);
