import { type DBSchema, type IDBPDatabase, openDB } from "idb";
import type { Order } from "@/lib/vendors/types";

interface SyncStatus {
  accountId: string;
  vendorId: string;
  lastOrderId: string | null;
  lastSyncTime: Date | null;
  totalOrders: number;
}

interface OrderDBSchema extends DBSchema {
  orders: {
    key: string;
    value: Order;
    indexes: {
      "by-vendor": string;
      "by-account": string;
      "by-date": Date;
      "by-vendor-date": [string, Date];
    };
  };
  syncStatus: {
    key: string;
    value: SyncStatus;
  };
}

const DB_NAME = "food-aggregator-db";
const DB_VERSION = 2;

let dbPromise: Promise<IDBPDatabase<OrderDBSchema>> | null = null;

function getDB(): Promise<IDBPDatabase<OrderDBSchema>> {
  if (!dbPromise) {
    dbPromise = openDB<OrderDBSchema>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, _newVersion, tx) {
        if (oldVersion < 1) {
          const orderStore = db.createObjectStore("orders", { keyPath: "id" });
          orderStore.createIndex("by-vendor", "vendorId");
          orderStore.createIndex("by-date", "orderDate");
          orderStore.createIndex("by-vendor-date", ["vendorId", "orderDate"]);
          db.createObjectStore("syncStatus", { keyPath: "vendorId" });
        }

        if (oldVersion < 2) {
          const orderStore = tx.objectStore("orders");
          orderStore.createIndex("by-account", "accountId");

          if (db.objectStoreNames.contains("syncStatus")) {
            db.deleteObjectStore("syncStatus");
          }
          db.createObjectStore("syncStatus", { keyPath: "accountId" });
        }
      },
    });
  }
  return dbPromise;
}

/**
 * Save orders to IndexedDB (upsert)
 */
export async function saveOrders(orders: Order[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction("orders", "readwrite");

  await Promise.all([...orders.map((order) => tx.store.put(order)), tx.done]);
}

/**
 * Get all orders from all vendors
 */
export async function getAllOrders(): Promise<Order[]> {
  const db = await getDB();
  const orders = await db.getAll("orders");
  // Sort by date descending
  return orders.sort(
    (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
  );
}

/**
 * Get a single order by ID
 */
export async function getOrderById(id: string): Promise<Order | undefined> {
  const db = await getDB();
  return db.get("orders", id);
}

/**
 * Get orders for a specific vendor
 */
export async function getOrdersByVendor(vendorId: string): Promise<Order[]> {
  const db = await getDB();
  const orders = await db.getAllFromIndex("orders", "by-vendor", vendorId);
  return orders.sort(
    (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
  );
}

/**
 * Get orders for a specific account
 */
export async function getOrdersByAccount(accountId: string): Promise<Order[]> {
  const db = await getDB();
  const orders = await db.getAllFromIndex("orders", "by-account", accountId);
  return orders.sort(
    (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
  );
}

/**
 * Get the most recent order ID for an account
 */
export async function getLatestOrderId(
  accountId: string,
): Promise<string | null> {
  const orders = await getOrdersByAccount(accountId);
  return orders.length > 0 ? orders[0].orderId : null;
}

/**
 * Get sync status for an account
 */
export async function getSyncStatus(
  accountId: string,
): Promise<SyncStatus | null> {
  const db = await getDB();
  const status = await db.get("syncStatus", accountId);
  return status || null;
}

/**
 * Update sync status for an account
 */
export async function updateSyncStatus(
  accountId: string,
  vendorId: string,
  lastOrderId: string | null,
  totalOrders: number,
): Promise<void> {
  const db = await getDB();
  await db.put("syncStatus", {
    accountId,
    vendorId,
    lastOrderId,
    lastSyncTime: new Date(),
    totalOrders,
  });
}

/**
 * Get all sync statuses
 */
export async function getAllSyncStatuses(): Promise<SyncStatus[]> {
  const db = await getDB();
  return db.getAll("syncStatus");
}

/**
 * Get total order count
 */
export async function getOrderCount(): Promise<number> {
  const db = await getDB();
  return db.count("orders");
}

/**
 * Get order count by vendor
 */
export async function getOrderCountByVendor(vendorId: string): Promise<number> {
  const db = await getDB();
  return db.countFromIndex("orders", "by-vendor", vendorId);
}

/**
 * Clear data for a specific account
 */
export async function clearAccountData(accountId: string): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(["orders", "syncStatus"], "readwrite");

  // Delete orders
  const index = tx.objectStore("orders").index("by-account");
  let cursor = await index.openKeyCursor(IDBKeyRange.only(accountId));
  while (cursor) {
    await tx.objectStore("orders").delete(cursor.primaryKey);
    cursor = await cursor.continue();
  }

  // Delete sync status
  await tx.objectStore("syncStatus").delete(accountId);

  await tx.done;
}

/**
 * Clear all data
 */
export async function clearAllData(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(["orders", "syncStatus"], "readwrite");
  await Promise.all([
    tx.objectStore("orders").clear(),
    tx.objectStore("syncStatus").clear(),
    tx.done,
  ]);
}

export type { SyncStatus };
