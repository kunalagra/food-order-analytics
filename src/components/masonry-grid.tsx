"use client";

import { Children, type ReactNode, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface MasonryGridProps {
  children: ReactNode;
  className?: string;
}

export function MasonryGrid({ children, className }: MasonryGridProps) {
  const [columns, setColumns] = useState(1);

  useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width >= 1280) {
        setColumns(4); // xl
      } else if (width >= 1024) {
        setColumns(3); // lg
      } else if (width >= 640) {
        setColumns(2); // sm
      } else {
        setColumns(1); // default
      }
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  const columnWrapper = useMemo(() => {
    const cols: ReactNode[][] = Array.from({ length: columns }, () => []);
    const childrenArray = Children.toArray(children);

    childrenArray.forEach((child, i) => {
      cols[i % columns].push(child);
    });

    return cols;
  }, [children, columns]);

  return (
    <div className={cn("flex gap-6 items-start", className)}>
      {columnWrapper.map((col, i) => {
        return (
          <div key={i} className="flex-1 flex flex-col gap-6 min-w-0">
            {col}
          </div>
        );
      })}
    </div>
  );
}
