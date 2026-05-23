"use client";

import { Combobox } from "@base-ui/react/combobox";
import {
  ChevronDown,
  Database,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MasonryGrid } from "@/components/masonry-grid";
import { OrderCard } from "@/components/order-card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { VendorIcon } from "@/components/vendor-icon";
import { useCredentials } from "@/lib/credentials-context";
import { getAllOrders } from "@/lib/order-store";
import { cn } from "@/lib/utils";
import { getAllVendorInfo } from "@/lib/vendors";
import type { Order } from "@/lib/vendors/types";

interface OrderListProps {
  vendorId?: string; // Optional: filter by vendor, if not provided shows all
}

function OrderCardSkeleton() {
  return (
    <div className="rounded-xl ring-1 ring-foreground/10 p-4 space-y-4">
      <div className="flex items-start gap-4">
        <Skeleton className="size-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-8 w-full rounded-lg" />
      </div>
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-6 w-20" />
        </div>
        <div className="space-y-1 text-right">
          <Skeleton className="h-3 w-16 ml-auto" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
    </div>
  );
}

import { useRouter, useSearchParams } from "next/navigation";

export function OrderList({ vendorId: initialVendorId }: OrderListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { accounts, hasCredentials: _hasCredentials } = useCredentials();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [displayCount, setDisplayCount] = useState(30);

  // Filter states
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [restaurantFilter, setRestaurantFilter] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const vendors = getAllVendorInfo();
  const hasAnyCredentials = accounts.length > 0;

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const allOrders = await getAllOrders();
      setOrders(allOrders);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Initialize filters from URL
  useEffect(() => {
    const restaurantParam = searchParams.get("restaurant");
    if (restaurantParam) {
      setSearchQuery(restaurantParam);
    }
  }, [searchParams]);

  useEffect(() => {
    if (
      initialVendorId &&
      initialVendorId !== "all" &&
      accounts.length > 0 &&
      selectedAccountIds.length === 0
    ) {
      const vendorAccounts = accounts
        .filter((a) => a.vendorId === initialVendorId)
        .map((a) => a.id);
      if (vendorAccounts.length > 0) {
        setSelectedAccountIds(vendorAccounts);
      }
    }
  }, [initialVendorId, accounts, selectedAccountIds.length]);

  const uniqueRestaurants = useMemo(() => {
    const names = new Set(orders.map((o) => o.restaurant.name));
    return Array.from(names).sort();
  }, [orders]);

  // Computed filtered orders
  const filteredOrders = useMemo(() => {
    return orders
      .filter((order) => {
        // Search filter
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          const restaurantMatch = order.restaurant.name
            .toLowerCase()
            .includes(query);
          const itemMatch = order.items.some((item) =>
            item.name.toLowerCase().includes(query),
          );
          if (!restaurantMatch && !itemMatch) return false;
        }

        // Restaurant filter
        if (restaurantFilter && order.restaurant.name !== restaurantFilter) {
          return false;
        }

        // Account filter
        if (
          selectedAccountIds.length > 0 &&
          !selectedAccountIds.includes(order.accountId)
        )
          return false;

        // Date range filter
        // Fix date parsing to ensure correct local time comparison
        const orderDate = new Date(order.orderDate);
        orderDate.setHours(0, 0, 0, 0);

        if (startDate) {
          const start = new Date(startDate);
          // Reset time to start of day
          start.setHours(0, 0, 0, 0);
          if (orderDate < start) return false;
        }

        if (endDate) {
          const end = new Date(endDate);
          // Set time to end of day
          end.setHours(23, 59, 59, 999);
          if (orderDate > end) return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "amount-desc":
          case "amount-asc": {
            const priceA = Number.parseFloat(
              a.totalCost.replace(/[^0-9.]/g, ""),
            );
            const priceB = Number.parseFloat(
              b.totalCost.replace(/[^0-9.]/g, ""),
            );
            return sortBy === "amount-desc" ? priceB - priceA : priceA - priceB;
          }
          case "date-asc":
            return (
              new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()
            );
          default:
            return (
              new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
            );
        }
      });
  }, [
    orders,
    searchQuery,
    selectedAccountIds,
    startDate,
    endDate,
    restaurantFilter,
    sortBy,
  ]);

  const handleLoadMore = () => {
    setDisplayCount(filteredOrders.length);
  };

  const displayedOrders = filteredOrders.slice(0, displayCount);
  const hasMore = displayCount < filteredOrders.length;

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("");
    setRestaurantFilter("");
    setSelectedAccountIds([]);
    setStartDate("");
    setEndDate("");
  };

  const isFiltered =
    searchQuery !== "" ||
    restaurantFilter !== "" ||
    selectedAccountIds.length > 0 ||
    startDate !== "" ||
    endDate !== "";

  // Not connected state
  if (!hasAnyCredentials) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="size-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
          <Database className="size-10 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No Accounts Connected</h3>
        <p className="text-muted-foreground max-w-sm mb-8">
          Link your Zomato or Swiggy accounts in the settings to start tracking
          your culinary journey.
        </p>
        <Link
          href="/accounts"
          className={cn(
            buttonVariants({ size: "lg", variant: "default" }),
            "rounded-xl",
          )}
        >
          Connect Accounts
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Filters Bar */}
      {/* Filters Bar */}
      <div className="sticky top-0 z-20 py-4 bg-background/80 backdrop-blur-xl border-b space-y-4">
        <div className="flex flex-col lg:flex-row items-center gap-4">
          {/* Search - Shrinkable */}
          <div className="relative flex-1 min-w-0 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search restaurants or items..."
              className="pl-10 h-11 bg-muted/50 border-none focus-visible:ring-1 ring-primary/20 rounded-xl w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Sort Dropdown - Always Visible */}
          <Select value={sortBy} onValueChange={(val) => val && setSortBy(val)}>
            <SelectTrigger className="h-11 w-[160px] bg-muted/50 border-none rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="amount-desc">Highest Amount</SelectItem>
              <SelectItem value="amount-asc">Lowest Amount</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={isFilterExpanded ? "default" : "outline"}
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            className="h-11 px-6 rounded-xl gap-2 font-medium transition-all"
          >
            <SlidersHorizontal className="size-4" />
            Filters
            {isFiltered && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 min-w-5">
                {
                  [
                    restaurantFilter,
                    selectedAccountIds.length > 0,
                    startDate || endDate,
                  ].filter(Boolean).length
                }
              </Badge>
            )}
            <ChevronDown
              className={cn(
                "size-4 ml-1 transition-transform duration-200",
                isFilterExpanded && "rotate-180",
              )}
            />
          </Button>
        </div>

        {/* Collapsible Filters */}
        {isFilterExpanded && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-muted/20 rounded-2xl border border-border/10">
            {/* Restaurant Filter */}
            <div className="space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-wider ml-1">
                Restaurant
              </div>
              <Combobox.Root
                value={restaurantFilter}
                onValueChange={(val) => setRestaurantFilter(val || "")}
                items={["", ...uniqueRestaurants]}
              >
                <div className="relative group w-full">
                  <Combobox.Input
                    placeholder="All Restaurants"
                    className="w-full h-10 bg-background border border-border/50 rounded-lg pl-3 pr-16 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary/30 placeholder:text-muted-foreground/50"
                  />
                  <div className="absolute right-0 top-0 h-10 flex items-center pr-1 gap-0.5">
                    <Combobox.Clear className="p-1.5 rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-muted transition-colors opacity-0 group-focus-within:opacity-100 data-[empty]:hidden">
                      <X className="size-3.5" />
                    </Combobox.Clear>
                    <Combobox.Trigger className="p-1.5 rounded-md text-muted-foreground/50 hover:text-foreground hover:bg-muted transition-colors">
                      <ChevronDown className="size-4" />
                    </Combobox.Trigger>
                  </div>
                </div>

                <Combobox.Portal>
                  <Combobox.Positioner
                    align="start"
                    sideOffset={8}
                    className="z-50 outline-none"
                  >
                    <Combobox.Popup className="w-[var(--anchor-width)] min-w-[200px] max-h-[300px] bg-background border border-border/50 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 origin-top">
                      <Combobox.Empty className="hidden data-[empty]:block data-[empty]:p-4 text-xs text-muted-foreground text-center">
                        No restaurant found.
                      </Combobox.Empty>
                      <Combobox.List className="p-1 overflow-y-auto max-h-[290px] space-y-0.5">
                        {(item: string) => (
                          <Combobox.Item
                            key={item}
                            value={item}
                            className="flex items-center px-2 py-2 text-sm rounded-lg cursor-default outline-none data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary transition-colors"
                          >
                            <span
                              className={cn(
                                "truncate",
                                !item && "font-medium text-muted-foreground",
                              )}
                            >
                              {item || "All Restaurants"}
                            </span>
                          </Combobox.Item>
                        )}
                      </Combobox.List>
                    </Combobox.Popup>
                  </Combobox.Positioner>
                </Combobox.Portal>
              </Combobox.Root>
            </div>

            {/* Account Filter */}
            <div className="space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-wider ml-1">
                Account
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="outline"
                      className="w-full h-10 bg-background border-border/50 rounded-lg justify-between px-3 text-sm font-normal"
                    >
                      <span className="truncate">
                        {selectedAccountIds.length === 0
                          ? "All Accounts"
                          : `${selectedAccountIds.length} Selected`}
                      </span>
                      <ChevronDown className="size-4 opacity-50 shrink-0 ml-2" />
                    </Button>
                  }
                />
                <DropdownMenuContent
                  className="w-[200px] rounded-xl p-1.5"
                  align="start"
                >
                  {accounts.map((acc) => {
                    const vendor = vendors.find((v) => v.id === acc.vendorId);
                    const isSelected = selectedAccountIds.includes(acc.id);
                    return (
                      <DropdownMenuCheckboxItem
                        key={acc.id}
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedAccountIds((prev) => [...prev, acc.id]);
                          } else {
                            setSelectedAccountIds((prev) =>
                              prev.filter((id) => id !== acc.id),
                            );
                          }
                        }}
                        onSelect={(e) => e.preventDefault()}
                        className="rounded-lg gap-2"
                      >
                        <VendorIcon icon={vendor?.icon} size="sm" />
                        <span className="flex-1 truncate">{acc.name}</span>
                      </DropdownMenuCheckboxItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Date Range */}
            <div className="space-y-1.5">
              <div className="text-[10px] uppercase font-bold text-muted-foreground/70 tracking-wider ml-1">
                Date Range
              </div>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-10 bg-background border-border/50 rounded-lg w-full text-xs px-2"
                    placeholder="Start"
                  />
                </div>
                <div className="relative flex-1">
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-10 bg-background border-border/50 rounded-lg w-full text-xs px-2"
                    placeholder="End"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {isFiltered && (
          <div className="flex items-center gap-3 animate-in slide-in-from-top-2 duration-300 py-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 whitespace-nowrap">
              Active Filters
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {searchQuery && (
                <Badge
                  variant="secondary"
                  className="pl-1.5 pr-2 h-7 gap-1.5 rounded-lg border-none bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <X
                    className="size-3.5 cursor-pointer opacity-70 hover:opacity-100"
                    onClick={() => setSearchQuery("")}
                  />
                  <span className="text-[11px] font-medium tracking-tight whitespace-nowrap">
                    Search: {searchQuery}
                  </span>
                </Badge>
              )}
              {restaurantFilter && (
                <Badge
                  variant="secondary"
                  className="pl-1.5 pr-2 h-7 gap-1.5 rounded-lg border-none bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <X
                    className="size-3.5 cursor-pointer opacity-70 hover:opacity-100"
                    onClick={() => setRestaurantFilter("")}
                  />
                  <span className="text-[11px] font-medium tracking-tight whitespace-nowrap">
                    {restaurantFilter}
                  </span>
                </Badge>
              )}
              {selectedAccountIds.length > 0 && (
                <Badge
                  variant="secondary"
                  className="pl-1.5 pr-2 h-7 gap-1.5 rounded-lg border-none bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <X
                    className="size-3.5 cursor-pointer opacity-70 hover:opacity-100"
                    onClick={() => setSelectedAccountIds([])}
                  />
                  <span className="text-[11px] font-medium tracking-tight whitespace-nowrap">
                    {selectedAccountIds.length}{" "}
                    {selectedAccountIds.length === 1 ? "Account" : "Accounts"}
                  </span>
                </Badge>
              )}
              {(startDate || endDate) && (
                <Badge
                  variant="secondary"
                  className="pl-1.5 pr-2 h-7 gap-1.5 rounded-lg border-none bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <X
                    className="size-3.5 cursor-pointer opacity-70 hover:opacity-100"
                    onClick={() => {
                      setStartDate("");
                      setEndDate("");
                    }}
                  />
                  <span className="text-[11px] font-medium tracking-tight whitespace-nowrap">
                    {startDate
                      ? new Date(startDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })
                      : "Start"}
                    {" → "}
                    {endDate
                      ? new Date(endDate).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        })
                      : "Now"}
                  </span>
                </Badge>
              )}
              <Button
                variant="ghost"
                className="h-7 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                onClick={resetFilters}
              >
                Clear All
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <OrderCardSkeleton key={i} />
          ))}
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-6 max-w-full px-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              Found {filteredOrders.length}{" "}
              {filteredOrders.length === 1 ? "order" : "orders"}
            </p>
          </div>
          <MasonryGrid className="w-full">
            {displayedOrders.map((order) => (
              // biome-ignore lint/a11y/useSemanticElements: Using div to avoid hydration errors with nested interactive elements
              <div
                key={order.id}
                role="button"
                tabIndex={0}
                className="block cursor-pointer hover:opacity-80 transition-opacity w-full outline-none focus-visible:ring-2 ring-primary rounded-xl"
                onClick={() => router.push(`/orders/${order.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/orders/${order.id}`);
                  }
                }}
              >
                <OrderCard
                  order={order}
                  showAccountBadge={
                    selectedAccountIds.length !== 1 && accounts.length > 1
                  }
                />
              </div>
            ))}
          </MasonryGrid>

          {hasMore && (
            <div className="flex justify-center pt-8 pb-12">
              <Button
                onClick={handleLoadMore}
                variant="outline"
                size="lg"
                className="rounded-2xl px-12 h-14 bg-muted/20 hover:bg-muted/40 transition-colors"
              >
                <ChevronDown className="size-4 mr-2" />
                Load All Remaining ({filteredOrders.length - displayCount}{" "}
                orders)
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="size-20 rounded-full bg-muted/50 flex items-center justify-center mb-6">
            <Search className="size-10 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Matching Orders</h3>
          <p className="text-muted-foreground max-w-sm mb-8">
            Try adjusting your search or filters to find what you're looking
            for.
          </p>
          {isFiltered && (
            <Button onClick={resetFilters} variant="outline" size="lg">
              Reset Filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
