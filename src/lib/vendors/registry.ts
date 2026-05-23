import type { VendorAdapter, VendorInfo } from "./types";
import { zomatoAdapter } from "./zomato/adapter";

// Registry of all available vendor adapters
const adapters: Record<string, VendorAdapter> = {
  zomato: zomatoAdapter,
  // Add new vendors here:
  // swiggy: swiggyAdapter,
};

/**
 * Get a vendor adapter by ID
 */
export function getVendor(id: string): VendorAdapter | undefined {
  return adapters[id];
}

/**
 * Get all registered vendors
 */
export function getAllVendors(): VendorAdapter[] {
  return Object.values(adapters);
}

/**
 * Get vendor info for all registered vendors
 */
export function getAllVendorInfo(): VendorInfo[] {
  return Object.values(adapters).map((adapter) => adapter.info);
}

/**
 * Check if a vendor exists
 */
export function hasVendor(id: string): boolean {
  return id in adapters;
}
