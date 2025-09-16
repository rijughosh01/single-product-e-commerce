"use client";

import { useHydration } from "@/hooks/useHydration";

const HydrationBoundary = ({ children, fallback = null }) => {
  const isHydrated = useHydration();

  if (!isHydrated) {
    return fallback;
  }

  return children;
};

export default HydrationBoundary;
