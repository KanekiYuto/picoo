"use client";

import type { FormEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useAppPreviewStore } from "./app-preview-store";

type MockResult = {
  url: string;
  alt?: string;
};

const defaultMockResults: readonly MockResult[] = [
  { url: "/material/apps/ai-hairstyle-changer/ai_hairstyle_1_f09bca678b.webp" },
  { url: "/material/apps/ai-hairstyle-changer/ai_hairstyle_2_022a75da4d.webp" },
  { url: "/material/apps/ai-hairstyle-changer/ai_hairstyle_3_668eed9f89.webp" },
];

function easeOutQuad(t: number) {
  return 1 - (1 - t) * (1 - t);
}

export function AppPreviewMockGenerate({
  children,
  results,
  durationMs = 2800,
  jitterMs = 900,
}: {
  children: ReactNode;
  results?: readonly MockResult[];
  durationMs?: number;
  jitterMs?: number;
}) {
  const status = useAppPreviewStore((s) => s.status);
  const begin = useAppPreviewStore((s) => s.begin);
  const setProgress = useAppPreviewStore((s) => s.setProgress);
  const succeed = useAppPreviewStore((s) => s.succeed);

  const rafIdRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const runDurationRef = useRef<number>(0);

  const resolvedResults = useMemo(() => {
    return results?.length ? results : defaultMockResults;
  }, [results]);

  const cleanup = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  const startMock = useCallback(() => {
    const duration = Math.max(500, durationMs + Math.random() * Math.max(0, jitterMs));
    startedAtRef.current = performance.now();
    runDurationRef.current = duration;

    begin({ value: 0 });

    const loop = () => {
      const now = performance.now();
      const elapsed = now - startedAtRef.current;
      const t = Math.max(0, Math.min(1, elapsed / runDurationRef.current));
      const eased = easeOutQuad(t);

      if (t >= 1) {
        setProgress({ value: 1 });
        const picked = resolvedResults[Math.floor(Math.random() * resolvedResults.length)]!;
        succeed(picked);
        cleanup();
        return;
      }

      setProgress({ value: eased });
      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);
  }, [begin, cleanup, durationMs, jitterMs, resolvedResults, setProgress, succeed]);

  useEffect(() => {
    if (status !== "generating") cleanup();
  }, [cleanup, status]);

  const onSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();

      if (status === "generating") return;
      cleanup();
      startMock();
    },
    [cleanup, startMock, status],
  );

  return <div onSubmit={onSubmit}>{children}</div>;
}

