import { PageShell } from "@/components/layout/PageShell";

export default function AllTimeLayout({ children }: { children: React.ReactNode }) {
  return <PageShell scrollContent={false}>{children}</PageShell>;
}
