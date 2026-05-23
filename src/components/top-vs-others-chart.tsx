"use client";

import { PieChart } from "lucide-react";
import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TopVsOthersChartProps {
  topRestaurantsSpent: number;
  totalSpent: number;
}

export function TopVsOthersChart({
  topRestaurantsSpent,
  totalSpent,
}: TopVsOthersChartProps) {
  const data = useMemo(() => {
    if (totalSpent === 0) return null;

    const othersSpent = Math.max(0, totalSpent - topRestaurantsSpent);
    const topPercentage = Math.round((topRestaurantsSpent / totalSpent) * 100);
    const othersPercentage = 100 - topPercentage;

    return {
      top: topPercentage,
      others: othersPercentage,
      othersSpent,
    };
  }, [topRestaurantsSpent, totalSpent]);

  if (!data) return null;

  return (
    <Card className="border-none shadow-sm shadow-black/5 bg-background h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <PieChart className="size-4 text-emerald-500" />
          Spend Concentration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center pt-4 pb-2">
          {/* CSS Custom Donut Chart */}
          <div
            className="relative size-40 rounded-full flex items-center justify-center"
            style={{
              background: `conic-gradient(var(--primary) ${data.top}%, #e2e8f0 0)`,
            }}
          >
            <div className="absolute inset-2 bg-background rounded-full flex flex-col items-center justify-center text-center p-2">
              <span className="text-3xl font-bold tracking-tighter text-foreground">
                {data.top}%
              </span>
              <span className="text-[10px] uppercase font-bold text-muted-foreground/60 leading-tight">
                on your top
                <br />5 places
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mt-8 w-full">
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">
                Top 5 Places
              </p>
              <p className="text-lg font-bold text-primary">
                ₹{topRestaurantsSpent.toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">
                Testing Others
              </p>
              <p className="text-lg font-bold text-slate-400">
                ₹{data.othersSpent.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
