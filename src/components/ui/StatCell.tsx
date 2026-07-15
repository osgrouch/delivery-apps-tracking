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
    <div className="flex flex-col gap-[2px] border border-white/5 bg-secondary/60 px-[8px] py-[4px] md:gap-[3px] md:px-[10px] md:py-[5px]">
      <div className="flex items-center gap-[4px] text-muted-foreground md:gap-[5px]">
        <Icon className="h-[7px] w-[7px] md:h-[9px] md:w-[9px]" strokeWidth={2} />
        <span className="text-[7px] font-medium tracking-widest uppercase md:text-[8.5px]">{label}</span>
      </div>
      <span className="font-mono text-[12px] leading-none font-normal whitespace-nowrap text-foreground md:text-[15px]">
        {value}
      </span>
      <span className="mt-[2px] text-[8px] text-muted-foreground md:text-[10px]">{sub}</span>
    </div>
  );
}
