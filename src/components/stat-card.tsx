import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    label: string;
  };
  onClick?: () => void;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
  onClick,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden relative border-none shadow-sm shadow-black/5 bg-gradient-to-br from-background to-muted/20 hover:shadow-md transition-all duration-300 group",
        onClick && "cursor-pointer active:scale-[0.98]",
      )}
      onClick={onClick}
    >
      {/* Subtle Accent Glow */}
      <div
        className="absolute -top-12 -right-12 size-32 rounded-full opacity-[0.03] group-hover:opacity-[0.06] transition-opacity blur-3xl"
        style={{ backgroundColor: color }}
      />

      <CardContent className="p-6 relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div
            className="size-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shadow-sm"
            style={{ backgroundColor: `${color}15`, color }}
          >
            {icon}
          </div>
          {trend && (
            <div
              className={cn(
                "flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-tight",
                trend.value >= 0
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-red-500/10 text-red-500",
              )}
            >
              {trend.value > 0 ? "+" : ""}
              {trend.value}%
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
            {title}
          </p>
          <div className="text-3xl font-bold tracking-tight">{value}</div>
          {subtitle && (
            <p className="text-[11px] font-medium text-muted-foreground line-clamp-1 opacity-80">
              {subtitle}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
