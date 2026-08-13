import { AllTimeFocusView } from "@/components/all-time/AllTimeFocusView";
import { getApps, getLocations, getShifts } from "@/lib/queries/shifts";
import { aggregateTotalsByApp, aggregateYearByApp, getYearRange } from "@/lib/utils/aggregate";

function todayISODate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export default async function AllTimeFocusPage() {
  const [shifts, apps, locations] = await Promise.all([getShifts(), getApps(), getLocations()]);

  const currentYear = Number(todayISODate().slice(0, 4));
  const monthlyEarnings = aggregateYearByApp(shifts, apps, currentYear);
  const yearRange = getYearRange(shifts) ?? { minYear: currentYear, maxYear: currentYear };
  const totalsByApp = aggregateTotalsByApp(shifts, apps);

  return (
    <AllTimeFocusView
      apps={apps}
      locations={locations}
      shifts={shifts}
      totalsByApp={totalsByApp}
      initialYear={currentYear}
      initialMonthlyData={monthlyEarnings}
      minYear={yearRange.minYear}
      maxYear={yearRange.maxYear}
    />
  );
}
