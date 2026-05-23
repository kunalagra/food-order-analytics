"use client";

import { useMemo, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SpendingByMonth } from "@/lib/analytics";
import { cn } from "@/lib/utils";

interface SpendingChartProps {
  data: SpendingByMonth[];
  title?: string;
}

export function SpendingChart({
  data,
  title = "Monthly Spending",
}: SpendingChartProps) {
  const [selectedYear, setSelectedYear] = useState<string>("last-12");

  const years = useMemo(() => {
    const uniqueYears = Array.from(
      new Set(
        data.map((d) => new Date(`${d.month}-01`).getFullYear().toString()),
      ),
    ).sort((a, b) => b.localeCompare(a));
    return uniqueYears;
  }, [data]);

  const chartData = useMemo(() => {
    let filteredData = data;

    if (selectedYear === "last-12") {
      filteredData = data.slice(-12);
    } else {
      filteredData = data.filter((d) => d.month.startsWith(selectedYear));
    }

    if (filteredData.length === 0) return { bars: [], maxValue: 0 };

    // Fill in missing months for specific year view to always show 12 months
    if (selectedYear !== "last-12") {
      const yearData: typeof filteredData = [];
      for (let i = 0; i < 12; i++) {
        const monthStr = `${selectedYear}-${String(i + 1).padStart(2, "0")}`;
        const existing = filteredData.find((d) => d.month === monthStr);
        yearData.push(
          existing || {
            month: monthStr,
            amount: 0,
            orders: 0,
            year: Number.parseInt(selectedYear, 10),
          },
        );
      }
      filteredData = yearData;
    }

    const maxValue = Math.max(...filteredData.map((d) => d.amount));

    return {
      bars: filteredData.map((d) => ({
        ...d,
        height: maxValue > 0 ? (d.amount / maxValue) * 100 : 0,
        label: new Date(`${d.month}-01`).toLocaleDateString("en-US", {
          month: "short",
        }),
      })),
      maxValue,
    };
  }, [data, selectedYear]);

  if (data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-muted-foreground bg-muted/20 rounded-3xl border border-dashed">
        <p className="text-sm font-medium">No spending data yet</p>
        <p className="text-[10px] opacity-70">
          Sync your accounts to see monthly trends
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 pb-2">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/80">
            {title}
          </h3>
          <p className="text-[10px] text-muted-foreground opacity-70 font-medium">
            {selectedYear === "last-12"
              ? "Last 12 months activity"
              : `Activity for ${selectedYear}`}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/50 mb-0.5">
              Peak
            </p>
            <p className="text-sm font-bold tracking-tight">
              ₹{chartData.maxValue.toLocaleString()}
            </p>
          </div>
          <Select
            value={selectedYear}
            onValueChange={(value) => value && setSelectedYear(value)}
          >
            <SelectTrigger className="w-[110px] h-8 text-xs font-medium bg-muted/50 border-none">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-12">Last 12 Mon</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="h-48 flex items-end gap-3 relative">
        {/* Horizontal Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-[0.03]">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-full border-t border-foreground" />
          ))}
        </div>

        {chartData.bars.map((bar, _i) => (
          <div
            key={bar.month}
            className="flex-1 flex flex-col items-center gap-3 group relative z-10"
          >
            <div className="w-full flex flex-col items-center justify-end h-36">
              <div
                className={cn(
                  "w-full max-w-[32px] rounded-t-lg bg-gradient-to-t from-primary/90 to-primary/40 transition-all duration-500 ease-out group-hover:from-primary group-hover:to-primary/60 cursor-pointer relative",
                  "shadow-[0_-4px_12px_-4px_rgba(var(--primary),0.3)] group-hover:shadow-[0_-4px_20px_-4px_rgba(var(--primary),0.5)]",
                )}
                style={{
                  height: `${bar.height}%`,
                  minHeight: bar.height > 0 ? "6px" : "0",
                }}
              >
                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-foreground text-background px-2.5 py-1.5 rounded-lg text-[10px] font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none transform translate-y-2 group-hover:translate-y-0 z-20 whitespace-nowrap">
                  ₹{bar.amount.toLocaleString()}
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-muted-foreground/60 transition-colors group-hover:text-foreground">
              {bar.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
