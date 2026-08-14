"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { getPrefetchNavHrefs } from "./nav-config";

function scheduleIdle(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const ric = (
    window as Window & {
      requestIdleCallback?: (
        cb: IdleRequestCallback,
        opts?: IdleRequestOptions,
      ) => number;
      cancelIdleCallback?: (id: number) => void;
    }
  ).requestIdleCallback;

  if (typeof ric === "function") {
    const id = ric(() => callback(), { timeout: 2500 });
    return () => {
      window.cancelIdleCallback?.(id);
    };
  }

  const id = globalThis.setTimeout(callback, 200);
  return () => globalThis.clearTimeout(id);
}

type PrefetchRouter = {
  prefetch: (href: string) => void;
};

export function prefetchNavHref(router: PrefetchRouter, href: string) {
  try {
    router.prefetch(href);
  } catch {
    // Best-effort: a failed prefetch must never break navigation.
  }
}

/** Attach to a link to warm its route on hover, focus or touch. */
export function navIntentPrefetchHandlers(
  router: PrefetchRouter,
  href: string,
) {
  const prefetch = () => prefetchNavHref(router, href);
  return {
    onPointerEnter: prefetch,
    onFocus: prefetch,
    onTouchStart: prefetch,
  };
}

/**
 * Warm every nav destination one at a time during idle.
 *
 * This prefetches RSC *shells*, which is why it is safe: it does not relax
 * `staleTimes.dynamic`, so the data on those pages is still fetched fresh at
 * navigation time. Skipped while offline — there is nothing to warm.
 */
export function useNavPrefetch(enabled = true) {
  const router = useRouter();

  useEffect(() => {
    if (!enabled) return;
    if (typeof navigator !== "undefined" && navigator.onLine === false) return;

    const hrefs = getPrefetchNavHrefs();
    let cancelled = false;
    let index = 0;

    const cancelIdle = scheduleIdle(() => {
      const tick = () => {
        if (cancelled) return;
        const href = hrefs[index];
        if (!href) return;
        index += 1;
        prefetchNavHref(router, href);
        if (index < hrefs.length) scheduleIdle(tick);
      };
      tick();
    });

    return () => {
      cancelled = true;
      cancelIdle();
    };
  }, [enabled, router]);
}
