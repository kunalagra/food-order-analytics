import {
  getLatestOrderId,
  getOrdersByAccount,
  saveOrders,
  updateSyncStatus,
} from "@/lib/order-store";
import { getAllVendorInfo, getVendor } from "@/lib/vendors";
import type { Account, Order } from "@/lib/vendors/types";

export interface SyncProgress {
  vendorId: string;
  accountId: string;
  vendorName: string;
  accountName: string;
  currentPage: number;
  totalPages: number;
  ordersLoaded: number;
  totalOrders: number;
  newOrdersFound: number;
  status: "idle" | "syncing" | "complete" | "error" | "stopped";
  error?: string;
}

export interface SyncOptions {
  accounts: Account[];
  forceFullSync?: boolean;
  onProgress?: (progress: SyncProgress) => void;
}

/**
 * Sync orders from a specific account with incremental sync support
 */
export async function syncAccount(
  account: Account,
  options: SyncOptions,
): Promise<SyncProgress> {
  const vendorId = account.vendorId;
  const vendor = getVendor(vendorId);
  const vendorInfo = getAllVendorInfo().find((v) => v.id === vendorId);

  if (!vendor || !vendorInfo) {
    return {
      vendorId,
      accountId: account.id,
      vendorName: vendorId,
      accountName: account.name,
      currentPage: 0,
      totalPages: 0,
      ordersLoaded: 0,
      totalOrders: 0,
      newOrdersFound: 0,
      status: "error",
      error: `Unknown vendor: ${vendorId}`,
    };
  }

  if (!account.credentials.cookie) {
    return {
      vendorId,
      accountId: account.id,
      vendorName: vendorInfo.name,
      accountName: account.name,
      currentPage: 0,
      totalPages: 0,
      ordersLoaded: 0,
      totalOrders: 0,
      newOrdersFound: 0,
      status: "error",
      error: "No credentials configured",
    };
  }

  // Get the last known order ID for incremental sync for THIS account
  const lastKnownOrderId = options.forceFullSync
    ? null
    : await getLatestOrderId(account.id);

  let progress: SyncProgress = {
    vendorId,
    accountId: account.id,
    vendorName: vendorInfo.name,
    accountName: account.name,
    currentPage: 0,
    totalPages: 0,
    ordersLoaded: 0,
    totalOrders: 0,
    newOrdersFound: 0,
    status: "syncing",
  };

  try {
    let page = 1;
    let hasMore = true;
    let foundExistingOrder = false;
    const allNewOrders: Order[] = [];

    while (hasMore && !foundExistingOrder) {
      // Fetch page from API
      const response = await fetch(
        `/api/vendors/${vendorId}/orders?page=${page}`,
        {
          headers: {
            "X-Vendor-Cookie": account.credentials.cookie,
          },
        },
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `API error: ${response.status}`);
      }

      const data = await response.json();

      progress = {
        ...progress,
        currentPage: page,
        totalPages: data.totalPages,
        totalOrders: data.totalCount,
      };

      // Process orders - tag with accountId and stop if we find one we already have
      const newOrders: Order[] = [];
      for (const order of data.orders) {
        if (lastKnownOrderId && order.orderId === lastKnownOrderId) {
          foundExistingOrder = true;
          break;
        }
        // Attaching the local account info to the order
        newOrders.push({
          ...order,
          accountId: account.id,
        });
      }

      // Save new orders to IndexedDB
      if (newOrders.length > 0) {
        await saveOrders(newOrders);
        allNewOrders.push(...newOrders);
      }

      progress = {
        ...progress,
        ordersLoaded: progress.ordersLoaded + data.orders.length,
        newOrdersFound: allNewOrders.length,
        status: foundExistingOrder ? "stopped" : "syncing",
      };

      options.onProgress?.(progress);

      hasMore = data.hasMore;
      page++;

      if (hasMore && !foundExistingOrder) {
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }

    const accountOrders = await getOrdersByAccount(account.id);
    const totalStored = accountOrders.length;
    const latestOrderId =
      allNewOrders.length > 0 ? allNewOrders[0].orderId : lastKnownOrderId;

    await updateSyncStatus(account.id, vendorId, latestOrderId, totalStored);

    progress = {
      ...progress,
      status: "complete",
      ordersLoaded: totalStored,
    };

    options.onProgress?.(progress);
    return progress;
  } catch (error) {
    progress = {
      ...progress,
      status: "error",
      error: error instanceof Error ? error.message : "Sync failed",
    };
    options.onProgress?.(progress);
    return progress;
  }
}

/**
 * Sync all connected accounts
 */
export async function syncAllVendors(
  options: SyncOptions,
): Promise<SyncProgress[]> {
  const results: SyncProgress[] = [];

  for (const account of options.accounts) {
    if (account.credentials.cookie) {
      const result = await syncAccount(account, options);
      results.push(result);
    }
  }

  return results;
}
