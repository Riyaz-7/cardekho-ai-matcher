## CarDekho Matcher

A Next.js (App Router) **car matchmaking wizard** + **AI advisor chat**.

Answer a few quick questions (budget, body type, priority) and get:
- **Top 3 recommended cars** (from `data/mockCar.ts`)
- A short **Gemini-powered explanation**
- A chat panel to ask follow-up questions about the shortlisted cars

Built with:
- **Next.js App Router**
- **TailwindCSS**
- **Google Gen AI SDK** (`@google/genai`) using `gemini-2.5-flash`

## Getting Started

### Prerequisites

- Node.js 20+
- A Gemini API key (AI Studio)

Create `.env.local`:

```bash
GEMINI_API_KEY=YOUR_KEY_HERE
```

### Install dependencies

On Windows PowerShell, if `npm` is blocked, use `npm.cmd`:

```bash
npm.cmd install
```

### Run the dev server

```bash
npm.cmd run dev
```

Open `http://localhost:3000`.

### Scripts

```bash
npm.cmd run dev
npm.cmd run build
npm.cmd run start
npx.cmd tsc --noEmit
npx.cmd tsx scripts/test-matcher.ts
npx.cmd tsx scripts/test-api.ts
```

## API

### `POST /api/match`

**Body**

```json
{
  "budgetMax": 15,
  "priority": "safety",
  "bodyType": "SUV",
  "fuelType": "any",
  "minSeating": 7
}
```

- **Required**
  - `budgetMax` (number, lakhs)
  - `priority` (`"safety" | "mileage" | "performance"`)
- **Optional**
  - `bodyType` (`"SUV" | "sedan" | "hatchback" | "MPV" | "any"`)
  - `fuelType` (`"Petrol" | "Diesel" | "Electric" | "CNG" | "Hybrid" | "any"`)
  - `minSeating` (number, e.g. `5` or `7`)

**Response**

```json
{
  "cars": [{ "id": "tata-punch", "name": "Punch", "...": "..." }],
  "summary": "3-sentence AI explanation…",
  "matchedCount": 3
}
```

**Status codes**
- `200`: success (includes “no matches” case with `cars: []`)
- `400`: malformed JSON / invalid request body
- `500`: internal server error

### `POST /api/chat`

Used by the “Expert assistant” panel in the results view.

**Body**

```json
{
  "message": "Which one is best for city driving?",
  "history": [
    { "role": "user", "content": "Help me choose" },
    { "role": "assistant", "content": "Sure — what matters most to you?" }
  ],
  "cars": [{ "id": "tata-punch", "name": "Punch", "brand": "Tata", "...": "..." }]
}
```

**Response**

```json
{ "reply": "..." }
```

**Status codes**
- `200`: success
- `400`: malformed JSON / invalid request body
- `503`: AI temporarily unavailable (UI shows Retry)
- `500`: internal server error

## Project Structure (high-level)

- `app/` — Next.js routes + pages (`app/api/*` for APIs)
- `components/match/` — UI wizard, results, chat panel
- `data/mockCar.ts` — strongly-typed car dataset
- `lib/` — matching + Gemini helpers
- `types/` — shared TypeScript types

## Roadmap

### Near-term
- Add **transmission preference** (manual/automatic) + brand preference
- Show **“Why this car?”** per card (auto-generated, 1 sentence each)
- Add **shareable link** for results (encode preferences in URL)
- Add **basic analytics** (which priorities/body types are most used)

### AI improvements
- Stream chat responses (typing feel)
- Add grounded comparisons (pros/cons with citations) once data source is added
- Tool/function calling for structured comparison outputs

### Data & matching improvements
- Expand dataset (real trims, prices, variants, safety sources)
- Normalize mileage/range and add missing specs (power/torque, airbags, etc.)
- Better scoring model (weights per use-case: city, highway, family, EV)

### UX
- “Save/compare” shortlist
- Mobile polish: bottom tabs + sticky actions
- Accessibility pass (keyboard + screen reader)

## Deployment

Deploy anywhere Next.js supports (Vercel recommended). Make sure `GEMINI_API_KEY` is set as an environment variable in your host.
