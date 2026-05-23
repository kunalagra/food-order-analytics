"use client";

import { ExternalLink, KeyRound } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { VendorIcon } from "@/components/vendor-icon";
import { useCredentials } from "@/lib/credentials-context";
import type { VendorInfo } from "@/lib/vendors/types";

interface VendorCredentialsDialogProps {
  vendor: VendorInfo;
  instructions: string;
  accountId?: string; // If provided, we're updating
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export function VendorCredentialsDialog({
  vendor,
  instructions,
  accountId,
  onSuccess,
  children,
}: VendorCredentialsDialogProps) {
  const { accounts, addAccount, updateAccount } = useCredentials();
  const [open, setOpen] = useState(false);
  const [cookieValue, setCookieValue] = useState("");
  const [accountName, setAccountName] = useState("");

  const account = accountId ? accounts.find((a) => a.id === accountId) : null;
  const isConnected = !!account;

  const handleSave = () => {
    if (cookieValue.trim()) {
      if (accountId) {
        updateAccount(accountId, { cookie: cookieValue.trim() });
      } else {
        addAccount(
          vendor.id,
          { cookie: cookieValue.trim() },
          accountName.trim(),
        );
      }
      setCookieValue("");
      setAccountName("");
      setOpen(false);
      onSuccess?.();
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen && account) {
      setCookieValue(account.credentials.cookie || "");
      setAccountName(account.name || "");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          (children as React.ReactNode) || (
            <Button
              variant={isConnected ? "outline" : "default"}
              size="sm"
              style={{
                backgroundColor: isConnected ? undefined : vendor.color,
                borderColor: isConnected ? vendor.color : undefined,
                color: isConnected ? vendor.color : "white",
              }}
            >
              <KeyRound className="size-4 mr-2" />
              {isConnected ? "Update" : "Connect"}
            </Button>
          )
        }
      />

      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <VendorIcon icon={vendor.icon} size="md" />
            {isConnected
              ? `Update ${account?.name}`
              : `Connect to ${vendor.name}`}
          </DialogTitle>
          <DialogDescription>
            Enter your {vendor.name} authentication cookie to fetch your order
            history.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto flex-1 py-4">
          {!accountId && (
            <div className="space-y-2">
              <label htmlFor="account-name" className="text-sm font-medium">
                Account Name (Optional)
              </label>
              <input
                id="account-name"
                type="text"
                placeholder="e.g. Personal, Office"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          )}

          <div className="rounded-lg bg-muted/50 p-3 text-sm">
            <div className="font-medium mb-2">How to get your cookie:</div>
            <div className="text-muted-foreground whitespace-pre-wrap text-[11px] leading-relaxed">
              {instructions}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="cookie-input" className="text-sm font-medium">
              Cookie Value
            </label>
            <Textarea
              id="cookie-input"
              placeholder="Paste your cookie here..."
              value={cookieValue}
              onChange={(e) => setCookieValue(e.target.value)}
              className="min-h-[100px] max-h-[150px] font-mono text-xs break-all resize-none"
              style={{ fieldSizing: "fixed" } as React.CSSProperties}
            />
          </div>

          {vendor.id === "zomato" && (
            <a
              href="https://www.zomato.com/mumbai/order-history"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="size-3" />
              Open Zomato Order History
            </a>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleSave}
            disabled={!cookieValue.trim()}
            className="w-full"
            style={{ backgroundColor: vendor.color }}
          >
            {isConnected ? "Update Credentials" : "Link Account"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
