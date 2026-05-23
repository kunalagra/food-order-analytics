"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { clearAccountData } from "@/lib/order-store";
import type { Account, VendorCredentials } from "@/lib/vendors/types";

interface CredentialsContextType {
  accounts: Account[];
  addAccount: (
    vendorId: string,
    creds: VendorCredentials,
    name?: string,
  ) => void;
  updateAccount: (accountId: string, creds: VendorCredentials) => void;
  removeAccount: (accountId: string) => Promise<void>;
  getAccountsByVendor: (vendorId: string) => Account[];
  hasCredentials: (vendorId: string) => boolean;
}

const CredentialsContext = createContext<CredentialsContextType | null>(null);

const STORAGE_KEY = "food-aggregator-accounts";

export function CredentialsProvider({ children }: { children: ReactNode }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setAccounts(JSON.parse(stored));
      }
    } catch {}
    setIsLoaded(true);
  }, []);

  // Save to localStorage when accounts change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    }
  }, [accounts, isLoaded]);

  const addAccount = (
    vendorId: string,
    creds: VendorCredentials,
    name?: string,
  ) => {
    const newAccount: Account = {
      id: crypto.randomUUID(),
      vendorId,
      name:
        name ||
        `${vendorId === "zomato" ? "Zomato" : "Swiggy"} Account ${getAccountsByVendor(vendorId).length + 1}`,
      credentials: creds,
    };
    setAccounts((prev) => [...prev, newAccount]);
  };

  const updateAccount = (accountId: string, creds: VendorCredentials) => {
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === accountId ? { ...acc, credentials: creds } : acc,
      ),
    );
  };

  const removeAccount = async (accountId: string) => {
    // Clear data from IndexedDB
    await clearAccountData(accountId);

    // Remove from state
    setAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
  };

  const getAccountsByVendor = (vendorId: string) => {
    return accounts.filter(
      (acc) => acc.id === vendorId || acc.vendorId === vendorId,
    );
  };

  const hasCredentials = (vendorId: string) => {
    return accounts.some((acc) => acc.vendorId === vendorId);
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <CredentialsContext.Provider
      value={{
        accounts,
        addAccount,
        updateAccount,
        removeAccount,
        getAccountsByVendor,
        hasCredentials,
      }}
    >
      {children}
    </CredentialsContext.Provider>
  );
}

export function useCredentials() {
  const context = useContext(CredentialsContext);
  if (!context) {
    throw new Error("useCredentials must be used within a CredentialsProvider");
  }
  return context;
}
