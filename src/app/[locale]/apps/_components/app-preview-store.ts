"use client";

import { create } from "zustand";

export type AppPreviewStatus = "idle" | "generating" | "success" | "error";

export type AppPreviewProgress = {
  label?: string;
  value?: number; // 0..1
};

export type AppPreviewResult = {
  url: string;
  alt?: string;
};

type AppPreviewState = {
  status: AppPreviewStatus;
  progress: AppPreviewProgress | null;
  result: AppPreviewResult | null;
  error: string | null;
};

type AppPreviewActions = {
  begin: (progress?: AppPreviewProgress) => void;
  setProgress: (progress: AppPreviewProgress | null) => void;
  succeed: (result: AppPreviewResult) => void;
  fail: (error: string) => void;
  reset: () => void;
};

const initialState: AppPreviewState = {
  status: "idle",
  progress: null,
  result: null,
  error: null,
};

export const useAppPreviewStore = create<AppPreviewState & AppPreviewActions>((set) => ({
  ...initialState,

  begin: (progress) =>
    set({
      status: "generating",
      progress: progress ?? { value: 0 },
      result: null,
      error: null,
    }),

  setProgress: (progress) => set({ progress }),

  succeed: (result) =>
    set({
      status: "success",
      progress: null,
      result,
      error: null,
    }),

  fail: (error) =>
    set({
      status: "error",
      progress: null,
      result: null,
      error,
    }),

  reset: () => set(initialState),
}));

