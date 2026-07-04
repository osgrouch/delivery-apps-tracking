/**
 * Shared Recharts styling constants. Recharts renders plain SVG, so it can't
 * read Tailwind classes — these read the same CSS custom properties from
 * globals.css instead, keeping every chart in sync with the theme.
 */
export const CHART_GRID_STROKE = "var(--border)";

export const CHART_TICK_STYLE = { fontSize: 12, fill: "var(--muted-foreground)" };

export const CHART_TOOLTIP_STYLE = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  color: "var(--foreground)",
};

export const CHART_LEGEND_STYLE = { fontSize: 12, color: "var(--foreground)" };

export const CHART_CURSOR_FILL = { fill: "rgba(255,255,255,0.04)" };

export const CHART_PRIMARY_COLOR = "var(--primary)";
