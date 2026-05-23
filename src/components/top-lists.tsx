import { ChefHat, ShoppingBag, Trophy } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TopItem, TopRestaurant } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { getAllVendorInfo } from "@/lib/vendors";

interface TopRestaurantsListProps {
  restaurants: TopRestaurant[];
  onViewAll?: () => void;
}

export function TopRestaurantsList({
  restaurants,
  onViewAll,
}: TopRestaurantsListProps) {
  const router = useRouter();
  const vendors = getAllVendorInfo();
  const getVendor = (id: string) => vendors.find((v) => v.id === id);

  if (restaurants.length === 0) {
    return (
      <Card className="border-none shadow-sm shadow-black/5 bg-background">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ChefHat className="size-4 text-primary" />
            Top Restaurants
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm font-medium italic opacity-60">
            No restaurant data found yet...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm shadow-black/5 bg-background overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-6">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
            <ChefHat className="size-4" />
          </div>
          Top Restaurants
        </CardTitle>
        {onViewAll && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground"
            onClick={onViewAll}
          >
            View All
          </Button>
        )}
      </CardHeader>
      <CardContent className="px-6 pb-6 space-y-5">
        {restaurants.slice(0, 5).map((restaurant, i) => {
          const vendor = getVendor(restaurant.vendorId);
          const isFirst = i === 0;
          return (
            <div
              key={`${restaurant.vendorId}-${restaurant.id}`}
              className="flex items-center gap-4 group cursor-default"
            >
              <div
                className={cn(
                  "size-10 rounded-xl flex items-center justify-center overflow-hidden shrink-0 transition-transform group-hover:scale-110 shadow-sm",
                  isFirst
                    ? "bg-amber-100 text-amber-600 shadow-[0_0_15px_rgba(251,191,36,0.2)]"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {restaurant.imageUrl ? (
                  <Image
                    src={restaurant.imageUrl}
                    alt={restaurant.name}
                    width={40}
                    height={40}
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="text-xs font-black">
                    {isFirst ? <Trophy className="size-4" /> : i + 1}
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="font-bold text-sm tracking-tight truncate group-hover:text-primary transition-colors">
                    {restaurant.name}
                  </p>
                  {vendor && (
                    <div
                      className="px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter"
                      style={{
                        backgroundColor: `${vendor.color}15`,
                        color: vendor.color,
                      }}
                    >
                      {vendor.name}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wide">
                  <span className="flex items-center text-foreground/80">
                    ₹{restaurant.totalSpent.toLocaleString()}
                  </span>
                  <span className="opacity-30">•</span>
                  <button
                    type="button"
                    className="hover:text-primary hover:underline cursor-pointer transition-colors bg-transparent border-none p-0 h-auto font-inherit"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(
                        `/orders?restaurant=${encodeURIComponent(restaurant.name)}`,
                      );
                    }}
                  >
                    {restaurant.orders} orders
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

interface TopItemsListProps {
  items: TopItem[];
}

export function TopItemsList({ items }: TopItemsListProps) {
  // Filter items with only 1 order unless that's all we have
  const filteredItems =
    items.length > 5 ? items.filter((i) => i.quantity > 1) : items;
  const displayItems = filteredItems.length > 0 ? filteredItems : items;

  if (items.length === 0) {
    return (
      <Card className="border-none shadow-sm shadow-black/5 bg-background h-full">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShoppingBag className="size-4 text-orange-500" />
            Most Ordered
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm font-medium italic opacity-60">
            No item data yet...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-sm shadow-black/5 bg-background overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-4 shrink-0">
        <CardTitle className="text-base font-bold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-100 text-orange-600">
              <ShoppingBag className="size-4" />
            </div>
            Most Ordered
          </div>
          <Badge
            variant="outline"
            className="text-[10px] font-normal text-muted-foreground"
          >
            {displayItems.length} items
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-0 overflow-y-auto max-h-full">
        <div className="divide-y">
          {displayItems.map((item, i) => (
            <div
              key={item.name}
              className="flex items-center gap-4 px-6 py-3 hover:bg-muted/30 transition-colors group cursor-default"
            >
              <div className="size-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-black shrink-0 group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm tracking-tight truncate group-hover:text-orange-600 transition-colors">
                  {item.name}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-wide">
                  {item.orders} orders
                </div>
                <div className="px-2 py-1 rounded-lg bg-muted text-[11px] font-black group-hover:bg-orange-500 group-hover:text-white transition-all transform group-hover:scale-105 min-w-[40px] text-center">
                  × {item.quantity}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
