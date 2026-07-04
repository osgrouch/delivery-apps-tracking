export function Spinner({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary ${className}`}
    />
  );
}
