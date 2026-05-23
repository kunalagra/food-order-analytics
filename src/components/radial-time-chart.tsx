"use client";

import { useState } from "react";

interface RadialTimeChartProps {
  hourlyActivity: number[]; // Array of 24 numbers (0-23 hours)
}

export function RadialTimeChart({ hourlyActivity }: RadialTimeChartProps) {
  const total = hourlyActivity.reduce((acc, curr) => acc + curr, 0);
  const maxVal = Math.max(...hourlyActivity, 1); // Avoid division by zero
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

  // Constants for geometry
  const size = 300;
  const center = size / 2;
  const innerRadius = 50;
  const outerRadius = 140;
  const maxBarHeight = outerRadius - innerRadius;

  // Generate segments for each hour
  const segments = hourlyActivity.map((count, hour) => {
    // 0 hours is at top (rotate -90 deg)
    // Each hour is 360 / 24 = 15 degrees
    const startAngle = hour * 15;
    const endAngle = (hour + 1) * 15;

    // Convert to radians, subtracting 90 degrees to start at top
    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    // Padding between bars
    const padding = 2 * (Math.PI / 180); // 2 degrees padding
    const paddedStart = startRad + padding / 2;
    const paddedEnd = endRad - padding / 2;

    // Calculate bar height based on activity
    // Use a minimum height for visibility if there's any activity
    const normalizedActivity = count / maxVal;
    // Non-linear scaling to make smaller values more visible
    const visualScore = count > 0 ? Math.max(0.1, normalizedActivity) : 0;

    const barHeight = visualScore * maxBarHeight;
    const radius = innerRadius + barHeight;

    // Path calculation
    const x1 = center + innerRadius * Math.cos(paddedStart);
    const y1 = center + innerRadius * Math.sin(paddedStart);
    const x2 = center + radius * Math.cos(paddedStart);
    const y2 = center + radius * Math.sin(paddedStart);
    const x3 = center + radius * Math.cos(paddedEnd);
    const y3 = center + radius * Math.sin(paddedEnd);
    const x4 = center + innerRadius * Math.cos(paddedEnd);
    const y4 = center + innerRadius * Math.sin(paddedEnd);

    // Hit area path (full outer radius) for consistent hover interaction
    const hx2 = center + outerRadius * Math.cos(paddedStart);
    const hy2 = center + outerRadius * Math.sin(paddedStart);
    const hx3 = center + outerRadius * Math.cos(paddedEnd);
    const hy3 = center + outerRadius * Math.sin(paddedEnd);

    const hitPath = `M ${x1} ${y1} L ${hx2} ${hy2} A ${outerRadius} ${outerRadius} 0 0 1 ${hx3} ${hy3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1} Z`;

    return {
      hour,
      count,
      path: `M ${x1} ${y1} L ${x2} ${y2} A ${radius} ${radius} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${innerRadius} ${innerRadius} 0 0 0 ${x1} ${y1} Z`,
      hitPath,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      color:
        count > 0
          ? hoveredHour === hour
            ? "#3b82f6" // Highlighting color on hover
            : `rgba(59, 130, 246, ${0.4 + normalizedActivity * 0.6})`
          : "rgba(226, 232, 240, 0.4)", // Blue opacity or slate-200
    };
  });

  const displayHour =
    hoveredHour !== null
      ? hoveredHour
      : hourlyActivity.indexOf(Math.max(...hourlyActivity));
  const displayCount = hourlyActivity[displayHour];
  const displayPercentage =
    total > 0 ? Math.round((displayCount / total) * 100) : 0;

  return (
    <div className="relative flex flex-col items-center justify-center p-4">
      <div className="relative aspect-square w-full max-w-[300px]">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full h-full"
          aria-label="Hourly Activity Chart"
        >
          <title>Hourly Activity Radial Chart</title>
          {/* Background Grid - segmented circles */}
          <circle
            cx={center}
            cy={center}
            r={innerRadius}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.1}
            strokeWidth={1}
          />
          <circle
            cx={center}
            cy={center}
            r={outerRadius}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.05}
            strokeWidth={1}
            strokeDasharray="4 4"
          />

          {/* Segments */}
          {segments.map((segment) => (
            <g key={segment.hour}>
              {/* Visual Bar */}
              <path
                d={segment.path}
                fill={segment.color}
                className="transition-all duration-200 pointer-events-none"
              />
              {/* Hit Area - Transparent but interactive */}
              {/* biome-ignore lint/a11y/noStaticElementInteractions: this acts as a hit area for the chart segment */}
              <path
                d={segment.hitPath}
                fill="transparent"
                className="cursor-crosshair hover:fill-black/5" // Optional: subtle hover effect on the track itself
                onMouseEnter={() => setHoveredHour(segment.hour)}
                onMouseLeave={() => setHoveredHour(null)}
              >
                <title>{`${segment.hour}:00 - ${segment.count} orders (${segment.percentage}%)`}</title>
              </path>
            </g>
          ))}

          {/* Center Labels */}
          <g
            className="text-[10px] font-bold fill-current text-muted-foreground"
            style={{ textAnchor: "middle", dominantBaseline: "middle" }}
          >
            <text x={center} y={center - innerRadius + 15} dy="0">
              00
            </text>
            <text x={center + innerRadius - 15} y={center} dx="0">
              06
            </text>
            <text x={center} y={center + innerRadius - 15} dy="0">
              12
            </text>
            <text x={center - innerRadius + 15} y={center} dx="0">
              18
            </text>
          </g>

          {/* Center Data Display using foreignObject for HTML text layout */}
          <foreignObject
            x={center - 35}
            y={center - 35}
            width={70}
            height={70}
            className="pointer-events-none"
          >
            <div className="flex flex-col items-center justify-center w-full h-full text-center leading-none">
              <div className="text-[10px] uppercase font-bold text-muted-foreground mb-0.5">
                {hoveredHour !== null ? "Orders" : "Peak"}
              </div>
              <div className="text-xl font-bold text-foreground">
                {displayCount}
              </div>
              <div className="text-[9px] font-medium text-muted-foreground opacity-80 mt-0.5">
                {displayPercentage}%
              </div>
            </div>
          </foreignObject>
        </svg>
      </div>

      <div className="mt-4 text-center h-12">
        <p className="text-sm font-medium text-muted-foreground">
          {hoveredHour !== null ? "Selected time" : "Most active time"}
        </p>
        <p className="text-lg font-bold">
          {`${String(displayHour).padStart(2, "0")}:00 - ${String(displayHour + 1).padStart(2, "0")}:00`}
        </p>
      </div>
    </div>
  );
}
