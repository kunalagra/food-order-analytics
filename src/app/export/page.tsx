"use client";

import { Download, FileDown, Loader2 } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCredentials } from "@/lib/credentials-context";
import { downloadCSV, ordersToCSV } from "@/lib/export-utils";
import { getAllOrders } from "@/lib/order-store";

export default function ExportPage() {
  const { accounts } = useCredentials();
  const [isExporting, setIsExporting] = useState(false);
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const allOrders = await getAllOrders();

      // Filter by Date Range
      const filteredOrders = allOrders.filter((order) => {
        const orderDate = new Date(order.orderDate);
        // Reset times for date-only comparison
        orderDate.setHours(0, 0, 0, 0);

        if (date?.from) {
          const from = new Date(date.from);
          from.setHours(0, 0, 0, 0);
          if (orderDate < from) return false;
        }

        if (date?.to) {
          const to = new Date(date.to);
          to.setHours(23, 59, 59, 999);
          if (orderDate > to) return false;
        }

        return true;
      });

      if (filteredOrders.length === 0) {
        alert("No orders found for the selected range!");
        return;
      }

      const csv = ordersToCSV(filteredOrders);
      const fromStr = date?.from
        ? date.from.toISOString().split("T")[0]
        : "start";
      const toStr = date?.to ? date.to.toISOString().split("T")[0] : "now";
      const fileName = `food-orders-${fromStr}-to-${toStr}.csv`;
      downloadCSV(csv, fileName);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export orders.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto py-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Export Data</h1>
        <p className="text-muted-foreground">
          Download your order history for external analysis
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileDown className="size-5" />
            Export Settings
          </CardTitle>
          <CardDescription>
            Select a date range to export your order history in CSV format.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 flex flex-col items-center">
          <div className="w-full max-w-sm">
            <DateRangePicker date={date} setDate={setDate} />
          </div>

          <div className="w-full pt-4 flex justify-end">
            <Button
              size="lg"
              onClick={handleExport}
              disabled={isExporting || accounts.length === 0}
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Generating CSV...
                </>
              ) : (
                <>
                  <Download className="mr-2 size-4" />
                  Download CSV
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="bg-muted/30 rounded-xl p-4 text-xs text-muted-foreground text-center">
        <p>
          The exported CSV includes order date, vendor, restaurant details, item
          breakdown, and total cost.
        </p>
      </div>
    </div>
  );
}
