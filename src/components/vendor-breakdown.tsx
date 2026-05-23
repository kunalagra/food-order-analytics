"use client";

import { IndianRupee } from "lucide-react";
import { CardContent } from "@/components/ui/card";
import { getAllVendorInfo } from "@/lib/vendors";

interface VendorBreakdownProps {
  spendingByVendor: Record<string, { amount: number; orders: number }>;
}

export function VendorBreakdown({ spendingByVendor }: VendorBreakdownProps) {
  const vendors = getAllVendorInfo();
  const vendorData = vendors
    .map((v) => ({
      ...v,
      amount: spendingByVendor[v.id]?.amount || 0,
      orders: spendingByVendor[v.id]?.orders || 0,
    }))
    .filter((v) => v.orders > 0)
    .sort((a, b) => b.amount - a.amount);

  const totalAmount = vendorData.reduce((sum, v) => sum + v.amount, 0);

  if (vendorData.length === 0) return null;
  if (vendorData.length === 1) return null;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/80">
            Platform Breakdown
          </h3>
          <p className="text-[10px] text-muted-foreground opacity-70 font-medium">
            Spending distribution
          </p>
        </div>
        <div className="flex -space-x-2">
          {vendorData.map((v) => (
            <div
              key={v.id}
              className="size-7 rounded-full border-2 border-background flex items-center justify-center text-xs shadow-sm"
              style={{ backgroundColor: v.color }}
            >
              {v.icon}
            </div>
          ))}
        </div>
      </div>

      <CardContent className="p-0 space-y-8">
        {/* Visual Bar */}
        <div className="h-4 rounded-full overflow-hidden flex bg-muted/30 shadow-inner">
          {vendorData.map((vendor) => {
            const percentage =
              totalAmount > 0 ? (vendor.amount / totalAmount) * 100 : 0;
            if (percentage < 0.5) return null;
            return (
              <div
                key={vendor.id}
                className="h-full transition-all duration-500 relative group first:rounded-l-full last:rounded-r-full"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: vendor.color,
                }}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            );
          })}
        </div>

        {/* Detailed Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-4">
          {vendorData.map((vendor) => {
            const percentage =
              totalAmount > 0 ? (vendor.amount / totalAmount) * 100 : 0;
            return (
              <div key={vendor.id} className="flex items-start gap-3 group">
                <div
                  className="p-2.5 rounded-xl flex items-center justify-center text-lg shadow-sm transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: `${vendor.color}15`,
                    color: vendor.color,
                  }}
                >
                  {vendor.icon}
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wide">
                      {vendor.name}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground">
                      {Math.round(percentage)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm font-bold tracking-tight">
                      <IndianRupee className="size-3 mr-0.5 opacity-70" />
                      {vendor.amount.toLocaleString()}
                    </div>
                    <div className="text-[10px] font-semibold text-muted-foreground opacity-70 px-1.5 py-0.5 rounded bg-muted">
                      {vendor.orders} orders
                    </div>
                  </div>
                  {/* Progress line under each item */}
                  <div className="w-full h-1 bg-muted/40 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 delay-300"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: vendor.color,
                        opacity: 0.6,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </div>
  );
}
