import { Nav } from "@/components/layout/Nav";

interface PageShellProps {
  children: React.ReactNode;
  /**
   * true (default): wrap children in a centered, scrollable content area —
   * for pages whose content can be taller than the viewport (Dashboard,
   * Shifts).
   * false: render children directly, full height — for pages that manage
   * their own internal scrolling (e.g. /weekly's 3-quadrant layout).
   */
  scrollContent?: boolean;
}

/** Shared page shell: fixed-height viewport, Nav always visible at the top, never a page-level scrollbar. */
export function PageShell({ children, scrollContent = true }: PageShellProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Nav />
      {scrollContent ? (
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl px-4 py-8">{children}</div>
        </main>
      ) : (
        <div className="min-h-0 flex-1">{children}</div>
      )}
    </div>
  );
}
