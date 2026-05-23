"use client";

import { ArrowUpDown, Search } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TopRestaurant } from "@/lib/analytics";
import { getAllVendorInfo } from "@/lib/vendors";

interface RestaurantsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurants: TopRestaurant[];
}

type SortField = "orders" | "spent" | "name";
type SortOrder = "asc" | "desc";

export function RestaurantsDialog({
  open,
  onOpenChange,
  restaurants,
}: RestaurantsDialogProps) {
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("orders");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  const vendors = getAllVendorInfo();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const sortedAndFiltered = useMemo(() => {
    let filtered = restaurants;
    if (search) {
      const q = search.toLowerCase();
      filtered = restaurants.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.locality?.toLowerCase().includes(q),
      );
    }

    return [...filtered].sort((a, b) => {
      let valA: string | number = "";
      let valB: string | number = "";

      switch (sortField) {
        case "name":
          valA = a.name;
          valB = b.name;
          break;
        case "orders":
          valA = a.orders;
          valB = b.orders;
          break;
        case "spent":
          valA = a.totalSpent;
          valB = b.totalSpent;
          break;
      }

      if (sortOrder === "asc") {
        return valA > valB ? 1 : -1;
      }
      return valA < valB ? 1 : -1;
    });
  }, [restaurants, search, sortField, sortOrder]);

  const getVendor = (id: string) => vendors.find((v) => v.id === id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>All Restaurants ({restaurants.length})</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-4 py-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Search restaurants..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto border rounded-md">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead
                  onClick={() => handleSort("name")}
                  className="cursor-pointer hover:bg-muted/50"
                >
                  Restaurant{" "}
                  {sortField === "name" && (
                    <ArrowUpDown className="size-3 inline ml-1" />
                  )}
                </TableHead>
                <TableHead
                  onClick={() => handleSort("orders")}
                  className="cursor-pointer hover:bg-muted/50 text-right"
                >
                  Orders{" "}
                  {sortField === "orders" && (
                    <ArrowUpDown className="size-3 inline ml-1" />
                  )}
                </TableHead>
                <TableHead
                  onClick={() => handleSort("spent")}
                  className="cursor-pointer hover:bg-muted/50 text-right"
                >
                  Total Spent{" "}
                  {sortField === "spent" && (
                    <ArrowUpDown className="size-3 inline ml-1" />
                  )}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedAndFiltered.map((restaurant) => {
                const vendor = getVendor(restaurant.vendorId);
                return (
                  <TableRow key={`${restaurant.vendorId}-${restaurant.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {restaurant.imageUrl ? (
                          <Image
                            src={restaurant.imageUrl}
                            alt={restaurant.name}
                            width={40}
                            height={40}
                            className="size-10 rounded-lg object-cover bg-muted"
                          />
                        ) : (
                          <div className="size-10 rounded-lg bg-muted flex items-center justify-center text-lg">
                            🍽️
                          </div>
                        )}
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {restaurant.name}
                            {vendor && (
                              <Badge
                                variant="outline"
                                className="h-4 px-1 text-[10px]"
                                style={{
                                  borderColor: vendor.color,
                                  color: vendor.color,
                                }}
                              >
                                {vendor.icon}
                              </Badge>
                            )}
                          </div>
                          {restaurant.locality && (
                            <div className="text-xs text-muted-foreground">
                              {restaurant.locality}
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium">{restaurant.orders}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-medium">
                        ₹{restaurant.totalSpent.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ₹
                        {Math.round(
                          restaurant.totalSpent / restaurant.orders,
                        ).toLocaleString()}{" "}
                        / order
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {sortedAndFiltered.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No restaurants found matching "{search}"
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
