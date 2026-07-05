import type { ElementType } from "react";

interface StatCellProps {
  label: string;
  value: string;
  icon: ElementType;
  sub: string;
}

/** Small labeled stat tile shared by ShiftCard and AppTotalsCard. */
export function StatCell({ label, value, icon: Icon, sub }: StatCellProps) {
  return (
    <div className="flex flex-col gap-[3px] border border-white/5 bg-secondary/60 px-[10px] py-[5px]">
      <div className="flex items-center gap-[5px] text-muted-foreground">
        <Icon size={9} strokeWidth={2} />
        <span className="text-[8.5px] font-medium tracking-widest uppercase">{label}</span>
      </div>
      <span className="font-mono text-[15px] leading-none font-normal whitespace-nowrap text-foreground">
        {value}
      </span>
      <span className="mt-[2px] text-[10px] text-muted-foreground">{sub}</span>
    </div>
  );
}
