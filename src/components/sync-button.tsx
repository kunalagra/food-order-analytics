"use client";

import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Loader2,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCredentials } from "@/lib/credentials-context";
import { clearAllData } from "@/lib/order-store";
import { type SyncProgress, syncAllVendors } from "@/lib/sync-manager";
import { cn } from "@/lib/utils";

interface SyncButtonProps {
  onSyncComplete?: () => void;
  size?: "default" | "sm" | "lg";
  showFullResyncOption?: boolean;
  className?: string;
  accountId?: string; // Optional: Sync only a specific account
  variant?: "default" | "outline" | "ghost" | "secondary" | "link";
}

export function SyncButton({
  onSyncComplete,
  size = "default",
  showFullResyncOption = true,
  className,
  accountId,
  variant,
}: SyncButtonProps) {
  const { accounts } = useCredentials();
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState<SyncProgress | null>(null);
  const [lastResult, setLastResult] = useState<"success" | "error" | null>(
    null,
  );

  const handleSync = useCallback(
    async (forceFullSync = false) => {
      setIsSyncing(true);
      setLastResult(null);

      try {
        // If full resync requested, clear existing data first
        if (forceFullSync) {
          await clearAllData();
        }

        const syncAccounts = accountId
          ? accounts.filter((a) => a.id === accountId)
          : accounts;

        const results = await syncAllVendors({
          accounts: syncAccounts,
          forceFullSync,
          onProgress: setProgress,
        });

        const hasError = results.some((r) => r.status === "error");
        setLastResult(hasError ? "error" : "success");
        onSyncComplete?.();
      } catch {
        setLastResult("error");
      } finally {
        setIsSyncing(false);
        setProgress(null);
      }
    },
    [accounts, onSyncComplete, accountId],
  );

  // Clear result indicator after 3 seconds
  useEffect(() => {
    if (lastResult) {
      const timer = setTimeout(() => setLastResult(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [lastResult]);

  const hasCredentials = accounts.length > 0;
  const connectedCount = accounts.length;

  if (!hasCredentials) {
    return (
      <Button size={size} disabled variant="outline">
        <RefreshCw className="size-4" data-icon="inline-start" />
        No accounts
      </Button>
    );
  }

  const buttonContent = isSyncing ? (
    <>
      <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
      {progress ? (
        <span className="truncate max-w-[120px]">
          {progress.accountName}
          {progress.totalPages > 0 &&
            ` (${progress.currentPage}/${progress.totalPages})`}
        </span>
      ) : (
        "Starting..."
      )}
    </>
  ) : lastResult === "success" ? (
    <>
      <CheckCircle2 className="size-4" data-icon="inline-start" />
      Synced!
    </>
  ) : lastResult === "error" ? (
    <>
      <AlertCircle className="size-4" data-icon="inline-start" />
      Retry
    </>
  ) : (
    <>
      <RefreshCw className="size-4" data-icon="inline-start" />
      {accountId ? "Sync" : `Sync All (${connectedCount})`}
    </>
  );

  if (!showFullResyncOption) {
    return (
      <Button
        size={size}
        onClick={() => handleSync(false)}
        disabled={isSyncing}
        variant={variant || (lastResult === "success" ? "outline" : "default")}
        className={cn(
          className,
          lastResult === "success" ? "border-green-500 text-green-600" : "",
        )}
      >
        {buttonContent}
      </Button>
    );
  }

  return (
    <div className={cn("flex", className)}>
      <Button
        size={size}
        onClick={() => handleSync(false)}
        disabled={isSyncing}
        variant={lastResult === "success" ? "outline" : "default"}
        className={cn(
          "rounded-r-none rounded-l-xl h-11 px-6",
          lastResult === "success" ? "border-green-500 text-green-600" : "",
        )}
      >
        {buttonContent}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={isSyncing}
          render={
            <Button
              size={size}
              variant={lastResult === "success" ? "outline" : "default"}
              className={cn(
                "rounded-l-none rounded-r-xl border-l-0 px-2 h-11",
                lastResult === "success"
                  ? "border-green-500 text-green-600"
                  : "",
              )}
            >
              <ChevronDown className="size-4" />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            onClick={() => handleSync(false)}
            className="gap-2 cursor-pointer"
          >
            <RefreshCw className="size-4" />
            Sync new orders
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => handleSync(true)}
            className="text-destructive gap-2 cursor-pointer focus:text-destructive focus:bg-destructive/10"
          >
            <RotateCcw className="size-4" />
            <div className="flex flex-col">
              <span className="font-medium">Full re-sync</span>
              <span className="text-[10px] opacity-80 font-normal leading-tight">
                Clear all data & reload
              </span>
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
