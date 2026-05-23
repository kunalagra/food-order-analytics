"use client";

import {
  ArrowDown,
  ArrowLeft,
  Calendar,
  Flame,
  IndianRupee,
  ShoppingBag,
  Store,
  TrendingUp,
  Trophy,
  Utensils,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { HeatmapCard } from "@/components/heatmap-card";
import { SpendingChart } from "@/components/spending-chart";
import { StatCard } from "@/components/stat-card";
import { TimeAnalysis } from "@/components/time-analysis";
import { TopItemsList, TopRestaurantsList } from "@/components/top-lists";
import { TopVsOthersChart } from "@/components/top-vs-others-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VendorBreakdown } from "@/components/vendor-breakdown";
import { type Analytics, computeAnalytics } from "@/lib/analytics";
import { getAllOrders } from "@/lib/order-store";

export function InsightsDashboard() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orderCount, setOrderCount] = useState(0);

  // Dialog states

  const loadAnalytics = useCallback(async () => {
    try {
      const orders = await getAllOrders();
      setOrderCount(orders.length);
      const computed = computeAnalytics(orders);
      setAnalytics(computed);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const _handleSyncComplete = () => {
    loadAnalytics();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="size-12 rounded-full bg-muted animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading insights...</p>
        </div>
      </div>
    );
  }

  const _trendVsLastMonth =
    analytics && analytics.lastMonthSpent > 0
      ? Math.round(
          ((analytics.thisMonthSpent - analytics.lastMonthSpent) /
            analytics.lastMonthSpent) *
            100,
        )
      : 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            {orderCount > 0
              ? `Analyzing ${orderCount.toLocaleString()} orders across all platforms`
              : "Sync your orders to see insights"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* {orderCount > 0 && <ExportButton />} moved to /export */}
        </div>
      </div>

      {orderCount === 0 ? (
        <Card className="py-20 border-dashed">
          <CardContent className="flex flex-col items-center justify-center text-center">
            <div className="size-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
              <TrendingUp className="size-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No Data Available</h2>
            <p className="text-muted-foreground max-w-md mb-8">
              Connect your food delivery accounts and sync your orders to see
              spending insights, top restaurants, and more.
            </p>
            <div className="flex gap-4">
              <Link href="/orders">
                <Button variant="outline" size="lg">
                  <ArrowLeft className="size-4 mr-2" />
                  Connect Accounts
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        analytics && (
          <>
            {/* Summary Stats */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Spent"
                value={`₹${analytics.totalSpent.toLocaleString()}`}
                subtitle="Life-time expenditure"
                icon={<IndianRupee className="size-5 text-primary" />}
                color="#E23744"
              />
              <StatCard
                title="Total Orders"
                value={analytics.totalOrders}
                subtitle={`₹${analytics.averageOrderValue.toLocaleString()} average order`}
                icon={<ShoppingBag className="size-5 text-amber-500" />}
                color="#FC8019"
                onClick={() => router.push("/orders")}
              />
              <StatCard
                title="Unique Dishes"
                value={analytics.totalUniqueItems}
                subtitle="different items tried"
                icon={<Utensils className="size-5 text-purple-500" />}
                color="#A855F7"
              />
              <StatCard
                title="Restaurants"
                value={analytics.allRestaurants.length}
                subtitle="unique culinary spots"
                icon={<Store className="size-5 text-emerald-500" />}
                color="#22C55E"
                onClick={() => router.push("/restaurants")}
              />
            </div>

            {/* Insights Row */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {/* Summary Cards */}
              <Card className="overflow-hidden border-none shadow-sm bg-muted/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <IndianRupee className="size-4 text-primary" />
                    Avg. Order Value
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold tracking-tight">
                    ₹{analytics.averageOrderValue.toLocaleString()}
                  </p>
                </CardContent>
              </Card>

              {analytics.highestOrder && (
                <Card
                  className="overflow-hidden border-none shadow-sm bg-muted/30 cursor-pointer hover:bg-muted/40 transition-colors"
                  onClick={() =>
                    router.push(`/orders/${analytics.highestOrder?.id}`)
                  }
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Trophy className="size-4 text-yellow-500" />
                      Highest Order
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold tracking-tight">
                      {analytics.highestOrder.totalCost}
                    </p>
                    <p className="text-sm text-muted-foreground truncate font-medium">
                      {analytics.highestOrder.restaurant.name}
                    </p>
                  </CardContent>
                </Card>
              )}

              {analytics.lowestOrder && (
                <Card
                  className="overflow-hidden border-none shadow-sm bg-muted/30 cursor-pointer hover:bg-muted/40 transition-colors"
                  onClick={() =>
                    router.push(`/orders/${analytics.lowestOrder?.id}`)
                  }
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <ArrowDown className="size-4 text-emerald-500" />
                      Lowest Order
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold tracking-tight">
                      {analytics.lowestOrder.totalCost}
                    </p>
                    <p className="text-sm text-muted-foreground truncate font-medium">
                      {analytics.lowestOrder.restaurant.name}
                    </p>
                  </CardContent>
                </Card>
              )}

              {analytics.longestStreak && analytics.longestStreak.days > 1 ? (
                <Card className="overflow-hidden border-none shadow-sm bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Flame className="size-4 text-orange-500" />
                      Longest Streak
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold tracking-tight">
                      {analytics.longestStreak.days} days
                    </p>
                    <p className="text-sm text-muted-foreground font-medium">
                      consecutive ordering
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="overflow-hidden border-none shadow-sm bg-muted/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Calendar className="size-4 text-purple-500" />
                      Most Active Day
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics.mostActiveDay ? (
                      <>
                        <p className="text-3xl font-bold tracking-tight">
                          {analytics.mostActiveDay.day}
                        </p>
                        <p className="text-sm text-muted-foreground font-medium">
                          {analytics.mostActiveDay.orders} orders
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Not enough data
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Masonry Layout - 3 Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
              {/* Column 1 */}
              <div className="space-y-6">
                <Card className="border-none shadow-sm shadow-black/5 bg-muted/10">
                  <SpendingChart data={analytics.spendingByMonth} />
                </Card>
                <Card className="border-none shadow-sm shadow-black/5 bg-muted/10">
                  <TimeAnalysis
                    stats={analytics.timeOfDay}
                    hourlyActivity={analytics.hourlyActivity}
                  />
                </Card>
              </div>

              {/* Column 2 */}
              <div className="space-y-6">
                <div className="h-[420px]">
                  <HeatmapCard data={analytics.dailyActivity} />
                </div>
                <div className="h-[320px]">
                  <TopVsOthersChart
                    topRestaurantsSpent={analytics.topRestaurants.reduce(
                      (acc, curr) => acc + curr.totalSpent,
                      0,
                    )}
                    totalSpent={analytics.totalSpent}
                  />
                </div>

                {/* Yearly Analytics Moved Here */}
                {analytics.spendingByYear.length > 1 && (
                  <Card className="border-none shadow-sm shadow-black/5 bg-muted/10">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        <Calendar className="size-4 text-blue-500" />
                        Yearly Analytics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {analytics.spendingByYear.map((year) => (
                        <div
                          key={year.year}
                          className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-transparent hover:border-border hover:bg-background transition-all"
                        >
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              {year.year}
                            </p>
                            <Badge
                              variant="secondary"
                              className="px-2 py-0.5 text-[10px] mt-1"
                            >
                              {year.orders} orders
                            </Badge>
                          </div>
                          <p className="text-lg font-bold tracking-tight">
                            ₹{year.amount.toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Column 3 */}
              <div className="space-y-6">
                {Object.values(analytics.spendingByVendor).filter(
                  (v) => v.orders > 0,
                ).length > 1 && (
                  <Card className="border-none shadow-sm shadow-black/5 bg-muted/10">
                    <VendorBreakdown
                      spendingByVendor={analytics.spendingByVendor}
                    />
                  </Card>
                )}
                <TopRestaurantsList
                  restaurants={analytics.topRestaurants}
                  onViewAll={() => router.push("/restaurants")}
                />
                <div className="h-[600px]">
                  <TopItemsList items={analytics.allItems} />
                </div>
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
}
