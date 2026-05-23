import type { Order } from "@/lib/vendors/types";

/**
 * Convert orders to CSV string
 */
export function ordersToCSV(orders: Order[]): string {
  const headers = [
    "Date",
    "Time",
    "Vendor",
    "Order ID",
    "Restaurant",
    "Locality",
    "Items",
    "Total Cost",
    "Status",
    "Link",
  ];

  const rows = orders.map((order) => {
    const date = new Date(order.orderDate);
    const itemsStr = order.items
      .map((i) => `${i.quantity}x ${i.name}`)
      .join(" | ")
      .replace(/"/g, '""'); // Escape quotes

    return [
      date.toLocaleDateString(),
      date.toLocaleTimeString(),
      order.vendorId.charAt(0).toUpperCase() + order.vendorId.slice(1),
      order.orderId,
      `"${order.restaurant.name.replace(/"/g, '""')}"`,
      `"${(order.restaurant.locality || "").replace(/"/g, '""')}"`,
      `"${itemsStr}"`,
      `"${order.totalCost}"`,
      order.statusLabel || order.status,
      order.restaurant.url || "",
    ].join(",");
  });

  return [headers.join(","), ...rows].join("\n");
}

/**
 * Trigger browser download of CSV file
 */
export function downloadCSV(csvContent: string, fileName: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
