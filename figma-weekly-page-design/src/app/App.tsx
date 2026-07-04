import { useState } from "react";
import { Clock, MapPin, Package } from "lucide-react";

interface ShiftData {
  app: string;
  appColor: string;
  appBg: string;
  appInitial: string;
  date: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  hoursWorked: number;
  milesDriven: number;
  totalEarnings: number;
  trips: number;
  shiftType: string;
}

const DAYS: { name: string; short: string; date: string; mmdd: string }[] = [
  { name: "Monday",    short: "Mon", date: "Jun 23, 2026", mmdd: "6/23" },
  { name: "Tuesday",   short: "Tue", date: "Jun 24, 2026", mmdd: "6/24" },
  { name: "Wednesday", short: "Wed", date: "Jun 25, 2026", mmdd: "6/25" },
  { name: "Thursday",  short: "Thu", date: "Jun 26, 2026", mmdd: "6/26" },
  { name: "Friday",    short: "Fri", date: "Jun 27, 2026", mmdd: "6/27" },
  { name: "Saturday",  short: "Sat", date: "Jun 28, 2026", mmdd: "6/28" },
  { name: "Sunday",    short: "Sun", date: "Jun 29, 2026", mmdd: "6/29" },
];

const shifts: ShiftData[] = [
  {
    app: "Instacart",
    appColor: "#43B02A",
    appBg: "rgba(67,176,42,0.12)",
    appInitial: "IC",
    date: "Jun 25, 2026",
    dayOfWeek: "Wednesday",
    startTime: "9:00 AM",
    endTime: "3:30 PM",
    hoursWorked: 6.5,
    milesDriven: 89.7,
    totalEarnings: 118.50,
    trips: 5,
    shiftType: "Full Day",
  },
  {
    app: "Uber Eats",
    appColor: "#06C167",
    appBg: "rgba(6,193,103,0.12)",
    appInitial: "UE",
    date: "Jun 27, 2026",
    dayOfWeek: "Friday",
    startTime: "11:00 AM",
    endTime: "2:45 PM",
    hoursWorked: 3.75,
    milesDriven: 38.4,
    totalEarnings: 71.25,
    trips: 9,
    shiftType: "Lunch Rush",
  },
  {
    app: "DoorDash",
    appColor: "#FF3008",
    appBg: "rgba(255,48,8,0.12)",
    appInitial: "DD",
    date: "Jun 28, 2026",
    dayOfWeek: "Saturday",
    startTime: "5:30 PM",
    endTime: "10:15 PM",
    hoursWorked: 4.75,
    milesDriven: 61.2,
    totalEarnings: 94.80,
    trips: 12,
    shiftType: "Evening Rush",
  },
  {
    app: "Amazon Flex",
    appColor: "#FF9900",
    appBg: "rgba(255,153,0,0.12)",
    appInitial: "AF",
    date: "Jun 29, 2026",
    dayOfWeek: "Sunday",
    startTime: "7:00 AM",
    endTime: "9:30 AM",
    hoursWorked: 2.5,
    milesDriven: 24.1,
    totalEarnings: 45.00,
    trips: 14,
    shiftType: "Morning Block",
  },
];

type SortKey = "earnings" | "perMile" | "perTrip" | "hourly";

function metricValue(shift: ShiftData, key: SortKey): number {
  if (key === "earnings") return shift.totalEarnings;
  if (key === "perMile") return shift.totalEarnings / shift.milesDriven;
  if (key === "perTrip") return shift.totalEarnings / shift.trips;
  return shift.totalEarnings / shift.hoursWorked;
}

// ── StatCell ──────────────────────────────────────────────────────────────────

