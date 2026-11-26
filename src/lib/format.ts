const TZ = "Australia/Sydney";

export function readingTime(md: string) {
  const words = md.replace(/[`#>*_\-\[\]()!]/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 230));
}

export function formatDate(iso: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  return new Intl.DateTimeFormat("en-AU", { timeZone: TZ, ...opts }).format(new Date(iso));
}

export function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: TZ,
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(new Date(iso));
}

/** Deterministic relative time (relative to a supplied "now" so SSR is stable). */
export function relativeTime(iso: string, now = Date.now()) {
  const diff = Math.round((now - Date.parse(iso)) / 1000);
  if (diff < 60) return "just now";
  const m = Math.round(diff / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d ago`;
  return formatDate(iso);
}

export function aud(n: number) {
  return new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD", minimumFractionDigits: n % 1 ? 2 : 0 }).format(n);
}

export function percentOff(price: number, rrp: number) {
  return Math.round((1 - price / rrp) * 100);
}

/** Wire-style stamp: "26 Nov 09:42" in AU time. */
export function wireStamp(iso: string) {
  const d = new Date(iso);
  const day = new Intl.DateTimeFormat("en-AU", { timeZone: TZ, day: "numeric", month: "short" }).format(d);
  const clock = new Intl.DateTimeFormat("en-AU", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d);
  return { day, clock, label: `${day} ${clock}` };
}
