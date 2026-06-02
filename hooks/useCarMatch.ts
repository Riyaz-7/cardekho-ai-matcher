"use client";

import { useCallback, useState } from "react";

import type { MatchRequest, MatchResponse } from "@/types/match";

export type MatchStatus = "idle" | "loading" | "results" | "error";

export function useCarMatch() {
  const [status, setStatus] = useState<MatchStatus>("idle");
  const [data, setData] = useState<MatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (request: MatchRequest) => {
    setStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      const json = (await response.json()) as MatchResponse & { error?: string };

      if (!response.ok) {
        setError(json.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      setData(json);
      setStatus("results");
    } catch {
      setError("Unable to reach the server. Please try again.");
      setStatus("error");
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setData(null);
    setError(null);
  }, []);

  return { status, data, error, submit, reset };
}
