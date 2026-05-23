"use client";

import { KeyRound, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { SyncButton } from "@/components/sync-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VendorCredentialsDialog } from "@/components/vendor-credentials-dialog";
import { VendorIcon } from "@/components/vendor-icon";
import { CredentialsProvider, useCredentials } from "@/lib/credentials-context";
import { getAllVendorInfo, getVendor } from "@/lib/vendors";

function AccountsContent() {
  const { accounts, getAccountsByVendor, removeAccount } = useCredentials();
  const vendors = getAllVendorInfo();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Accounts</h1>
          <p className="text-muted-foreground">
            Manage your delivery platform connections
          </p>
        </div>
        <div className="flex items-center gap-3">
          {accounts.length > 0 && <SyncButton />}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {vendors.map((vendor) => {
          const vendorAccounts = getAccountsByVendor(vendor.id);
          const adapter = getVendor(vendor.id);
          const _isConnected = vendorAccounts.length > 0;

          return (
            <div key={vendor.id} className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <div
                    className="size-8 rounded-lg flex items-center justify-center shadow-sm overflow-hidden"
                    style={{
                      backgroundColor: `${vendor.color}15`,
                      color: vendor.color,
                    }}
                  >
                    <VendorIcon icon={vendor.icon} size="md" />
                  </div>
                  <h3 className="font-bold">{vendor.name}</h3>
                </div>
                {adapter && (
                  <VendorCredentialsDialog
                    vendor={vendor}
                    instructions={adapter.getAuthInstructions()}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 rounded-lg text-primary hover:text-primary hover:bg-primary/10"
                    >
                      <Plus className="size-4 mr-1" />
                      Add
                    </Button>
                  </VendorCredentialsDialog>
                )}
              </div>

              {vendorAccounts.length > 0 ? (
                <div className="space-y-3">
                  {vendorAccounts.map((account) => (
                    <Card
                      key={account.id}
                      className="overflow-hidden border-none shadow-sm shadow-black/5 bg-background group"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm truncate">
                              {account.name}
                            </h4>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5">
                              {account.id.slice(0, 8)} • Connected
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <SyncButton
                              accountId={account.id}
                              variant="ghost"
                              size="sm"
                              showFullResyncOption={false}
                              className="h-8 rounded-lg px-2 text-xs"
                            />
                            {adapter && (
                              <VendorCredentialsDialog
                                vendor={vendor}
                                instructions={adapter.getAuthInstructions()}
                                accountId={account.id}
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10"
                                >
                                  <KeyRound className="size-3.5" />
                                </Button>
                              </VendorCredentialsDialog>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
                              onClick={() => {
                                if (
                                  confirm(
                                    `Are you sure you want to disconnect "${account.name}"? All data for this account will be cleared.`,
                                  )
                                ) {
                                  removeAccount(account.id);
                                }
                              }}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border-dashed bg-transparent">
                  <CardContent className="p-6 text-center">
                    <p className="text-xs text-muted-foreground">
                      No accounts linked
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          );
        })}
      </div>

      <Card className="border-dashed border-2 bg-transparent">
        <CardContent className="p-8 text-center space-y-3">
          <ShieldCheck className="size-8 text-muted-foreground mx-auto opacity-50" />
          <h3 className="font-bold">Your Privacy Priority</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            We use session cookies to access your order history. These are
            stored
            <strong> only in your browser's local storage</strong> and are never
            transmitted to our servers. You can disconnect at any time to wipe
            the data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AccountsPage() {
  return (
    <CredentialsProvider>
      <AccountsContent />
    </CredentialsProvider>
  );
}
