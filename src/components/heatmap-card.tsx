"use client";

import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyActivity } from "@/lib/analytics";

interface HeatmapCardProps {
  data: DailyActivity[];
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function HeatmapCard({ data }: HeatmapCardProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday

  // Generate grid for calendar
  const calendarDays = useMemo(() => {
    const days = [];
    // Empty slots for start of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    // Days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  }, [daysInMonth, firstDayOfMonth]);

  // Lookup map for easy access
  const activityMap = useMemo(() => {
    const map: Record<number, DailyActivity> = {};
    data.forEach((item) => {
      const d = new Date(item.date);
      if (d.getMonth() === currentMonth && d.getFullYear() === currentYear) {
        map[d.getDate()] = item;
      }
    });
    return map;
  }, [data, currentMonth, currentYear]);

  // Max count for scaling intensity
  const maxCount = useMemo(() => {
    return Math.max(...Object.values(activityMap).map((d) => d.count), 1);
  }, [activityMap]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
  };

  const getColorClass = (count: number) => {
    if (count === 0) return "bg-muted/50";
    const intensity = count / maxCount;
    if (intensity < 0.25) return "bg-green-200 dark:bg-green-900";
    if (intensity < 0.5) return "bg-green-300 dark:bg-green-700";
    if (intensity < 0.75) return "bg-green-400 dark:bg-green-600";
    return "bg-green-500 dark:bg-green-500";
  };

  return (
    <Card className="border-none shadow-sm shadow-black/5 bg-background h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Calendar className="size-4 text-blue-500" />
          Order Activity
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={handlePrevMonth}
          >
            <ChevronLeft className="size-3" />
          </Button>
          <span className="text-xs font-semibold w-20 text-center">
            {MONTHS[currentMonth].slice(0, 3)} {currentYear}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="size-6"
            onClick={handleNextMonth}
          >
            <ChevronRight className="size-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2 mt-2">
          {[
            { id: "sun", label: "S" },
            { id: "mon", label: "M" },
            { id: "tue", label: "T" },
            { id: "wed", label: "W" },
            { id: "thu", label: "T" },
            { id: "fri", label: "F" },
            { id: "sat", label: "S" },
          ].map((d) => (
            <div
              key={d.id}
              className="text-muted-foreground text-[10px] font-medium"
            >
              {d.label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} />;
            }

            const activity = activityMap[day];
            const count = activity?.count || 0;
            const spent = activity?.spent || 0;

            return (
              <div
                key={day}
                className={`
                                    aspect-square rounded-sm flex flex-col items-center justify-center relative group cursor-default transition-colors
                                    ${getColorClass(count)}
                                `}
              >
                <span
                  className={`text-[10px] ${count > 0 ? "font-bold opacity-80" : "text-muted-foreground opacity-50"}`}
                >
                  {day}
                </span>

                {/* Tooltip */}
                {count > 0 && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 w-max pointer-events-none">
                    <div className="bg-popover text-popover-foreground text-xs rounded-md shadow-md p-2 border">
                      <div className="font-semibold">
                        {MONTHS[currentMonth]} {day}
                      </div>
                      <div>{count} orders</div>
                      <div>₹{spent.toLocaleString()}</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2 mt-4 text-[10px] text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-0.5">
            <div className="size-2 rounded-[1px] bg-green-200 dark:bg-green-900" />
            <div className="size-2 rounded-[1px] bg-green-300 dark:bg-green-700" />
            <div className="size-2 rounded-[1px] bg-green-400 dark:bg-green-600" />
            <div className="size-2 rounded-[1px] bg-green-500 dark:bg-green-500" />
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}
