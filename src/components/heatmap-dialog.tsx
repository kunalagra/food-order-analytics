"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { DailyActivity } from "@/lib/analytics";

interface HeatmapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function HeatmapDialog({
  open,
  onOpenChange,
  data,
}: HeatmapDialogProps) {
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Order Activity</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="size-4" />
          </Button>
          <div className="font-semibold">
            {MONTHS[currentMonth]} {currentYear}
          </div>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-sm mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-muted-foreground text-xs font-medium"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-day-${idx}`} />;
            }

            const activity = activityMap[day];
            const count = activity?.count || 0;
            const spent = activity?.spent || 0;

            return (
              <div
                key={day}
                className={`
                                    aspect-square rounded-md flex flex-col items-center justify-center relative group cursor-default transition-colors
                                    ${getColorClass(count)}
                                `}
              >
                <span
                  className={`text-xs ${count > 0 ? "font-semibold" : "text-muted-foreground"}`}
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

        <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="size-3 rounded-sm bg-muted/50" />
            <div className="size-3 rounded-sm bg-green-200 dark:bg-green-900" />
            <div className="size-3 rounded-sm bg-green-300 dark:bg-green-700" />
            <div className="size-3 rounded-sm bg-green-400 dark:bg-green-600" />
            <div className="size-3 rounded-sm bg-green-500 dark:bg-green-500" />
          </div>
          <span>More</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
