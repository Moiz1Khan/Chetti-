/**
 * Public site URL for email links (verify email, password reset) and share/embed links.
 *
 * **Vercel:** set `VITE_SITE_URL` to your production origin, e.g. `https://chetti.vercel.app`
 * (no trailing slash). That way confirmation links always use production even if someone
 * signed up from a preview URL or misconfigured proxy.
 *
 * Locally, falls back to `window.location.origin` when unset.
 */
export function getPublicSiteUrl(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return "";
}
