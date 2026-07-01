const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

export function formatDate(isoDate: string): string {
  // Append a time to avoid the browser interpreting a bare "YYYY-MM-DD"
  // as UTC midnight and rendering the previous day in negative-offset zones.
  return dateFormatter.format(new Date(`${isoDate}T00:00:00`));
}

export function formatNumber(value: number, fractionDigits = 1): string {
  return value.toFixed(fractionDigits);
}
