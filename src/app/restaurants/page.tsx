"use client";

import { ArrowRight, IndianRupee, Search, Store } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Analytics, computeAnalytics } from "@/lib/analytics";
import { CredentialsProvider } from "@/lib/credentials-context";
import { getAllOrders } from "@/lib/order-store";
import { getAllVendorInfo } from "@/lib/vendors";

function RestaurantsContent() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"spent" | "orders" | "avg">("spent");

  const vendors = getAllVendorInfo();
  const getVendor = (id: string) => vendors.find((v) => v.id === id);

  const loadData = useCallback(async () => {
    try {
      const orders = await getAllOrders();
      const computed = computeAnalytics(orders);
      setAnalytics(computed);
    } catch (error) {
      console.error("Failed to load restaurants:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="size-12 rounded-full bg-muted animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">
            Loading restaurants...
          </p>
        </div>
      </div>
    );
  }

  if (!analytics || analytics.allRestaurants.length === 0) {
    return (
      <div className="py-20 text-center bg-muted/20 rounded-3xl border border-dashed">
        <Store className="size-12 text-muted-foreground mx-auto mb-4 opacity-20" />
        <p className="text-lg font-bold">No restaurants found</p>
        <p className="text-sm text-muted-foreground">
          Sync your orders to see your favorite places
        </p>
      </div>
    );
  }

  const filteredRestaurants = analytics.allRestaurants.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const sortedRestaurants = [...filteredRestaurants].sort((a, b) => {
    if (sortBy === "orders") return b.orders - a.orders;
    if (sortBy === "avg")
      return b.totalSpent / b.orders - a.totalSpent / a.orders;
    return b.totalSpent - a.totalSpent;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Top Places</h1>
          <p className="text-muted-foreground">
            The restaurants you love (and spend) the most on
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search places..."
              className="pl-9 bg-muted/50 border-none rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            value={sortBy}
            onValueChange={(v) => {
              if (v) setSortBy(v as "spent" | "orders" | "avg");
            }}
          >
            <SelectTrigger className="w-[140px] bg-muted/50 border-none rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="spent">Total Spent</SelectItem>
              <SelectItem value="orders">Order Count</SelectItem>
              <SelectItem value="avg">Avg Value</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sortedRestaurants.map((restaurant, i) => {
          const vendor = getVendor(restaurant.vendorId);
          return (
            <Card
              key={`${restaurant.vendorId}-${restaurant.id}`}
              className="overflow-hidden border-none shadow-sm shadow-black/5 bg-background hover:shadow-md transition-all group"
            >
              <CardContent className="p-0">
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {restaurant.imageUrl ? (
                        <Image
                          src={restaurant.imageUrl}
                          alt={restaurant.name}
                          width={40}
                          height={40}
                          className="size-10 rounded-xl object-cover shadow-sm bg-muted group-hover:scale-110 transition-transform"
                        />
                      ) : (
                        <div className="size-10 rounded-xl bg-muted flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                          🍽️
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-bold text-sm truncate pr-2 group-hover:text-primary transition-colors">
                          {restaurant.name}
                        </h3>
                        {vendor && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <span
                              className="text-[10px] font-bold uppercase tracking-tight"
                              style={{ color: vendor.color }}
                            >
                              {vendor.name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {i < 3 && (
                      <div className="p-1 px-2 rounded-lg bg-amber-100 text-amber-600 text-[10px] font-black uppercase tracking-tighter shadow-sm">
                        Top {i + 1}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                        Total Spent
                      </p>
                      <p className="text-sm font-black tracking-tight flex items-center">
                        <IndianRupee className="size-3 mr-0.5 opacity-70" />
                        {restaurant.totalSpent.toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-0.5 text-right">
                      <p className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                        Orders
                      </p>
                      <p className="text-sm font-black tracking-tight">
                        {restaurant.orders}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-muted/50">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">
                        Avg / Order
                      </span>
                      <span className="text-[11px] font-bold">
                        ₹
                        {Math.round(
                          restaurant.totalSpent / restaurant.orders,
                        ).toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full h-1 bg-muted/40 rounded-full mb-4 overflow-hidden">
                      <div
                        className="h-full bg-primary/40 rounded-full"
                        style={{
                          width: `${Math.min(100, (restaurant.orders / analytics.totalOrders) * 500)}%`,
                        }}
                      />
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs h-8 font-semibold bg-primary/5 border-primary/10 hover:bg-primary/10 hover:text-primary transition-colors"
                      onClick={() =>
                        router.push(
                          `/orders?restaurant=${encodeURIComponent(restaurant.name)}`,
                        )
                      }
                    >
                      View Orders{" "}
                      <ArrowRight className="size-3 ml-2 opacity-50" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default function RestaurantsPage() {
  return (
    <CredentialsProvider>
      <RestaurantsContent />
    </CredentialsProvider>
  );
}
