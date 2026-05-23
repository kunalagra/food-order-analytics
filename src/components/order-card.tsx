"use client";

import { ChevronDown, ChevronUp, MapPin, RotateCcw, Star } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VendorIcon } from "@/components/vendor-icon";
import { useCredentials } from "@/lib/credentials-context";
import { getAllVendorInfo } from "@/lib/vendors";
import type { Order } from "@/lib/vendors/types";

interface OrderCardProps {
  order: Order;
  showAccountBadge?: boolean;
}

function getStatusVariant(
  status: string,
): "default" | "secondary" | "destructive" | "outline" | "success" {
  const s = status.toLowerCase();
  switch (s) {
    case "delivered":
      return "success";
    case "cancelled":
      return "destructive";
    case "out_for_delivery":
    case "preparing":
      return "secondary";
    default:
      return "outline";
  }
}

function getVendorInfo(vendorId: string) {
  return getAllVendorInfo().find((v) => v.id === vendorId);
}

export function OrderCard({ order, showAccountBadge = true }: OrderCardProps) {
  const { accounts } = useCredentials();
  const [isExpanded, setIsExpanded] = useState(false);
  const statusVariant = getStatusVariant(order.status);
  const accountInfo = accounts.find((a) => a.id === order.accountId);
  const hasMultipleItems = order.items.length > 2;
  const visibleItems = isExpanded ? order.items : order.items.slice(0, 2);

  return (
    <Card className="group relative overflow-hidden bg-card hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 border-none ring-1 ring-foreground/5 hover:ring-primary/20">
      <CardHeader className="pb-3 border-b border-muted/50">
        <div className="flex items-start gap-3">
          {order.restaurant.imageUrl ? (
            <Image
              src={order.restaurant.imageUrl}
              alt={order.restaurant.name}
              width={40}
              height={40}
              className="size-10 rounded-xl object-cover ring-1 ring-foreground/5 shrink-0"
            />
          ) : (
            <div className="size-10 rounded-xl bg-muted/30 flex items-center justify-center text-lg shrink-0">
              🍽️
            </div>
          )}
          <div className="flex-1 min-w-0 pr-2">
            <CardTitle className="text-base font-extrabold tracking-tight leading-snug break-words">
              {order.restaurant.url ? (
                <a
                  href={order.restaurant.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {order.restaurant.name}
                </a>
              ) : (
                order.restaurant.name
              )}
            </CardTitle>
            <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-1 text-[11px] text-muted-foreground font-medium">
              {order.restaurant.rating && (
                <span className="flex items-center gap-0.5 text-amber-500 shrink-0">
                  <Star className="size-3 fill-current" />
                  {order.restaurant.rating}
                </span>
              )}
              {order.restaurant.locality && (
                <span className="flex items-center gap-0.5 min-w-0">
                  <MapPin className="size-3 opacity-60 shrink-0" />
                  <span className="break-words line-clamp-1">
                    {order.restaurant.locality}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        {showAccountBadge && accountInfo && (
          <div className="mt-3 flex items-center gap-2">
            <Badge
              variant="outline"
              className="h-6 gap-1.5 rounded-lg bg-muted/30 border-none text-[10px] font-bold uppercase tracking-wider"
            >
              <VendorIcon
                icon={getVendorInfo(order.vendorId)?.icon}
                size="sm"
              />
              {accountInfo.name}
            </Badge>
          </div>
        )}
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Items Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              Items
            </span>
            <span className="text-[10px] font-bold text-muted-foreground/60">
              {order.items.length} {order.items.length === 1 ? "Item" : "Items"}
            </span>
          </div>
          <div className="space-y-1.5">
            {visibleItems.map((item, idx) => (
              <div
                key={`${item.name}-${idx}`}
                className="flex items-center justify-between text-xs py-2 px-2.5 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors group/item"
              >
                <span className="truncate flex-1 font-medium text-foreground/80 group-hover/item:text-foreground transition-colors">
                  {item.name}
                </span>
                <span className="ml-3 shrink-0 font-bold text-[10px] px-1.5 py-0.5 rounded-md bg-foreground/5 text-muted-foreground">
                  ×{item.quantity}
                </span>
              </div>
            ))}
          </div>
          {hasMultipleItems && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 hover:text-foreground transition-colors group"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="size-3 mr-1.5 group-hover:-translate-y-0.5 transition-transform" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="size-3 mr-1.5 group-hover:translate-y-0.5 transition-transform" />
                  + {order.items.length - 2} more
                </>
              )}
            </Button>
          )}
        </div>

        {/* Info & CTA Section */}
        <div className="pt-4 border-t border-muted/50">
          <div className="flex items-end justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                  Total Amount
                </span>
              </div>
              <div className="text-2xl font-black tracking-tight text-foreground/90 tabular-nums">
                {order.totalCost}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1">
                Date
              </div>
              <div className="text-xs font-semibold text-muted-foreground whitespace-nowrap">
                {order.orderDateFormatted.split("at")[0]}
              </div>
              <div className="text-[10px] font-medium text-muted-foreground/50">
                {order.orderDateFormatted.split("at")[1]}
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Actions Row */}
        <div className="flex items-center justify-between pt-1">
          {order.reorderUrl ? (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-[11px] font-bold text-primary/70 hover:text-primary transition-colors"
              onClick={(e) => e.stopPropagation()}
              nativeButton={false}
              render={
                <a
                  href={order.reorderUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">Reorder</span>
                </a>
              }
            >
              Re-order
              <RotateCcw className="size-3 ml-1.5" />
            </Button>
          ) : (
            <div />
          )}

          <Badge
            variant={statusVariant}
            className="shadow-sm px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold ml-auto"
          >
            {order.statusLabel}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
