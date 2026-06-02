"use client";

import { useRef, useState } from "react";

import { useCarMatch } from "@/hooks/useCarMatch";

import { CarResults } from "./CarResults";
import { Hero } from "./Hero";
import { DEFAULT_FORM, MatchWizard, toMatchRequest, type WizardFormState } from "./MatchWizard";

type ActiveTab = "quiz" | "results";

export function MatchExperience() {
  const [form, setForm] = useState<WizardFormState>(DEFAULT_FORM);
  const [activeTab, setActiveTab] = useState<ActiveTab>("quiz");
  const { status, data, error, submit, reset } = useCarMatch();

  const quizRef = useRef<HTMLDivElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const loading = status === "loading";

  const scrollTo = (target: "quiz" | "results") => {
    const el = target === "quiz" ? quizRef.current : resultsRef.current;
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleSubmit = () => {
    submit(toMatchRequest(form));
    setActiveTab("results");
    // results section will appear once data arrives; we still switch tab immediately
  };

  const handleReset = () => {
    setForm(DEFAULT_FORM);
    reset();
    setActiveTab("quiz");
    scrollTo("quiz");
  };

  const handleAdjust = () => {
    reset();
    setActiveTab("quiz");
    scrollTo("quiz");
  };

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    scrollTo(tab);
  };

  const showWizard = activeTab === "quiz" || status !== "results";

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-zinc-950 to-zinc-950"
        aria-hidden="true"
      />

      <main className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <Hero />

        <div className="mt-10 flex justify-center">
          <nav
            className="inline-flex rounded-full border border-zinc-800 bg-zinc-900/60 p-1 text-xs sm:text-sm"
            aria-label="CarDekho Matcher sections"
          >
            <button
              type="button"
              onClick={() => handleTabChange("quiz")}
              className={`rounded-full px-4 py-1.5 font-medium transition ${
                activeTab === "quiz"
                  ? "bg-zinc-950 text-cyan-300 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-100"
              }`}
            >
              Match quiz
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("results")}
              className={`rounded-full px-4 py-1.5 font-medium transition ${
                activeTab === "results"
                  ? "bg-zinc-950 text-cyan-300 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-100"
              }`}
            >
              Recommended cars
            </button>
          </nav>
        </div>

        <div className="mt-8 space-y-12">
          {showWizard && (
            <div ref={quizRef}>
              <MatchWizard
                form={form}
                onChange={setForm}
                onSubmit={handleSubmit}
                loading={loading}
                error={error}
              />
            </div>
          )}

          <div ref={resultsRef}>
            {status === "results" && data ? (
              <CarResults data={data} onReset={handleReset} onAdjust={handleAdjust} />
            ) : activeTab === "results" ? (
              <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 text-center text-sm text-zinc-400">
                Run the quiz to see your top 3 car recommendations.
              </section>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