function StatCell({
  label,
  value,
  icon: Icon,
  highlight,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  highlight?: boolean;
  sub?: string;
}) {
  return (
    <div
      className={`flex flex-col gap-1 px-4 py-1.5 rounded-lg transition-colors ${
        highlight
          ? "bg-primary/10 border border-primary/30"
          : "bg-secondary/60 border border-white/5"
      }`}
    >
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Icon size={11} strokeWidth={2} />
        <span className="text-[10px] uppercase tracking-widest font-medium" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {label}
        </span>
      </div>
      <span
        className={`text-lg font-medium leading-none whitespace-nowrap ${highlight ? "text-primary" : "text-foreground"}`}
        style={{ fontFamily: "'DM Mono', monospace" }}
      >
        {value}
      </span>
      {sub && (
        <span className="text-[10px] text-muted-foreground mt-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {sub}
        </span>
      )}
    </div>
  );
}

// ── ShiftCard ─────────────────────────────────────────────────────────────────

function ShiftCard({ shift, sortKey, isBest }: { shift: ShiftData; sortKey: SortKey; isBest: boolean }) {
  const earningsPerMile = shift.totalEarnings / shift.milesDriven;
  const earningsPerTrip = shift.totalEarnings / shift.trips;
  const earningsPerHour = shift.totalEarnings / shift.hoursWorked;
  const hrs = Math.floor(shift.hoursWorked);
  const mins = Math.round((shift.hoursWorked - hrs) * 60);
  const durationLabel = mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;

  return (
    <div
      className={`relative flex flex-col rounded-2xl border overflow-hidden transition-all duration-200 hover:translate-y-[-2px] w-[380px] shrink-0 ${
        isBest
          ? "border-primary/40 shadow-[0_0_0_1px_rgba(34,197,94,0.15),0_8px_32px_rgba(34,197,94,0.08)]"
          : "border-white/8 shadow-[0_4px_24px_rgba(0,0,0,0.4)]"
      }`}
      style={{ background: "#161b22" }}
    >
      {isBest && (
        <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #22c55e, transparent)" }} />
      )}
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <span className="font-semibold text-foreground text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          {shift.app}
        </span>
        <span className="text-[11px] text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>
          {shift.startTime} – {shift.endTime}
        </span>
      </div>
      <div className="px-5 mb-4">
        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Total Earned
        </div>
        <div className="flex items-end gap-2">
          <span className="text-4xl font-medium leading-none" style={{ fontFamily: "'DM Mono', monospace", color: "#e6edf3" }}>
            ${shift.totalEarnings.toFixed(2)}
          </span>
          <span className="text-sm mb-0.5 font-medium" style={{ color: shift.appColor, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {durationLabel}
          </span>
        </div>
      </div>
      <div className="px-5 pb-5 grid grid-cols-3 gap-2">
        <StatCell label="Hours" value={durationLabel} icon={Clock} sub={`$${earningsPerHour.toFixed(2)}/hr`} highlight={sortKey === "hourly"} />
        <StatCell label="Miles" value={shift.milesDriven.toFixed(1)} icon={MapPin} sub={`$${earningsPerMile.toFixed(2)}/mi`} highlight={sortKey === "perMile"} />
        <StatCell label="Trips" value={String(shift.trips)} icon={Package} sub={`$${earningsPerTrip.toFixed(2)}/trip`} highlight={sortKey === "perTrip"} />
      </div>
    </div>
  );
}

// ── Calendar ──────────────────────────────────────────────────────────────────

const SHIFT_DATES = new Set([25, 27, 28, 29]); // June dates with shifts

function Calendar() {
  // June 2026: starts Monday June 1, 30 days
  const weeks: (number | null)[][] = [];
  // Week 1: Jun 1–7 (Mon=1 … Sun=7)
  weeks.push([1,2,3,4,5,6,7]);
  weeks.push([8,9,10,11,12,13,14]);
  weeks.push([15,16,17,18,19,20,21]);
  weeks.push([22,23,24,25,26,27,28]);
  weeks.push([29,30,null,null,null,null,null]);

  const dayHeaders = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const today = 4; // Jun 4 just for visual reference (today is Jul 4 2026 so June is past)

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 pt-3 pb-2 shrink-0">
        <span className="text-xs font-semibold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          June 2026
        </span>
      </div>
      {/* Day headers */}
      <div className="grid grid-cols-7 px-4 pb-1 shrink-0">
        {dayHeaders.map((d) => (
          <div key={d} className="text-center text-[10px] uppercase tracking-wider text-muted-foreground font-medium" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {d}
          </div>
        ))}
      </div>
      {/* Weeks */}
      <div className="flex flex-col flex-1 px-4 pb-3 gap-0.5">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 flex-1">
            {week.map((day, di) => {
              const hasShift = day !== null && SHIFT_DATES.has(day);
              const isWeekend = di >= 5;
              return (
                <div key={di} className="flex flex-col items-center justify-center gap-0.5">
                  {day !== null ? (
                    <>
                      <span
                        className={`text-xs leading-none ${
                          isWeekend ? "text-foreground/60" : "text-foreground/80"
                        }`}
                        style={{ fontFamily: "'DM Mono', monospace" }}
                      >
                        {day}
                      </span>
                      {hasShift ? (
                        <span className="w-1 h-1 rounded-full bg-primary" />
                      ) : (
                        <span className="w-1 h-1" />
                      )}
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Navbar ────────────────────────────────────────────────────────────────────

function Navbar({ activeNav, setActiveNav }: { activeNav: string; setActiveNav: (s: string) => void }) {
  const links = ["Dashboard", "Shifts", "Weekly", "Sign out"];
  return (
    <nav
      className="h-12 shrink-0 flex items-center justify-between px-6 border-b border-white/[0.07]"
      style={{ background: "#0d1117" }}
    >
      <span className="text-sm font-bold text-foreground tracking-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Delivery Apps Tracking
      </span>
      <div className="flex items-center gap-6">
        {links.map((link) => (
          <button
            key={link}
            onClick={() => setActiveNav(link)}
            className={`text-xs font-medium transition-colors ${
              activeNav === link
                ? "text-foreground"
                : link === "Sign out"
                ? "text-muted-foreground hover:text-foreground/70"
                : "text-muted-foreground hover:text-foreground"
            }`}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {link}
          </button>
        ))}
      </div>
    </nav>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

const sortOptions: { key: SortKey; label: string }[] = [
  { key: "earnings", label: "Total Earned" },
  { key: "hourly", label: "$/Hour" },
  { key: "perMile", label: "$/Mile" },
  { key: "perTrip", label: "$/Trip" },
];

export default function App() {
  const [sortKey, setSortKey] = useState<SortKey>("earnings");
  const [activeNav, setActiveNav] = useState("Weekly");

  const allValues = shifts.map((s) => metricValue(s, sortKey));
  const maxValue = Math.max(...allValues);

  const shiftsByDay: Record<string, ShiftData[]> = {};
  for (const d of DAYS) shiftsByDay[d.name] = [];
  for (const shift of shifts) {
    if (shiftsByDay[shift.dayOfWeek]) shiftsByDay[shift.dayOfWeek].push(shift);
  }

  const weekTotal  = shifts.reduce((s, x) => s + x.totalEarnings, 0);
  const weekMiles  = shifts.reduce((s, x) => s + x.milesDriven, 0);
  const weekTrips  = shifts.reduce((s, x) => s + x.trips, 0);
  const weekHours  = shifts.reduce((s, x) => s + x.hoursWorked, 0);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Navbar activeNav={activeNav} setActiveNav={setActiveNav} />

      {/* Body: left panel + right panel */}
      <div className="flex flex-1 min-h-0">

        {/* ── Left panel (35%) ── */}
        <div className="w-[35%] shrink-0 flex flex-col border-r border-white/[0.07]">

          {/* Chart placeholder (45%) */}
          <div className="h-[45%] shrink-0 border-b border-white/[0.07] flex flex-col p-5">
            <div className="mb-3">
              <div className="text-sm font-semibold text-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Weekly earnings by app
              </div>
              <div className="text-xs text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>
                Jun 23 – Jun 29, 2026
              </div>
            </div>
            {/* Chart area */}
            <div className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center">
              <span className="text-xs text-white/20 italic" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Chart renders here
              </span>
            </div>
            {/* Legend */}
            <div className="flex gap-4 mt-3">
              {[
                { label: "DoorDash", color: "#FF3008" },
                { label: "Instacart", color: "#43B02A" },
                { label: "Uber Eats", color: "#06C167" },
                { label: "Amazon Flex", color: "#FF9900" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: item.color }} />
                  <span className="text-[10px] text-muted-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar (55%) */}
          <div className="h-[55%] overflow-hidden">
            <Calendar />
          </div>
        </div>

        {/* ── Right panel (65%) ── */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* Sort controls */}
          <div className="flex items-center gap-2 px-6 py-3 border-b border-white/[0.07] shrink-0">
            {sortOptions.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSortKey(opt.key)}
                className={`px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all duration-150 ${
                  sortKey === opt.key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary/40 text-muted-foreground border-white/8 hover:border-white/20 hover:text-foreground"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Scrollable day rows */}
          <div className="flex-1 overflow-y-auto">
            {DAYS.map((day, dayIdx) => {
              const dayShifts = shiftsByDay[day.name];
              const isLast = dayIdx === DAYS.length - 1;
              const isWeekend = day.name === "Saturday" || day.name === "Sunday";
              const hasShifts = dayShifts.length > 0;
              const dayTotal = dayShifts.reduce((s, x) => s + x.totalEarnings, 0);

              const sortedDayShifts = [...dayShifts].sort(
                (a, b) => metricValue(b, sortKey) - metricValue(a, sortKey)
              );

              return (
                <div
                  key={day.name}
                  className={`flex items-start ${!isLast ? "border-b border-white/[0.06]" : ""}`}
                >
                  {/* Day label */}
                  <div className={`w-36 shrink-0 py-5 px-6 flex flex-col gap-0.5 ${isWeekend ? "opacity-100" : "opacity-80"}`}>
                    <span className={`text-sm font-semibold ${isWeekend ? "text-foreground" : "text-muted-foreground"}`}>
                      {day.name}
                    </span>
                    <span className="text-[11px] text-muted-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>
                      {day.mmdd}
                    </span>
                    {hasShifts && (
                      <span className="text-[11px] text-primary font-medium mt-1" style={{ fontFamily: "'DM Mono', monospace" }}>
                        ${dayTotal.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Cards */}
                  <div className="flex-1 py-4 px-2 min-h-[72px]">
                    {hasShifts ? (
                      <div className="flex gap-4 flex-wrap">
                        {sortedDayShifts.map((shift) => (
                          <ShiftCard
                            key={shift.app}
                            shift={shift}
                            sortKey={sortKey}
                            isBest={metricValue(shift, sortKey) === maxValue}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center h-full pt-3">
                        <span className="text-xs text-white/15 italic">No shifts logged</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary footer */}
          <div className="shrink-0 border-t border-white/[0.07] px-6 py-3 flex flex-wrap gap-8 bg-white/[0.01]">
            {[
              { label: "Week Total",  value: `$${weekTotal.toFixed(2)}` },
              { label: "Total Miles", value: `${weekMiles.toFixed(1)} mi` },
              { label: "Total Trips", value: String(weekTrips) },
              { label: "Total Hours", value: `${weekHours.toFixed(1)}h` },
              { label: "Avg $/Hour",  value: `$${(weekTotal / weekHours).toFixed(2)}` },
              { label: "Avg $/Mile",  value: `$${(weekTotal / weekMiles).toFixed(2)}` },
            ].map((item) => (
              <div key={item.label} className="flex flex-col gap-0.5">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{item.label}</span>
                <span className="text-sm font-medium text-foreground" style={{ fontFamily: "'DM Mono', monospace" }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
