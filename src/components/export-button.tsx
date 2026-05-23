"use client";

import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getAllOrders } from "@/lib/order-store";

export function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const orders = await getAllOrders();
      if (orders.length === 0) {
        alert("No orders to export!");
        return;
      }

      // CSV Header
      const headers = [
        "Date",
        "Time",
        "Vendor",
        "Vendor ID",
        "Order ID",
        "Restaurant",
        "Restaurant Locality",
        "Items",
        "Total Cost",
        "Status",
        "Link",
      ];

      // CSV Rows
      const rows = orders.map((order) => {
        const date = new Date(order.orderDate);
        const itemsStr = order.items
          .map((i) => `${i.quantity}x ${i.name}`)
          .join(" | ")
          .replace(/"/g, '""'); // Escape quotes

        return [
          date.toLocaleDateString(),
          date.toLocaleTimeString(),
          order.vendorId, // Vendor
          order.vendorId, // Vendor ID (just to be explicit)
          order.orderId,
          `"${order.restaurant.name.replace(/"/g, '""')}"`,
          `"${(order.restaurant.locality || "").replace(/"/g, '""')}"`,
          `"${itemsStr}"`,
          `"${order.totalCost}"`,
          order.statusLabel,
          order.restaurant.url || "",
        ].join(",");
      });

      const csvContent = [headers.join(","), ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `food_orders_export_${new Date().toISOString().split("T")[0]}.csv`,
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Failed to export orders.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isExporting}
      className="gap-2"
    >
      {isExporting ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Download className="size-4" />
      )}
      Export CSV
    </Button>
  );
}
