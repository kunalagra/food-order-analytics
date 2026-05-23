"use client";

import { RadialTimeChart } from "@/components/radial-time-chart";
import type { TimeOfDayStats } from "@/lib/analytics";

interface TimeAnalysisProps {
  stats: TimeOfDayStats;
  hourlyActivity?: number[];
}

export function TimeAnalysis({ stats, hourlyActivity }: TimeAnalysisProps) {
  const total = stats.morning + stats.afternoon + stats.evening + stats.night;

  if (total === 0) return null;

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/80">
          Time Preference
        </h3>
        <p className="text-[10px] text-muted-foreground opacity-70 font-medium">
          When you order most
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center min-h-[300px]">
        {hourlyActivity ? (
          <RadialTimeChart hourlyActivity={hourlyActivity} />
        ) : (
          <div className="text-sm text-muted-foreground">Loading chart...</div>
        )}
      </div>

      <div className="mt-4 pt-6 border-t border-border/50">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
          {/* Summary stats if needed below */}
        </div>
      </div>
    </div>
  );
}
