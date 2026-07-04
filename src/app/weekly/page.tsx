import { WeeklyFocusView } from "@/components/weekly/WeeklyFocusView";
import { getApps, getShifts } from "@/lib/queries/shifts";
import {
  getDistinctAppsByDate,
  getEarliestShiftDate,
  getMondayOfWeek,
  getMonthEndWeekStart,
  getWeekStartsBetween,
} from "@/lib/utils/aggregate";

function todayISODate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export default async function WeeklyFocusPage() {
  const [shifts, apps] = await Promise.all([getShifts(), getApps()]);

  const today = todayISODate();
  const currentWeekStart = getMondayOfWeek(today);
  const earliestShiftDate = getEarliestShiftDate(shifts) ?? today;
  const calendarEndWeekStart = getMonthEndWeekStart(today);
  const weekStarts = getWeekStartsBetween(earliestShiftDate, calendarEndWeekStart);
  const appsByDate = getDistinctAppsByDate(shifts);

  return (
    <WeeklyFocusView
      apps={apps}
      shifts={shifts}
      weekStarts={weekStarts}
      initialWeekStart={currentWeekStart}
      appsByDate={appsByDate}
      today={today}
    />
  );
}
