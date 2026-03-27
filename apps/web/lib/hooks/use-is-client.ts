"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * true только в браузере после гидрации; на сервере и на первом проходе гидрации — false.
 * Устраняет рассинхрон useId у Radix между SSR и клиентом (Next.js / Turbopack).
 */
export function useIsClient(): boolean {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}
