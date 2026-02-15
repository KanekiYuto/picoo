"use client";

import { useEffect } from "react";
import clarity from "@microsoft/clarity";

export function ClarityProvider() {
  useEffect(() => {
    // 仅在生产环境初始化 Clarity
    if (process.env.NODE_ENV === "production") {
      try {
        clarity.init("vhpwbkisq5");
        console.log("Microsoft Clarity initialized");
      } catch (error) {
        console.error("Failed to initialize Clarity:", error);
      }
    }
  }, []);

  return null;
}
