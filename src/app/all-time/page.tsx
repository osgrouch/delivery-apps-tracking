import { AllTimeFocusView } from "@/components/all-time/AllTimeFocusView";
import { getApps, getShifts } from "@/lib/queries/shifts";
import {
  aggregateTotalsByApp,
  aggregateYearByApp,
  computeTotals,
  getYearRange,
} from "@/lib/utils/aggregate";

function todayISODate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export default async function AllTimeFocusPage() {
  const [shifts, apps] = await Promise.all([getShifts(), getApps()]);

  const currentYear = Number(todayISODate().slice(0, 4));
  const monthlyEarnings = aggregateYearByApp(shifts, apps, currentYear);
  const yearRange = getYearRange(shifts) ?? { minYear: currentYear, maxYear: currentYear };
  const totalsByApp = aggregateTotalsByApp(shifts, apps);
  const allTimeTotals = computeTotals(shifts);

  return (
    <AllTimeFocusView
      apps={apps}
      shifts={shifts}
      totalsByApp={totalsByApp}
      allTimeTotals={allTimeTotals}
      initialYear={currentYear}
      initialMonthlyData={monthlyEarnings}
      minYear={yearRange.minYear}
      maxYear={yearRange.maxYear}
    />
  );
}
