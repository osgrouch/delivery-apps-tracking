const APP_BRAND_COLORS: Record<string, string> = {
  "uber eats": "#286ef0",
  doordash: "#f72e09",
  instacart: "#09af07",
};
const FALLBACK_COLORS = ["#9333ea", "#0891b2", "#f59e0b", "#64748b"];

/** Brand color for a known delivery app, else a stable fallback by position. */
export function colorForApp(appName: string, fallbackIndex: number): string {
  return APP_BRAND_COLORS[appName.toLowerCase()] ?? FALLBACK_COLORS[fallbackIndex % FALLBACK_COLORS.length];
}
