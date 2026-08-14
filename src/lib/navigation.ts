/**
 * Client helpers after Server Actions that call `revalidatePath`.
 *
 * Soft `push`/`replace` can land on a Client Router Cache entry captured
 * *before* the mutation. Always refresh **after** navigation so the
 * destination RSC tree is refetched. See docs/architecture.md §7.2.
 */

type RouterRefresh = {
  refresh: () => void;
};

type RouterNavigate = RouterRefresh & {
  push: (href: string, options?: { scroll?: boolean }) => void;
};

type RouterReplace = RouterRefresh & {
  replace: (href: string, options?: { scroll?: boolean }) => void;
};

/** Defer refresh until after navigation is scheduled on the stack. */
function refreshSoon(router: RouterRefresh): void {
  setTimeout(() => {
    router.refresh();
  }, 0);
}

/** Refetch the current route's RSC tree after a successful mutation. */
export function refreshAfterMutation(router: RouterRefresh): void {
  refreshSoon(router);
}

/** Soft-navigate, then refresh so the destination is not stale. */
export function navigateAndRefresh(
  router: RouterNavigate,
  href: string,
  options?: { scroll?: boolean },
): void {
  router.push(href, options);
  refreshSoon(router);
}

/** Same as {@link navigateAndRefresh} but with `replace`. */
export function replaceAndRefresh(
  router: RouterReplace,
  href: string,
  options?: { scroll?: boolean },
): void {
  router.replace(href, options);
  refreshSoon(router);
}
