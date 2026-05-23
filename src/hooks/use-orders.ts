"use client";

import { useCallback, useRef, useState } from "react";
import { useCredentials } from "@/lib/credentials-context";
import type { Order, PaginatedOrders } from "@/lib/vendors/types";

interface UseOrdersOptions {
  vendorId: string;
}

interface UseOrdersReturn {
  orders: Order[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  hasFetched: boolean;
  fetchOrders: () => Promise<void>;
  loadMore: () => Promise<void>;
  reset: () => void;
}

export function useOrders({ vendorId }: UseOrdersOptions): UseOrdersReturn {
  const { credentials } = useCredentials();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);
  const [pagination, setPagination] = useState({
    totalCount: 0,
    currentPage: 0,
    totalPages: 0,
    hasMore: false,
  });

  // Use ref to track if a fetch is in progress to prevent duplicate calls
  const isFetchingRef = useRef(false);

  const fetchPage = useCallback(
    async (page: number, append = false) => {
      const vendorCreds = credentials[vendorId];

      if (!vendorCreds?.cookie) {
        setError("No credentials configured for this vendor");
        return;
      }

      try {
        const response = await fetch(
          `/api/vendors/${vendorId}/orders?page=${page}`,
          {
            headers: {
              "X-Vendor-Cookie": vendorCreds.cookie,
            },
          },
        );

        if (!response.ok) {
          const data = await response.json();
          throw new Error(
            data.error || `Failed to fetch orders (${response.status})`,
          );
        }

        const data: PaginatedOrders = await response.json();

        setOrders((prev) => (append ? [...prev, ...data.orders] : data.orders));
        setPagination({
          totalCount: data.totalCount,
          currentPage: data.currentPage,
          totalPages: data.totalPages,
          hasMore: data.hasMore,
        });
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch orders");
      }
    },
    [vendorId, credentials],
  );

  const fetchOrders = useCallback(async () => {
    // Prevent duplicate fetches
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;
    setIsLoading(true);
    setHasFetched(true);
    await fetchPage(1);
    setIsLoading(false);
    isFetchingRef.current = false;
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !pagination.hasMore) return;

    setIsLoadingMore(true);
    await fetchPage(pagination.currentPage + 1, true);
    setIsLoadingMore(false);
  }, [fetchPage, pagination.currentPage, pagination.hasMore, isLoadingMore]);

  const reset = useCallback(() => {
    setOrders([]);
    setError(null);
    setHasFetched(false);
    setPagination({
      totalCount: 0,
      currentPage: 0,
      totalPages: 0,
      hasMore: false,
    });
  }, []);

  return {
    orders,
    isLoading,
    isLoadingMore,
    error,
    hasFetched,
    ...pagination,
    fetchOrders,
    loadMore,
    reset,
  };
}
