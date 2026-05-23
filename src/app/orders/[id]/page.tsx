"use client";

import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  Receipt,
  Store,
} from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrderById } from "@/lib/order-store";
import type { Order } from "@/lib/vendors/types";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (typeof params.id === "string") {
        try {
          const data = await getOrderById(params.id);
          setOrder(data || null);
        } catch (error) {
          console.error("Failed to fetch order:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchOrder();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full size-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-muted-foreground">Order not found</p>
        <Button variant="outline" onClick={() => router.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "cancelled":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "preparing":
        return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header / Navigation */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-8 w-8"
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Order Details</h1>
          <p className="text-muted-foreground text-sm">ID: {order.orderId}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Receipt Card */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-sm shadow-black/5">
            <CardHeader className="border-b pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <Badge
                    variant="outline"
                    className={`border-none ${getStatusColor(order.status)}`}
                  >
                    {order.statusLabel || order.status}
                  </Badge>
                  <CardTitle className="text-xl pt-2">
                    {order.restaurant.name}
                  </CardTitle>
                  <div className="flex items-center text-sm text-muted-foreground gap-1.5">
                    <MapPin className="size-3.5" />
                    <span>
                      {order.restaurant.locality || "Unknown Location"}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{order.totalCost}</p>
                  <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mt-1">
                    {order.vendorId}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {/* Order Items */}
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2 text-sm">
                    <Receipt className="size-4 text-muted-foreground" />
                    Items
                  </h3>
                  <div className="divide-y border rounded-xl overflow-hidden">
                    {order.items.map((item, idx) => (
                      <div
                        key={`${item.name}-${idx}`}
                        className="flex items-center justify-between p-4 bg-muted/10 hover:bg-muted/20 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Badge
                            variant="secondary"
                            className="h-6 w-6 flex items-center justify-center p-0 rounded-md"
                          >
                            {item.quantity}
                          </Badge>
                          <span className="font-medium text-sm">
                            {item.name}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Info Grid */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      Ordered On
                    </p>
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 text-muted-foreground" />
                      <span className="font-medium">
                        {new Date(order.orderDate).toLocaleDateString(
                          undefined,
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      Time
                    </p>
                    <div className="flex items-center gap-2">
                      <Clock className="size-4 text-muted-foreground" />
                      <span className="font-medium">
                        {new Date(order.orderDate).toLocaleTimeString(
                          undefined,
                          {
                            hour: "numeric",
                            minute: "2-digit",
                          },
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm shadow-black/5">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Store className="size-4 text-primary" />
                Restaurant Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.restaurant.imageUrl && (
                <div className="aspect-video rounded-lg overflow-hidden bg-muted relative">
                  <Image
                    src={order.restaurant.imageUrl}
                    alt={order.restaurant.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-1 border-b">
                  <span className="text-muted-foreground">Rating</span>
                  <span className="font-medium">
                    {order.restaurant.rating || "N/A"}
                  </span>
                </div>
                <div className="pt-2">
                  <p className="text-muted-foreground text-xs mb-1">Address</p>
                  <p className="font-medium leading-normal">
                    {order.restaurant.address || order.restaurant.locality}
                  </p>
                </div>
              </div>

              {order.restaurant.url && (
                <Button
                  className="w-full gap-2 mt-2"
                  variant="outline"
                  onClick={() => window.open(order.restaurant.url, "_blank")}
                >
                  View on {order.vendorId} <ExternalLink className="size-3" />
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm shadow-black/5 bg-primary/5 dark:bg-primary/10">
            <CardContent className="pt-6">
              <div className="text-center space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Want to see more orders from here?
                </p>
                <Button
                  className="w-full"
                  onClick={() =>
                    router.push(
                      `/orders?restaurant=${encodeURIComponent(order.restaurant.name)}`,
                    )
                  }
                >
                  Filter Orders
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
