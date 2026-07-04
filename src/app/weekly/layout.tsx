import { Nav } from "@/components/layout/Nav";

export default function WeeklyLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-zinc-50 dark:bg-black">
      <Nav />
      <div className="min-h-0 flex-1">{children}</div>
    </div>
  );
}
