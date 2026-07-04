import { PageShell } from "@/components/layout/PageShell";

export default function WeeklyLayout({ children }: { children: React.ReactNode }) {
  return <PageShell scrollContent={false}>{children}</PageShell>;
}
