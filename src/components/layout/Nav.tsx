import Link from "next/link";

import { signOut } from "@/lib/actions/auth";

export function Nav() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-sm font-semibold text-foreground">
          <span className="hidden sm:inline">Delivery Apps Tracking</span>
          <span className="sm:hidden">DAT</span>
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-muted-foreground hover:text-foreground">
            Dashboard
          </Link>
          <Link href="/shifts" className="text-muted-foreground hover:text-foreground">
            Shifts
          </Link>
          <Link href="/weekly" className="text-muted-foreground hover:text-foreground">
            Weekly View
          </Link>
          <form action={signOut}>
            <button type="submit" className="text-muted-foreground hover:text-foreground">
              Sign out
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
